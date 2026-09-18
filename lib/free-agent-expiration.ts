import "server-only";

import { prisma } from "@/lib/prisma";

export type FreeAgentExpirationOutcome = {
  listingId: number;
  playerId: number;
  playerName: string;
  expiredAt: string;
};

export async function expireUnavailableFreeAgents(
  now = new Date()
) {
  const expiredListings =
    await prisma.transferListing.findMany({
      where: {
        listingType: "FREE_AGENT",
        status: "ACTIVE",
        endsAt: {
          lte: now,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        endsAt: "asc",
      },
    });

  const outcomes: FreeAgentExpirationOutcome[] = [];

  for (const expiredListing of expiredListings) {
    const outcome = await prisma.$transaction(
      async (transaction) => {
        const lockedListing =
          await transaction.$queryRaw<
            { id: number }[]
          >`
            SELECT "id"
            FROM "TransferListing"
            WHERE "id" = ${expiredListing.id}
            FOR UPDATE
          `;

        if (lockedListing.length === 0) {
          return null;
        }

        const listing =
          await transaction.transferListing.findUnique({
            where: {
              id: expiredListing.id,
            },
            select: {
              id: true,
              listingType: true,
              status: true,
              endsAt: true,
              player: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  clubId: true,
                  careerStatus: true,
                },
              },
            },
          });

        if (
          !listing ||
          listing.listingType !== "FREE_AGENT" ||
          listing.status !== "ACTIVE" ||
          listing.player.clubId !== null ||
          listing.player.careerStatus !== "ACTIVE" ||
          !listing.endsAt ||
          listing.endsAt.getTime() > now.getTime()
        ) {
          return null;
        }

        const retirementSeason =
          (await transaction.season.findFirst({
            where: {
              status: {
                in: ["ACTIVE", "PREPARATION"],
              },
            },
            orderBy: {
              number: "desc",
            },
            select: {
              id: true,
            },
          })) ??
          (await transaction.season.findFirst({
            orderBy: {
              number: "desc",
            },
            select: {
              id: true,
            },
          }));

        await transaction.player.update({
          where: {
            id: listing.player.id,
          },
          data: {
            careerStatus: "RETIRED",
            retiredAt: now,
            retirementSeasonId: retirementSeason?.id ?? null,
            clubId: null,
          },
        });

        await transaction.transferListing.update({
          where: {
            id: listing.id,
          },
          data: {
            status: "EXPIRED",
            completedAt: now,
          },
        });

        await transaction.gameEvent.create({
          data: {
            clubId: null,
            type: "FREE_AGENT_RETIRED",
            title: `Ritiro da svincolato: ${listing.player.firstName} ${listing.player.lastName}`,
            description:
              `${listing.player.firstName} ${listing.player.lastName} non ha trovato un club entro 105 giorni ed è stato ritirato definitivamente.`,
            createdAt: now,
          },
        });

        return {
          listingId: listing.id,
          playerId: listing.player.id,
          playerName: `${listing.player.firstName} ${listing.player.lastName}`,
          expiredAt: now.toISOString(),
        };
      }
    );

    if (outcome) {
      outcomes.push(outcome);
    }
  }

  return outcomes;
}
