import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  generateDoubleRoundRobin,
} from "@/lib/league-scheduler";
import {
  buildWeeklyRoundDates,
  getNextLeagueDate,
} from "@/lib/league-calendar";

export const dynamic = "force-dynamic";

const REQUIRED_CLUBS = 8;

export async function POST() {
  try {
    const league =
      await prisma.league.findFirst({
        where: {
          status: "PREPARATION",
        },

        orderBy: {
          id: "desc",
        },

        include: {
          season: true,

          entries: {
            orderBy: {
              clubId: "asc",
            },

            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  city: true,
                },
              },
            },
          },
        },
      });

    if (!league) {
      return NextResponse.json(
        {
          error:
            "Non esiste un campionato in preparazione.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      league.entries.length !==
      REQUIRED_CLUBS
    ) {
      return NextResponse.json(
        {
          error:
            `Il campionato deve contenere esattamente ${REQUIRED_CLUBS} club.`,

          clubsFound:
            league.entries.length,

          clubsRequired:
            REQUIRED_CLUBS,
        },
        {
          status: 400,
        }
      );
    }

    const existingFixtures =
      await prisma.leagueFixture.count({
        where: {
          leagueId: league.id,
        },
      });

    if (existingFixtures > 0) {
      return NextResponse.json(
        {
          error:
            "Il calendario di questo campionato è già stato creato.",

          leagueId:
            league.id,

          fixturesFound:
            existingFixtures,
        },
        {
          status: 409,
        }
      );
    }

    const clubIds =
      league.entries.map(
        (entry) => entry.clubId
      );

    const generatedFixtures =
      generateDoubleRoundRobin(
        clubIds
      );

    const firstRoundDate =
      getNextLeagueDate(
        new Date()
      );

    const totalRounds =
      REQUIRED_CLUBS * 2 - 2;

    const roundDates =
      buildWeeklyRoundDates(
        firstRoundDate,
        totalRounds
      );

    const fixtureData =
      generatedFixtures.map(
        (fixture) => ({
          leagueId:
            league.id,

          round:
            fixture.round,

          homeClubId:
            fixture.homeClubId,

          awayClubId:
            fixture.awayClubId,

          scheduledAt:
            roundDates[
              fixture.round - 1
            ],

          status:
            "SCHEDULED",
        })
      );

    await prisma.$transaction(
      async (transaction) => {
        await transaction.leagueFixture.createMany(
          {
            data: fixtureData,
          }
        );

        await transaction.season.update({
          where: {
            id: league.seasonId,
          },

          data: {
            startsAt:
              roundDates[0],

            endsAt:
              roundDates[
                roundDates.length - 1
              ],
          },
        });
      }
    );

    const clubsById =
      new Map(
        league.entries.map(
          (entry) => [
            entry.clubId,
            entry.club,
          ]
        )
      );

    const rounds =
      roundDates.map(
        (
          scheduledAt,
          roundIndex
        ) => {
          const round =
            roundIndex + 1;

          const fixtures =
            generatedFixtures
              .filter(
                (fixture) =>
                  fixture.round ===
                  round
              )
              .map((fixture) => {
                const homeClub =
                  clubsById.get(
                    fixture.homeClubId
                  );

                const awayClub =
                  clubsById.get(
                    fixture.awayClubId
                  );

                if (
                  !homeClub ||
                  !awayClub
                ) {
                  throw new Error(
                    "Club del calendario non trovato."
                  );
                }

                return {
                  homeClub,
                  awayClub,
                };
              });

          return {
            round,

            leg:
              round <=
              REQUIRED_CLUBS - 1
                ? "ANDATA"
                : "RITORNO",

            scheduledAt:
              scheduledAt.toISOString(),

            fixtures,
          };
        }
      );

    return NextResponse.json(
      {
        message:
          "Calendario creato correttamente.",

        season: {
          id:
            league.season.id,

          number:
            league.season.number,

          name:
            league.season.name,

          startsAt:
            roundDates[
              0
            ].toISOString(),

          endsAt:
            roundDates[
              roundDates.length - 1
            ].toISOString(),
        },

        league: {
          id:
            league.id,

          name:
            league.name,

          level:
            league.level,

          groupCode:
            league.groupCode,
        },

        summary: {
          clubs:
            league.entries.length,

          rounds:
            roundDates.length,

          matchesPerRound:
            REQUIRED_CLUBS / 2,

          totalFixtures:
            generatedFixtures.length,

          firstLegFixtures:
            generatedFixtures.filter(
              (fixture) =>
                fixture.round <=
                REQUIRED_CLUBS - 1
            ).length,

          returnLegFixtures:
            generatedFixtures.filter(
              (fixture) =>
                fixture.round >
                REQUIRED_CLUBS - 1
            ).length,
        },

        rounds,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Errore durante la creazione del calendario:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile creare il calendario.",
      },
      {
        status: 500,
      }
    );
  }
}
