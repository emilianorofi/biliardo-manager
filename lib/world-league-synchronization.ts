import { calculateFixtureStandingsDeltas } from "@/lib/league-standings";
import { prisma } from "@/lib/prisma";
import {
  CLUBS_PER_LEAGUE,
  TOTAL_WORLD_LEAGUES,
} from "@/lib/world-structure";

const WORLD_SYNCHRONIZATION_LOCK = 202608222;
const FIXTURES_PER_LEAGUE =
  CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1);
const FIXTURES_PER_ROUND = CLUBS_PER_LEAGUE / 2;

type StandingsValues = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number;
};

export type WorldLeagueSynchronizationResult = {
  seasonId: number;
  targetRound: number;
  synchronizedLeagues: number;
  resetFixtures: number;
  retainedFixtures: number;
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
                orderBy: {
                  clubId: "asc",
                },
                select: {
                  id: true,
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
      const retainedFixtures =
        lowerLeagues.length * targetRound * FIXTURES_PER_ROUND;

      if (alreadySynchronized) {
        return {
          seasonId: season.id,
          targetRound,
          synchronizedLeagues: lowerLeagues.length,
          resetFixtures: 0,
          retainedFixtures,
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

      const incompletePastRound = lowerLeagues.some((league) =>
        league.fixtures.some(
          (fixture) =>
            fixture.round <= targetRound &&
            (fixture.status !== "PLAYED" ||
              fixture.homeScore === null ||
              fixture.awayScore === null)
        )
      );

      if (incompletePastRound) {
        throw new Error("WORLD_LOWER_LEAGUES_BEHIND_REFERENCE");
      }

      const fixturesToReset = lowerLeagues.flatMap((league) =>
        league.fixtures.filter(
          (fixture) =>
            fixture.round > targetRound && fixture.status !== "SCHEDULED"
        )
      );
      const fixtureIdsToReset = fixturesToReset.map(
        (fixture) => fixture.id
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

      if (fixtureIdsToReset.length > 0) {
        await transaction.playerGamePerformance.deleteMany({
          where: {
            fixtureGame: {
              fixtureId: {
                in: fixtureIdsToReset,
              },
            },
          },
        });
        await transaction.leagueFixtureGame.deleteMany({
          where: {
            fixtureId: {
              in: fixtureIdsToReset,
            },
          },
        });
        await transaction.playerFixtureAppearance.deleteMany({
          where: {
            fixtureId: {
              in: fixtureIdsToReset,
            },
          },
        });
        await transaction.leagueFixture.updateMany({
          where: {
            id: {
              in: fixtureIdsToReset,
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

      for (const league of lowerLeagues) {
        const standings = new Map<number, StandingsValues>(
          league.entries.map((entry) => [
            entry.clubId,
            createEmptyStandings(),
          ])
        );

        for (const fixture of league.fixtures) {
          if (fixture.round > targetRound) {
            continue;
          }

          if (fixture.homeScore === null || fixture.awayScore === null) {
            throw new Error("WORLD_FIXTURE_SCORE_MISSING");
          }

          const deltas = calculateFixtureStandingsDeltas(
            fixture.homeScore,
            fixture.awayScore
          );

          addStandingsDelta(
            standings,
            fixture.homeClubId,
            deltas.home
          );
          addStandingsDelta(
            standings,
            fixture.awayClubId,
            deltas.away
          );
        }

        for (const entry of league.entries) {
          const values = standings.get(entry.clubId);

          if (!values) {
            throw new Error("WORLD_LEAGUE_ENTRY_MISSING");
          }

          await transaction.leagueEntry.update({
            where: {
              id: entry.id,
            },
            data: values,
          });
        }
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
        retainedFixtures,
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

function createEmptyStandings(): StandingsValues {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    points: 0,
  };
}

function addStandingsDelta(
  standings: Map<number, StandingsValues>,
  clubId: number,
  delta: StandingsValues
) {
  const values = standings.get(clubId);

  if (!values) {
    throw new Error("WORLD_STANDINGS_CLUB_MISSING");
  }

  values.played += delta.played;
  values.won += delta.won;
  values.drawn += delta.drawn;
  values.lost += delta.lost;
  values.pointsFor += delta.pointsFor;
  values.pointsAgainst += delta.pointsAgainst;
  values.points += delta.points;
}
