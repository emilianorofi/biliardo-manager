import { NextResponse } from "next/server";

import { USER_CLUB_ID } from "@/lib/game-config";
import {
  AUCTION_EXTENSION_MINUTES,
  getExtendedDeadline,
  getMinimumBid,
} from "@/lib/market-rules";
import { prisma } from "@/lib/prisma";

class MarketBidError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "MarketBidError";
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        {
          error: "Dati dell'offerta non validi.",
        },
        {
          status: 400,
        }
      );
    }

    const bidData = body as {
      listingId?: unknown;
      amount?: unknown;
    };

    const listingId = Number(bidData.listingId);
    const amount = Number(bidData.amount);

    if (
      !Number.isInteger(listingId) ||
      listingId <= 0 ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Inserzione o importo dell'offerta non validi.",
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
          throw new MarketBidError(
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
          throw new MarketBidError(
            "L'asta selezionata non esiste.",
            404
          );
        }

        const now = new Date();

        const [club, listing, otherAuctions] =
          await Promise.all([
            transaction.club.findUnique({
              where: {
                id: USER_CLUB_ID,
              },
              select: {
                balance: true,
              },
            }),
            transaction.transferListing.findUnique({
              where: {
                id: listingId,
              },
              include: {
                player: {
                  select: {
                    clubId: true,
                    firstName: true,
                    lastName: true,
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
                    amount: true,
                    bidderClubId: true,
                  },
                },
              },
            }),
            transaction.transferListing.findMany({
              where: {
                id: {
                  not: listingId,
                },
                listingType: "AUCTION",
                status: "ACTIVE",
                endsAt: {
                  gt: now,
                },
                bids: {
                  some: {
                    bidderClubId: USER_CLUB_ID,
                  },
                },
              },
              select: {
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
                    amount: true,
                    bidderClubId: true,
                  },
                },
              },
            }),
          ]);

        if (!club || !listing) {
          throw new MarketBidError(
            "Dati dell'asta non disponibili.",
            404
          );
        }

        if (
          listing.status !== "ACTIVE" ||
          listing.listingType !== "AUCTION"
        ) {
          throw new MarketBidError(
            "Questa inserzione non è un'asta attiva.",
            400
          );
        }

        if (
          !listing.endsAt ||
          listing.endsAt.getTime() <= now.getTime()
        ) {
          throw new MarketBidError(
            "L'asta è già terminata.",
            409
          );
        }

        if (
          listing.sellerClubId === USER_CLUB_ID ||
          listing.player.clubId === USER_CLUB_ID
        ) {
          throw new MarketBidError(
            "Non puoi fare un'offerta per un tuo giocatore.",
            400
          );
        }

        const highestBid = listing.bids[0] ?? null;

        if (
          highestBid?.bidderClubId === USER_CLUB_ID
        ) {
          throw new MarketBidError(
            "La tua offerta è già la migliore.",
            409
          );
        }

        const currentPrice =
          highestBid?.amount ?? listing.openingPrice;
        const minimumBid = getMinimumBid(currentPrice);

        if (amount < minimumBid) {
          throw new MarketBidError(
            `L'offerta minima è ${formatCurrency(
              minimumBid
            )}.`,
            400
          );
        }

        const reservedOnOtherAuctions =
          otherAuctions.reduce(
            (total, auction) => {
              const leadingBid = auction.bids[0];

              if (
                leadingBid?.bidderClubId !==
                USER_CLUB_ID
              ) {
                return total;
              }

              return total + leadingBid.amount;
            },
            0
          );

        const availableBalance = Math.max(
          0,
          club.balance - reservedOnOtherAuctions
        );

        if (amount > availableBalance) {
          throw new MarketBidError(
            `Saldo disponibile per questa asta: ${formatCurrency(
              availableBalance
            )}.`,
            400
          );
        }

        const extensionWindowMilliseconds =
          AUCTION_EXTENSION_MINUTES * 60 * 1000;
        const shouldExtend =
          listing.endsAt.getTime() - now.getTime() <=
          extensionWindowMilliseconds;
        const endsAt = shouldExtend
          ? getExtendedDeadline(now)
          : listing.endsAt;

        await transaction.transferBid.create({
          data: {
            listingId,
            bidderClubId: USER_CLUB_ID,
            amount,
          },
        });

        if (shouldExtend) {
          await transaction.transferListing.update({
            where: {
              id: listingId,
            },
            data: {
              endsAt,
            },
          });
        }

        return {
          playerName: `${listing.player.firstName} ${listing.player.lastName}`,
          amount,
          minimumNextBid: getMinimumBid(amount),
          endsAt: endsAt.toISOString(),
          wasExtended: shouldExtend,
        };
      }
    );

    return NextResponse.json(
      {
        message: `Offerta di ${formatCurrency(
          result.amount
        )} registrata per ${result.playerName}.`,
        bid: result,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    if (error instanceof MarketBidError) {
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
      "Errore durante la registrazione dell'offerta:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile registrare l'offerta.",
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
