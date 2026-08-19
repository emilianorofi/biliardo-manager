import { NextResponse } from "next/server";

import {
  MAX_FIRST_TEAM_PLAYERS,
} from "@/lib/game-config";
import { getApiClubAccess } from "@/lib/api-club-access";
import {
  AUCTION_EXTENSION_MINUTES,
  getExtendedDeadline,
  getMinimumBid,
} from "@/lib/market-rules";
import { getMarketCommitments } from "@/lib/market-commitments";
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
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
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
          WHERE "id" = ${clubId}
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

        const [club, listing, commitments] =
          await Promise.all([
            transaction.club.findUnique({
              where: {
                id: clubId,
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
                    clubId: true,
                    careerStatus: true,
                    firstName: true,
                    lastName: true,
                    salary: true,
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
            getMarketCommitments(
              transaction,
              clubId,
              listingId
            ),
          ]);

        if (!club || !listing) {
          throw new MarketBidError(
            "Dati dell'asta non disponibili.",
            404
          );
        }

        if (
          listing.status !== "ACTIVE" ||
          listing.listingType !== "AUCTION" ||
          listing.player.careerStatus !== "ACTIVE"
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
          listing.sellerClubId === clubId ||
          listing.player.clubId === clubId
        ) {
          throw new MarketBidError(
            "Non puoi fare un'offerta per un tuo giocatore.",
            400
          );
        }

        const highestBid = listing.bids[0] ?? null;

        if (
          highestBid?.bidderClubId === clubId
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

          throw new MarketBidError(
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

        const totalCommitment =
          amount + listing.player.salary;

        if (totalCommitment > availableBalance) {
          throw new MarketBidError(
            `Per questa offerta servono ${formatCurrency(
              totalCommitment
            )}, compreso lo stipendio di ${formatCurrency(
              listing.player.salary
            )}. Saldo disponibile: ${formatCurrency(
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
            bidderClubId: clubId,
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

        const playerName = `${listing.player.firstName} ${listing.player.lastName}`;
        const minimumNextBid =
          getMinimumBid(amount);
        const bidEvents: {
          clubId: number;
          type: string;
          title: string;
          description: string;
        }[] = [];

        if (highestBid) {
          bidEvents.push({
            clubId: highestBid.bidderClubId,
            type: "TRANSFER_BID_OUTBID",
            title: `Offerta superata: ${playerName}`,
            description: `Un altro club ha offerto ${formatCurrency(
              amount
            )}. Per tornare in testa servirà almeno ${formatCurrency(
              minimumNextBid
            )}.`,
          });
        }

        if (listing.sellerClubId) {
          bidEvents.push({
            clubId: listing.sellerClubId,
            type: "TRANSFER_NEW_BID",
            title: `Nuova offerta: ${playerName}`,
            description: `È stata presentata un'offerta di ${formatCurrency(
              amount
            )}. La prossima offerta minima sarà ${formatCurrency(
              minimumNextBid
            )}.${
              shouldExtend
                ? ` La scadenza è stata riportata a ${AUCTION_EXTENSION_MINUTES} minuti.`
                : ""
            }`,
          });
        }

        if (bidEvents.length > 0) {
          await transaction.gameEvent.createMany({
            data: bidEvents,
          });
        }

        return {
          playerName,
          amount,
          salary: listing.player.salary,
          totalCommitment,
          minimumNextBid,
          endsAt: endsAt.toISOString(),
          wasExtended: shouldExtend,
        };
      }
    );

    const extensionMessage = result.wasExtended
      ? ` L'asta è stata prorogata: la nuova scadenza è tra ${AUCTION_EXTENSION_MINUTES} minuti.`
      : "";

    return NextResponse.json(
      {
        message: `Offerta di ${formatCurrency(
          result.amount
        )} registrata per ${result.playerName}. In caso di vittoria saranno addebitati ${formatCurrency(
          result.totalCommitment
        )}, compreso lo stipendio.${extensionMessage}`,
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
