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
  return prisma.$transaction(
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
                  id: true,
                  round: true,
                  status: true,
                  homeClubId: true,
                  awayClubId: true,
                  homeScore: true,
                  awayScore: true,
                  scheduledAt: true,
                  homeClub: {
                    select: {
                      name: true,
                    },
                  },
                  awayClub: {
                    select: {
                      name: true,
                    },
                  },
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
          synchronizedLeagues: lowerLeagues.length,
          resetFixtures: 0,
          playedFixtures: 0,
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

      const fixturesToReset = lowerLeagues.flatMap((league) =>
        league.fixtures.filter(
          (fixture) =>
            fixture.round > targetRound && fixture.status !== "SCHEDULED"
        )
      );
      const fixturesToSimulate = lowerLeagues.flatMap((league) =>
        league.fixtures
          .filter(
            (fixture) =>
              fixture.round <= targetRound &&
              (fixture.status !== "PLAYED" ||
                fixture.homeScore === null ||
                fixture.awayScore === null)
          )
          .map((fixture) => ({
            ...fixture,
            leagueName: league.name,
            score: simulateInitialFixture(fixture),
          }))
      );
      const fixtureIdsToClear = Array.from(
        new Set([
          ...fixturesToReset.map((fixture) => fixture.id),
          ...fixturesToSimulate.map((fixture) => fixture.id),
        ])
      );
      const eventFilters = lowerLeagues.flatMap((league) =>
        Array.from(
          { length: CLUBS_PER_LEAGUE * 2 - 2 - targetRound },
          (_, index) => ({
            description: `Giornata ${targetRound + index + 1} di ${league.name}.`,
          })
        )
      );
      const deletedEvents =
        eventFilters.length === 0
          ? { count: 0 }
          : await transaction.gameEvent.deleteMany({
              where: {
                type: "Campionato",
                OR: eventFilters,
              },
            });

      if (fixtureIdsToClear.length > 0) {
        await transaction.playerGamePerformance.deleteMany({
          where: {
            fixtureGame: {
              fixtureId: {
                in: fixtureIdsToClear,
              },
            },
          },
        });
        await transaction.leagueFixtureGame.deleteMany({
          where: {
            fixtureId: {
              in: fixtureIdsToClear,
            },
          },
        });
        await transaction.playerFixtureAppearance.deleteMany({
          where: {
            fixtureId: {
              in: fixtureIdsToClear,
            },
          },
        });
      }

      if (fixturesToReset.length > 0) {
        await transaction.leagueFixture.updateMany({
          where: {
            id: {
              in: fixturesToReset.map((fixture) => fixture.id),
            },
          },
          data: {
            status: "SCHEDULED",
            homeScore: null,
            awayScore: null,
            playedAt: null,
          },
        });
      }

      if (fixturesToSimulate.length > 0) {
        const values = fixturesToSimulate
          .map(
            (fixture) =>
              `(${fixture.id}, ${fixture.score.homeScore}, ${fixture.score.awayScore})`
          )
          .join(", ");

        await transaction.$executeRawUnsafe(`
          UPDATE "LeagueFixture" AS fixture
          SET
            status = 'PLAYED',
            "homeScore" = result."homeScore",
            "awayScore" = result."awayScore",
            "playedAt" = fixture."scheduledAt"
          FROM (
            VALUES ${values}
          ) AS result(id, "homeScore", "awayScore")
          WHERE fixture.id = result.id
        `);

        await transaction.gameEvent.createMany({
          data: fixturesToSimulate.map((fixture) => ({
            clubId: null,
            type: "Campionato",
            title:
              `${fixture.homeClub.name} ${fixture.score.homeScore}-` +
              `${fixture.score.awayScore} ${fixture.awayClub.name}`,
            description: `Giornata ${fixture.round} di ${fixture.leagueName}.`,
            createdAt: fixture.scheduledAt,
          })),
        });
      }

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

      if (targetRound > 0) {
        const leagueIds = lowerLeagueIds.join(", ");

        await transaction.$executeRawUnsafe(`
          WITH club_results AS (
            SELECT
              fixture."leagueId",
              fixture."homeClubId" AS "clubId",
              fixture."homeScore" AS scored,
              fixture."awayScore" AS conceded
            FROM "LeagueFixture" AS fixture
            WHERE fixture."leagueId" IN (${leagueIds})
              AND fixture.round <= ${targetRound}
              AND fixture.status = 'PLAYED'

            UNION ALL

            SELECT
              fixture."leagueId",
              fixture."awayClubId" AS "clubId",
              fixture."awayScore" AS scored,
              fixture."homeScore" AS conceded
            FROM "LeagueFixture" AS fixture
            WHERE fixture."leagueId" IN (${leagueIds})
              AND fixture.round <= ${targetRound}
              AND fixture.status = 'PLAYED'
          ),
          totals AS (
            SELECT
              "leagueId",
              "clubId",
              COUNT(*)::int AS played,
              COUNT(*) FILTER (WHERE scored > conceded)::int AS won,
              COUNT(*) FILTER (WHERE scored = conceded)::int AS drawn,
              COUNT(*) FILTER (WHERE scored < conceded)::int AS lost,
              SUM(scored)::int AS "pointsFor",
              SUM(conceded)::int AS "pointsAgainst"
            FROM club_results
            GROUP BY "leagueId", "clubId"
          )
          UPDATE "LeagueEntry" AS entry
          SET
            played = totals.played,
            won = totals.won,
            drawn = totals.drawn,
            lost = totals.lost,
            "pointsFor" = totals."pointsFor",
            "pointsAgainst" = totals."pointsAgainst",
            points = totals."pointsFor"
          FROM totals
          WHERE entry."leagueId" = totals."leagueId"
            AND entry."clubId" = totals."clubId"
        `);
      }

      await transaction.league.updateMany({
        where: {
          id: {
            in: lowerLeagueIds,
          },
        },
        data: {
          status:
            targetRound === CLUBS_PER_LEAGUE * 2 - 2
              ? "COMPLETED"
              : season.status === "ACTIVE"
                ? "ACTIVE"
                : "PREPARATION",
          currentRound: targetRound,
        },
      });

      return {
        seasonId: season.id,
        targetRound,
        synchronizedLeagues: lowerLeagues.length,
        resetFixtures: fixturesToReset.length,
        playedFixtures: fixturesToSimulate.length,
        deletedEvents: deletedEvents.count,
        alreadySynchronized: false,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: 120000,
    }
  );
}

function simulateInitialFixture(fixture: {
  id: number;
  homeClubId: number;
  awayClubId: number;
}) {
  const random = createSeededRandom(
    fixture.id * 31 + fixture.homeClubId * 17 + fixture.awayClubId * 13
  );
  let homeScore = 0;

  for (let game = 0; game < 6; game += 1) {
    if (random() < 0.52) {
      homeScore += 1;
    }
  }

  return {
    homeScore,
    awayScore: 6 - homeScore,
  };
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
