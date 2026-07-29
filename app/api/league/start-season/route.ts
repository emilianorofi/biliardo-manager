import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REQUIRED_CLUBS = 8;
const REQUIRED_FIXTURES = 56;

export async function POST() {
  try {
    const league =
      await prisma.league.findFirst({
        orderBy: {
          id: "desc",
        },

        include: {
          season: true,
        },
      });

    if (!league) {
      return NextResponse.json(
        {
          error:
            "Non esiste alcun campionato da avviare.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      league.status === "ACTIVE" ||
      league.season.status ===
        "ACTIVE"
    ) {
      return NextResponse.json(
        {
          error:
            "La stagione è già attiva.",

          seasonId:
            league.season.id,

          leagueId:
            league.id,
        },
        {
          status: 409,
        }
      );
    }

    if (
      league.status !==
        "PREPARATION" ||
      league.season.status !==
        "PREPARATION"
    ) {
      return NextResponse.json(
        {
          error:
            "La stagione non si trova nello stato corretto per essere avviata.",

          seasonStatus:
            league.season.status,

          leagueStatus:
            league.status,
        },
        {
          status: 400,
        }
      );
    }

    const entriesCount =
      await prisma.leagueEntry.count({
        where: {
          leagueId: league.id,
        },
      });

    if (
      entriesCount !==
      REQUIRED_CLUBS
    ) {
      return NextResponse.json(
        {
          error:
            `Il campionato deve contenere esattamente ${REQUIRED_CLUBS} club.`,

          clubsFound:
            entriesCount,

          clubsRequired:
            REQUIRED_CLUBS,
        },
        {
          status: 400,
        }
      );
    }

    const fixturesCount =
      await prisma.leagueFixture.count({
        where: {
          leagueId: league.id,
        },
      });

    if (
      fixturesCount !==
      REQUIRED_FIXTURES
    ) {
      return NextResponse.json(
        {
          error:
            `Il calendario deve contenere esattamente ${REQUIRED_FIXTURES} incontri.`,

          fixturesFound:
            fixturesCount,

          fixturesRequired:
            REQUIRED_FIXTURES,
        },
        {
          status: 400,
        }
      );
    }

    const scheduledFixturesCount =
      await prisma.leagueFixture.count({
        where: {
          leagueId: league.id,

          status: "SCHEDULED",
        },
      });

    if (
      scheduledFixturesCount !==
      REQUIRED_FIXTURES
    ) {
      return NextResponse.json(
        {
          error:
            "Non tutti gli incontri risultano correttamente programmati.",

          scheduledFixtures:
            scheduledFixturesCount,

          fixturesRequired:
            REQUIRED_FIXTURES,
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await prisma.$transaction(
        async (transaction) => {
          const season =
            await transaction.season.update({
              where: {
                id:
                  league.seasonId,
              },

              data: {
                status: "ACTIVE",
              },
            });

          const updatedLeague =
            await transaction.league.update({
              where: {
                id: league.id,
              },

              data: {
                status: "ACTIVE",
                currentRound: 0,
              },
            });

          return {
            season,
            league: updatedLeague,
          };
        }
      );

    return NextResponse.json({
      message:
        "Stagione avviata correttamente.",

      season: {
        id:
          result.season.id,

        number:
          result.season.number,

        name:
          result.season.name,

        status:
          result.season.status,

        startsAt:
          result.season.startsAt
            ? result.season.startsAt.toISOString()
            : null,

        endsAt:
          result.season.endsAt
            ? result.season.endsAt.toISOString()
            : null,
      },

      league: {
        id:
          result.league.id,

        name:
          result.league.name,

        level:
          result.league.level,

        groupCode:
          result.league.groupCode,

        status:
          result.league.status,

        currentRound:
          result.league.currentRound,
      },

      summary: {
        clubs:
          entriesCount,

        fixtures:
          fixturesCount,

        scheduledFixtures:
          scheduledFixturesCount,
      },
    });
  } catch (error) {
    console.error(
      "Errore durante l'avvio della stagione:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile avviare la stagione.",
      },
      {
        status: 500,
      }
    );
  }
}