import { NextResponse } from "next/server";

import {
  MAX_FIRST_TEAM_PLAYERS,
  USER_CLUB_ID,
} from "@/lib/game-config";
import { getMarketCommitments } from "@/lib/market-commitments";
import { prisma } from "@/lib/prisma";

class FreeAgentSigningError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "FreeAgentSigningError";
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        {
          error: "Dati dell'ingaggio non validi.",
        },
        {
          status: 400,
        }
      );
    }

    const signingData = body as {
      listingId?: unknown;
    };
    const listingId = Number(signingData.listingId);

    if (
      !Number.isInteger(listingId) ||
      listingId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Svincolato selezionato non valido.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await prisma.$transaction(
      async (transaction) => {
        const lockedClub = await transaction.$queryRaw<
          { id: number }[]
        >`
          SELECT "id"
          FROM "Club"
          WHERE "id" = ${USER_CLUB_ID}
          FOR UPDATE
        `;

        if (lockedClub.length === 0) {
          throw new FreeAgentSigningError(
            "Club principale non disponibile.",
            404
          );
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
          throw new FreeAgentSigningError(
            "Lo svincolato selezionato non è disponibile.",
            404
          );
        }

        const [club, listing, commitments] =
          await Promise.all([
            transaction.club.findUnique({
              where: {
                id: USER_CLUB_ID,
              },
              select: {
                balance: true,
                _count: {
                  select: {
                    players: true,
                  },
                },
              },
            }),
            transaction.transferListing.findUnique({
              where: {
                id: listingId,
              },
              include: {
                player: {
                  select: {
                    id: true,
                    clubId: true,
                    firstName: true,
                    lastName: true,
                    salary: true,
                  },
                },
              },
            }),
            getMarketCommitments(
              transaction,
              USER_CLUB_ID
            ),
          ]);

        if (!club || !listing) {
          throw new FreeAgentSigningError(
            "Dati dell'ingaggio non disponibili.",
            404
          );
        }

        if (
          listing.status !== "ACTIVE" ||
          listing.listingType !== "FREE_AGENT" ||
          listing.sellerClubId !== null ||
          listing.player.clubId !== null ||
          !listing.endsAt ||
          listing.endsAt.getTime() <= Date.now()
        ) {
          throw new FreeAgentSigningError(
            "Questo giocatore non è più svincolato.",
            409
          );
        }

        const occupiedRosterPlaces =
          club._count.players +
          commitments.reservedRosterPlaces;

        if (
          occupiedRosterPlaces >=
          MAX_FIRST_TEAM_PLAYERS
        ) {
          const hasFullRoster =
            club._count.players >=
            MAX_FIRST_TEAM_PLAYERS;

          throw new FreeAgentSigningError(
            hasFullRoster
              ? `Hai già raggiunto la quantità massima di ${MAX_FIRST_TEAM_PLAYERS} giocatori.`
              : `Hai già raggiunto la quantità massima di ${MAX_FIRST_TEAM_PLAYERS} giocatori considerando le aste in cui sei in vantaggio.`,
            400
          );
        }

        const availableBalance = Math.max(
          0,
          club.balance - commitments.reservedCredits
        );

        if (listing.player.salary > availableBalance) {
          throw new FreeAgentSigningError(
            `Lo stipendio è ${formatCurrency(
              listing.player.salary
            )}. Saldo disponibile: ${formatCurrency(
              availableBalance
            )}.`,
            400
          );
        }

        const playerName = `${listing.player.firstName} ${listing.player.lastName}`;
        const completedAt = new Date();

        await transaction.club.update({
          where: {
            id: USER_CLUB_ID,
          },
          data: {
            balance: {
              decrement: listing.player.salary,
            },
          },
        });

        await transaction.player.update({
          where: {
            id: listing.player.id,
          },
          data: {
            clubId: USER_CLUB_ID,
          },
        });

        await transaction.transferListing.update({
          where: {
            id: listingId,
          },
          data: {
            status: "COMPLETED",
            winnerClubId: USER_CLUB_ID,
            finalPrice: 0,
            completedAt,
          },
        });

        await transaction.gameEvent.create({
          data: {
            clubId: USER_CLUB_ID,
            type: "TRANSFER_FREE_AGENT_SIGNED",
            title: `Svincolato ingaggiato: ${playerName}`,
            description: `${playerName} è entrato nella rosa. È stato addebitato lo stipendio di ${formatCurrency(
              listing.player.salary
            )}.`,
          },
        });

        return {
          listingId,
          playerName,
          salary: listing.player.salary,
          completedAt: completedAt.toISOString(),
        };
      }
    );

    return NextResponse.json(
      {
        message: `${result.playerName} è stato ingaggiato. Stipendio addebitato: ${formatCurrency(
          result.salary
        )}.`,
        signing: result,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    if (error instanceof FreeAgentSigningError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "Errore durante l'ingaggio dello svincolato:",
      error
    );

    return NextResponse.json(
      {
        error: "Impossibile completare l'ingaggio.",
      },
      {
        status: 500,
      }
    );
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
