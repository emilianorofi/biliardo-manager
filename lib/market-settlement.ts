import "server-only";

import {
  MAX_FIRST_TEAM_PLAYERS,
  MIN_FIRST_TEAM_PLAYERS,
} from "@/lib/game-config";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_SETTLEMENT_ATTEMPTS = 3;

class SettlementRetryError extends Error {}

export type SettlementOutcome = {
  listingId: number;
  playerName: string;
  status:
    | "COMPLETED"
    | "EXPIRED"
    | "CANCELLED"
    | "PENDING_TRANSFER";
  winnerClubId: number | null;
  finalPrice: number | null;
};

export async function settleExpiredAuctions(
  now = new Date()
) {
  const expiredListings =
    await prisma.transferListing.findMany({
      where: {
        listingType: "AUCTION",
        OR: [
          {
            status: "ACTIVE",
            endsAt: {
              lte: now,
            },
          },
          {
            status: "PENDING_TRANSFER",
          },
        ],
      },
      select: {
        id: true,
      },
      orderBy: {
        endsAt: "asc",
      },
    });

  const outcomes: SettlementOutcome[] = [];

  for (const listing of expiredListings) {
    const outcome = await settleListingWithRetry(
      listing.id,
      now
    );

    if (outcome) {
      outcomes.push(outcome);
    }
  }

  return outcomes;
}

async function settleListingWithRetry(
  listingId: number,
  now: Date
) {
  for (
    let attempt = 1;
    attempt <= MAX_SETTLEMENT_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await settleListing(listingId, now);
    } catch (error: unknown) {
      const shouldRetry =
        error instanceof SettlementRetryError &&
        attempt < MAX_SETTLEMENT_ATTEMPTS;

      if (!shouldRetry) {
        throw error;
      }
    }
  }

  return null;
}

async function settleListing(
  listingId: number,
  now: Date
) {
  return prisma.$transaction(async (transaction) => {
    const snapshot =
      await transaction.transferListing.findUnique({
        where: {
          id: listingId,
        },
        select: {
          sellerClubId: true,
          bids: {
            orderBy: [
              {
                amount: "desc",
              },
              {
                createdAt: "asc",
              },
            ],
            take: 1,
            select: {
              id: true,
              bidderClubId: true,
            },
          },
        },
      });

    if (!snapshot) {
      return null;
    }

    const expectedWinningBid =
      snapshot.bids[0] ?? null;
    const clubIdsToLock = Array.from(
      new Set(
        [
          snapshot.sellerClubId,
          expectedWinningBid?.bidderClubId,
        ].filter(
          (clubId): clubId is number =>
            clubId !== null && clubId !== undefined
        )
      )
    ).sort((first, second) => first - second);

    for (const clubId of clubIdsToLock) {
      await transaction.$queryRaw`
        SELECT "id"
        FROM "Club"
        WHERE "id" = ${clubId}
        FOR UPDATE
      `;
    }

    const lockedListing =
      await transaction.$queryRaw<
        { id: number }[]
      >`
        SELECT "id"
        FROM "TransferListing"
        WHERE "id" = ${listingId}
        FOR UPDATE
      `;

    if (lockedListing.length === 0) {
      return null;
    }

    const listing =
      await transaction.transferListing.findUnique({
        where: {
          id: listingId,
        },
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              salary: true,
              clubId: true,
              careerStatus: true,
            },
          },
          bids: {
            orderBy: [
              {
                amount: "desc",
              },
              {
                createdAt: "asc",
              },
            ],
            take: 1,
            select: {
              id: true,
              bidderClubId: true,
              amount: true,
            },
          },
        },
      });

    if (
      !listing ||
      ![
        "ACTIVE",
        "PENDING_TRANSFER",
      ].includes(listing.status) ||
      listing.listingType !== "AUCTION" ||
      !listing.endsAt ||
      (listing.status === "ACTIVE" &&
        listing.endsAt.getTime() > now.getTime())
    ) {
      return null;
    }

    const winningBid = listing.bids[0] ?? null;

    if (
      winningBid?.id !== expectedWinningBid?.id
    ) {
      throw new SettlementRetryError(
        "L'offerta migliore è cambiata durante la chiusura."
      );
    }

    const playerName = `${listing.player.firstName} ${listing.player.lastName}`;

    if (!winningBid && listing.status === "ACTIVE") {
      await transaction.transferListing.update({
        where: {
          id: listingId,
        },
        data: {
          status: "EXPIRED",
          completedAt: now,
          finalPrice: null,
          winnerClubId: null,
        },
      });

      if (listing.sellerClubId) {
        await transaction.gameEvent.create({
          data: {
            clubId: listing.sellerClubId,
            type: "TRANSFER_AUCTION_EXPIRED",
            title: `Asta scaduta: ${playerName}`,
            description:
              "L'asta è terminata senza offerte valide.",
          },
        });
      }

      return {
        listingId,
        playerName,
        status: "EXPIRED" as const,
        winnerClubId: null,
        finalPrice: null,
      };
    }

    if (!winningBid) {
      return null;
    }

    const [winnerClub, sellerClub] =
      await Promise.all([
        transaction.club.findUnique({
        where: {
          id: winningBid.bidderClubId,
        },
        select: {
          id: true,
          name: true,
          balance: true,
          _count: {
            select: {
              players: true,
            },
          },
        },
        }),
        listing.sellerClubId
          ? transaction.club.findUnique({
              where: {
                id: listing.sellerClubId,
              },
              select: {
                _count: {
                  select: {
                    players: true,
                  },
                },
              },
            })
          : null,
      ]);

    const totalCharge =
      winningBid.amount + listing.player.salary;

    const winnerIsEligible =
      winnerClub !== null &&
      winnerClub.balance >= totalCharge &&
      winnerClub._count.players <
        MAX_FIRST_TEAM_PLAYERS;

    const sellerIsEligible =
      listing.player.careerStatus === "ACTIVE" &&
      (listing.sellerClubId === null ||
        (sellerClub !== null &&
          listing.player.clubId ===
            listing.sellerClubId &&
          sellerClub._count.players >
            MIN_FIRST_TEAM_PLAYERS));

    if (
      !winnerClub ||
      !winnerIsEligible ||
      !sellerIsEligible
    ) {
      await transaction.transferListing.update({
        where: {
          id: listingId,
        },
        data: {
          status: "CANCELLED",
          completedAt: now,
          finalPrice: null,
          winnerClubId: null,
        },
      });

      const cancellationEvents = [
        listing.sellerClubId
          ? {
              clubId: listing.sellerClubId,
              type: "TRANSFER_AUCTION_CANCELLED",
              title: `Asta annullata: ${playerName}`,
              description:
                "Alla chiusura non erano più rispettati i requisiti economici o di rosa.",
            }
          : null,
        winnerClub
          ? {
              clubId: winnerClub.id,
              type: "TRANSFER_BID_CANCELLED",
              title: `Acquisto annullato: ${playerName}`,
              description:
                "Alla chiusura non erano disponibili fondi o posti rosa sufficienti.",
            }
          : null,
      ].filter(
        (
          event
        ): event is {
          clubId: number;
          type: string;
          title: string;
          description: string;
        } => event !== null
      );

      if (cancellationEvents.length > 0) {
        await transaction.gameEvent.createMany({
          data: cancellationEvents,
        });
      }

      return {
        listingId,
        playerName,
        status: "CANCELLED" as const,
        winnerClubId: null,
        finalPrice: null,
      };
    }

    const playerIsInActiveMatch =
      listing.sellerClubId !== null &&
      (await isPlayerInActiveMatch(
        transaction,
        listing.sellerClubId,
        listing.player.id
      ));

    if (playerIsInActiveMatch) {
      if (listing.status === "PENDING_TRANSFER") {
        return null;
      }

      await transaction.transferListing.update({
        where: {
          id: listingId,
        },
        data: {
          status: "PENDING_TRANSFER",
          winnerClubId: winnerClub.id,
          finalPrice: winningBid.amount,
          completedAt: null,
        },
      });

      const pendingEvents = [
        {
          clubId: winnerClub.id,
          type: "TRANSFER_AUCTION_PENDING_MATCH",
          title: `Trasferimento in attesa: ${playerName}`,
          description:
            "L'asta è terminata, ma il giocatore è impegnato in una partita. Il trasferimento sarà completato al termine dell'incontro.",
        },
        listing.sellerClubId
          ? {
              clubId: listing.sellerClubId,
              type: "TRANSFER_SALE_PENDING_MATCH",
              title: `Cessione in attesa: ${playerName}`,
              description:
                "Il giocatore terminerà la partita in corso prima di trasferirsi.",
            }
          : null,
      ].filter(
        (
          event
        ): event is {
          clubId: number;
          type: string;
          title: string;
          description: string;
        } => event !== null
      );

      await transaction.gameEvent.createMany({
        data: pendingEvents,
      });

      return {
        listingId,
        playerName,
        status: "PENDING_TRANSFER" as const,
        winnerClubId: winnerClub.id,
        finalPrice: winningBid.amount,
      };
    }

    await transaction.club.update({
      where: {
        id: winnerClub.id,
      },
      data: {
        balance: {
          decrement: totalCharge,
        },
      },
    });

    if (listing.sellerClubId) {
      await transaction.club.update({
        where: {
          id: listing.sellerClubId,
        },
        data: {
          balance: {
            increment: winningBid.amount,
          },
        },
      });
    }

    await transaction.player.update({
      where: {
        id: listing.player.id,
      },
      data: {
        clubId: winnerClub.id,
      },
    });

    if (listing.sellerClubId) {
      const sellerFormation =
        await transaction.formation.findUnique({
          where: {
            clubId: listing.sellerClubId,
          },
        });

      const playerWasSelected =
        sellerFormation?.slotAPlayerId ===
          listing.player.id ||
        sellerFormation?.slotBPlayerId ===
          listing.player.id ||
        sellerFormation?.slotCPlayerId ===
          listing.player.id;

      if (sellerFormation && playerWasSelected) {
        await transaction.formation.update({
          where: {
            clubId: listing.sellerClubId,
          },
          data: {
            slotAPlayerId:
              sellerFormation.slotAPlayerId ===
              listing.player.id
                ? null
                : sellerFormation.slotAPlayerId,
            slotBPlayerId:
              sellerFormation.slotBPlayerId ===
              listing.player.id
                ? null
                : sellerFormation.slotBPlayerId,
            slotCPlayerId:
              sellerFormation.slotCPlayerId ===
              listing.player.id
                ? null
                : sellerFormation.slotCPlayerId,
            savedAt: null,
          },
        });
      }
    }

    await transaction.transferListing.update({
      where: {
        id: listingId,
      },
      data: {
        status: "COMPLETED",
        winnerClubId: winnerClub.id,
        finalPrice: winningBid.amount,
        completedAt: now,
      },
    });

    const completionEvents = [
      {
        clubId: winnerClub.id,
        type: "TRANSFER_AUCTION_WON",
        title: `Asta vinta: ${playerName}`,
        description: `${playerName} è entrato nella rosa. Sono stati addebitati ${formatCurrency(
          winningBid.amount
        )} per l'acquisto e ${formatCurrency(
          listing.player.salary
        )} di stipendio.`,
      },
      listing.sellerClubId
        ? {
            clubId: listing.sellerClubId,
            type: "TRANSFER_PLAYER_SOLD",
            title: `Giocatore ceduto: ${playerName}`,
            description: `${playerName} è stato ceduto a ${winnerClub.name} per ${formatCurrency(
              winningBid.amount
            )}.`,
          }
        : null,
    ].filter(
      (
        event
      ): event is {
        clubId: number;
        type: string;
        title: string;
        description: string;
      } => event !== null
    );

    await transaction.gameEvent.createMany({
      data: completionEvents,
    });

    return {
      listingId,
      playerName,
      status: "COMPLETED" as const,
      winnerClubId: winnerClub.id,
      finalPrice: winningBid.amount,
    };
  });
}

async function isPlayerInActiveMatch(
  transaction: Prisma.TransactionClient,
  clubId: number,
  playerId: number
) {
  const formation =
    await transaction.formation.findUnique({
      where: {
        clubId,
      },
      select: {
        slotAPlayerId: true,
        slotBPlayerId: true,
        slotCPlayerId: true,
      },
    });

  const playerIsSelected =
    formation?.slotAPlayerId === playerId ||
    formation?.slotBPlayerId === playerId ||
    formation?.slotCPlayerId === playerId;

  if (!playerIsSelected) {
    return false;
  }

  const activeFixture =
    await transaction.leagueFixture.findFirst({
      where: {
        status: "IN_PROGRESS",
        OR: [
          {
            homeClubId: clubId,
          },
          {
            awayClubId: clubId,
          },
        ],
      },
      select: {
        id: true,
      },
    });

  return activeFixture !== null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
