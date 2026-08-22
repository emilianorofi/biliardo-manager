import { generateDoubleRoundRobin } from "@/lib/league-scheduler";
import { playLeagueFixture } from "@/lib/play-league-fixture";
import { prisma } from "@/lib/prisma";
import {
  CLUBS_PER_LEAGUE,
  TOTAL_WORLD_LEAGUES,
} from "@/lib/world-structure";

const WORLD_SYNCHRONIZATION_LOCK = 202608222;
const FIXTURES_PER_LEAGUE =
  CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1);

export type WorldLeagueSynchronizationResult = {
  seasonId: number;
  targetRound: number;
  synchronizedLeagues: number;
  resetFixtures: number;
  playedFixtures: number;
  deletedEvents: number;
  alreadySynchronized: boolean;
};

export async function synchronizeWorldLeagueProgress(): Promise<WorldLeagueSynchronizationResult> {
  const preparation = await prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(${WORLD_SYNCHRONIZATION_LOCK})
      `;

      const season = await transaction.season.findFirst({
        where: {
          status: {
            in: ["ACTIVE", "PREPARATION"],
          },
        },
        orderBy: {
          number: "desc",
        },
        include: {
          leagues: {
            orderBy: [
              { level: "asc" },
              { groupCode: "asc" },
            ],
            include: {
              entries: {
                orderBy: {
                  clubId: "asc",
                },
                select: {
                  clubId: true,
                  played: true,
                },
              },
              fixtures: {
                orderBy: [
                  { round: "asc" },
                  { id: "asc" },
                ],
                select: {
                  round: true,
                  status: true,
                  scheduledAt: true,
                },
              },
            },
          },
        },
      });

      if (!season || season.leagues.length !== TOTAL_WORLD_LEAGUES) {
        throw new Error("WORLD_LEAGUES_INCOMPLETE");
      }

      const referenceLeague = season.leagues.find(
        (league) => league.level === 1 && league.groupCode === "A"
      );

      if (!referenceLeague) {
        throw new Error("WORLD_REFERENCE_LEAGUE_MISSING");
      }

      const lowerLeagues = season.leagues.filter(
        (league) => league.id !== referenceLeague.id
      );
      const lowerLeagueIds = lowerLeagues.map((league) => league.id);
      const targetRound = referenceLeague.currentRound;
      const alreadySynchronized = lowerLeagues.every(
        (league) =>
          league.currentRound === targetRound &&
          league.entries.every((entry) => entry.played === targetRound) &&
          league.fixtures.length === FIXTURES_PER_LEAGUE &&
          league.fixtures.every((fixture) =>
            fixture.round <= targetRound
              ? fixture.status === "PLAYED"
              : fixture.status === "SCHEDULED"
          )
      );

      if (alreadySynchronized) {
        return {
          seasonId: season.id,
          targetRound,
          lowerLeagueIds,
          resetFixtures: 0,
          deletedEvents: 0,
          alreadySynchronized: true,
        };
      }

      const humanManagers = await transaction.manager.count({
        where: {
          club: {
            leagueEntries: {
              some: {
                leagueId: {
                  in: lowerLeagueIds,
                },
              },
            },
          },
        },
      });

      if (humanManagers > 0) {
        throw new Error("WORLD_LOWER_LEAGUES_HAVE_MANAGERS");
      }

      const roundDates = new Map<number, Date>();

      for (const fixture of referenceLeague.fixtures) {
        if (!roundDates.has(fixture.round)) {
          roundDates.set(fixture.round, fixture.scheduledAt);
        }
      }

      if (roundDates.size !== CLUBS_PER_LEAGUE * 2 - 2) {
        throw new Error("WORLD_REFERENCE_DATES_INCOMPLETE");
      }

      const deletedEvents = await transaction.gameEvent.deleteMany({
        where: {
          type: "Campionato",
          OR: lowerLeagues.map((league) => ({
            description: {
              contains: `di ${league.name}.`,
            },
          })),
        },
      });
      const deletedFixtures = await transaction.leagueFixture.deleteMany({
        where: {
          leagueId: {
            in: lowerLeagueIds,
          },
        },
      });

      await transaction.leagueEntry.updateMany({
        where: {
          leagueId: {
            in: lowerLeagueIds,
          },
        },
        data: {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          points: 0,
        },
      });
      await transaction.league.updateMany({
        where: {
          id: {
            in: lowerLeagueIds,
          },
        },
        data: {
          status:
            season.status === "ACTIVE" ? "ACTIVE" : "PREPARATION",
          currentRound: 0,
        },
      });

      for (const league of lowerLeagues) {
        const fixtures = generateDoubleRoundRobin(
          league.entries.map((entry) => entry.clubId)
        );

        await transaction.leagueFixture.createMany({
          data: fixtures.map((fixture) => {
            const scheduledAt = roundDates.get(fixture.round);

            if (!scheduledAt) {
              throw new Error("WORLD_REFERENCE_DATE_MISSING");
            }

            return {
              leagueId: league.id,
              round: fixture.round,
              homeClubId: fixture.homeClubId,
              awayClubId: fixture.awayClubId,
              scheduledAt,
              status: "SCHEDULED",
            };
          }),
        });
      }

      return {
        seasonId: season.id,
        targetRound,
        lowerLeagueIds,
        resetFixtures: deletedFixtures.count,
        deletedEvents: deletedEvents.count,
        alreadySynchronized: false,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: 120000,
    }
  );

  let playedFixtures = 0;

  for (let round = 1; round <= preparation.targetRound; round += 1) {
    const fixtures = await prisma.leagueFixture.findMany({
      where: {
        leagueId: {
          in: preparation.lowerLeagueIds,
        },
        round,
        status: "SCHEDULED",
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        scheduledAt: true,
      },
    });

    for (const fixture of fixtures) {
      await playLeagueFixture({
        fixtureId: fixture.id,
        now: fixture.scheduledAt,
      });
      playedFixtures += 1;
    }
  }

  const unsynchronizedEntries = await prisma.leagueEntry.count({
    where: {
      leagueId: {
        in: preparation.lowerLeagueIds,
      },
      NOT: {
        played: preparation.targetRound,
      },
    },
  });
  const unsynchronizedLeagues = await prisma.league.count({
    where: {
      id: {
        in: preparation.lowerLeagueIds,
      },
      NOT: {
        currentRound: preparation.targetRound,
      },
    },
  });

  if (unsynchronizedEntries > 0 || unsynchronizedLeagues > 0) {
    throw new Error("WORLD_LEAGUE_SYNCHRONIZATION_INCOMPLETE");
  }

  return {
    seasonId: preparation.seasonId,
    targetRound: preparation.targetRound,
    synchronizedLeagues: preparation.lowerLeagueIds.length,
    resetFixtures: preparation.resetFixtures,
    playedFixtures,
    deletedEvents: preparation.deletedEvents,
    alreadySynchronized: preparation.alreadySynchronized,
  };
}
