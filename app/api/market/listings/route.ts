import { NextResponse } from "next/server";

import {
  MIN_FIRST_TEAM_PLAYERS,
} from "@/lib/game-config";
import { getApiClubAccess } from "@/lib/api-club-access";
import {
  AUCTION_DURATION_HOURS,
  getAuctionDeadline,
} from "@/lib/market-rules";
import { prisma } from "@/lib/prisma";

const MAXIMUM_LISTING_PRICE = 2_147_483_647;

class MarketListingError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "MarketListingError";
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
          error: "Dati dell'asta non validi.",
        },
        {
          status: 400,
        }
      );
    }

    const listingData = body as {
      playerId?: unknown;
      openingPrice?: unknown;
    };
    const playerId = Number(listingData.playerId);
    const openingPrice = Number(
      listingData.openingPrice
    );

    if (
      !Number.isInteger(playerId) ||
      playerId <= 0 ||
      !Number.isInteger(openingPrice) ||
      openingPrice <= 0 ||
      openingPrice > MAXIMUM_LISTING_PRICE
    ) {
      return NextResponse.json(
        {
          error:
            "Giocatore o prezzo iniziale non validi.",
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
          throw new MarketListingError(
            "Club principale non disponibile.",
            404
          );
        }

        const lockedPlayer =
          await transaction.$queryRaw<
            { id: number }[]
          >`
            SELECT "id"
            FROM "Player"
            WHERE "id" = ${playerId}
            FOR UPDATE
          `;

        if (lockedPlayer.length === 0) {
          throw new MarketListingError(
            "Il giocatore selezionato non esiste.",
            404
          );
        }

        const [club, player, activeSales, existingListing] =
          await Promise.all([
            transaction.club.findUnique({
              where: {
                id: clubId,
              },
              select: {
                _count: {
                  select: {
                    players: true,
                  },
                },
              },
            }),
            transaction.player.findUnique({
              where: {
                id: playerId,
              },
              select: {
                clubId: true,
                firstName: true,
                lastName: true,
              },
            }),
            transaction.transferListing.count({
              where: {
                sellerClubId: clubId,
                listingType: "AUCTION",
                status: {
                  in: [
                    "ACTIVE",
                    "PENDING_TRANSFER",
                  ],
                },
              },
            }),
            transaction.transferListing.findFirst({
              where: {
                playerId,
                status: {
                  in: [
                    "ACTIVE",
                    "PENDING_TRANSFER",
                  ],
                },
              },
              select: {
                id: true,
              },
            }),
          ]);

        if (!club || !player) {
          throw new MarketListingError(
            "Dati del giocatore non disponibili.",
            404
          );
        }

        if (player.clubId !== clubId) {
          throw new MarketListingError(
            "Puoi mettere all'asta soltanto un tuo giocatore.",
            403
          );
        }

        if (existingListing) {
          throw new MarketListingError(
            "Questo giocatore è già presente nella lista trasferimenti.",
            409
          );
        }

        const availablePlayersForSale =
          club._count.players - activeSales;

        if (
          availablePlayersForSale <=
          MIN_FIRST_TEAM_PLAYERS
        ) {
          throw new MarketListingError(
            `Devi conservare almeno ${MIN_FIRST_TEAM_PLAYERS} giocatori non impegnati in altre vendite.`,
            400
          );
        }

        const startsAt = new Date();
        const endsAt = getAuctionDeadline(startsAt);
        const playerName = `${player.firstName} ${player.lastName}`;

        const listing =
          await transaction.transferListing.create({
            data: {
              playerId,
              sellerClubId: clubId,
              listingType: "AUCTION",
              status: "ACTIVE",
              openingPrice,
              startsAt,
              endsAt,
            },
            select: {
              id: true,
            },
          });

        await transaction.gameEvent.create({
          data: {
            clubId,
            type: "TRANSFER_PLAYER_LISTED",
            title: `Giocatore all'asta: ${playerName}`,
            description: `${playerName} è stato messo all'asta per ${formatCurrency(
              openingPrice
            )}. L'asta durerà ${AUCTION_DURATION_HOURS} ore e non può essere ritirata.`,
          },
        });

        return {
          listingId: listing.id,
          playerId,
          playerName,
          openingPrice,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        };
      }
    );

    return NextResponse.json(
      {
        message: `${result.playerName} è stato messo all'asta per ${formatCurrency(
          result.openingPrice
        )}.`,
        listing: result,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    if (error instanceof MarketListingError) {
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
      "Errore durante la pubblicazione dell'asta:",
      error
    );

    return NextResponse.json(
      {
        error: "Impossibile pubblicare l'asta.",
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
