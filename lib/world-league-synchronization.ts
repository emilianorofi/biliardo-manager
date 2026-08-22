import { generateDoubleRoundRobin } from "@/lib/league-scheduler";
import { prisma } from "@/lib/prisma";
import {
  CLUBS_PER_LEAGUE,
  TOTAL_WORLD_LEAGUES,
} from "@/lib/world-structure";

const WORLD_SYNCHRONIZATION_LOCK = 202608222;
const SYNCHRONIZATION_STATEMENT_TIMEOUT_MS = 60000;
const TOTAL_ROUNDS = CLUBS_PER_LEAGUE * 2 - 2;
const FIXTURES_PER_LEAGUE =
  CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1);

type StandingValues = {
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
  playedFixtures: number;
  deletedEvents: number;
  alreadySynchronized: boolean;
};

export async function synchronizeWorldLeagueProgress(): Promise<WorldLeagueSynchronizationResult> {
  const season = await prisma.season.findFirst({
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
              club: {
                select: {
                  name: true,
                },
              },
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

  const targetRound = referenceLeague.currentRound;
  const roundDates = new Map<number, Date>();

  for (const fixture of referenceLeague.fixtures) {
    if (!roundDates.has(fixture.round)) {
      roundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  if (roundDates.size !== TOTAL_ROUNDS) {
    throw new Error("WORLD_REFERENCE_SCHEDULE_INCOMPLETE");
  }

  const lowerLeagues = season.leagues.filter(
    (league) => league.id !== referenceLeague.id
  );
  const lowerLeagueIds = lowerLeagues.map((league) => league.id);
  const humanManagers = await prisma.manager.count({
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

  const leaguesToRebuild = lowerLeagues.filter(
    (league) => !isLeagueSynchronized(league, targetRound)
  );

  if (leaguesToRebuild.length === 0) {
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

  let resetFixtures = 0;
  let playedFixtures = 0;
  let deletedEvents = 0;

  for (const league of leaguesToRebuild) {
    const clubIds = league.entries.map((entry) => entry.clubId);

    if (clubIds.length !== CLUBS_PER_LEAGUE) {
      throw new Error("WORLD_LEAGUE_ENTRIES_INCOMPLETE");
    }

    const clubNames = new Map(
      league.entries.map((entry) => [entry.clubId, entry.club.name])
    );
    const fixtures = generateDoubleRoundRobin(clubIds).map((fixture) => {
      const scheduledAt = roundDates.get(fixture.round);

      if (!scheduledAt) {
        throw new Error("WORLD_ROUND_DATE_MISSING");
      }

      return {
        ...fixture,
        scheduledAt,
        score:
          fixture.round <= targetRound
            ? simulateInitialFixture({
                ...fixture,
                leagueLevel: league.level,
              })
            : null,
      };
    });
    const standings = calculateStandings(clubIds, fixtures);
    const result = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRawUnsafe(
          `SET LOCAL statement_timeout = ${SYNCHRONIZATION_STATEMENT_TIMEOUT_MS}`
        );
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(${WORLD_SYNCHRONIZATION_LOCK})
        `;

        const existingLeague = await transaction.league.findUnique({
          where: {
            id: league.id,
          },
          select: {
            id: true,
          },
        });

        if (!existingLeague) {
          throw new Error("WORLD_LEAGUE_CHANGED_DURING_SYNCHRONIZATION");
        }

        const removedEvents = await transaction.gameEvent.deleteMany({
          where: {
            type: "Campionato",
            description: {
              in: Array.from(
                { length: TOTAL_ROUNDS },
                (_, index) => `Giornata ${index + 1} di ${league.name}.`
              ),
            },
          },
        });

        await transaction.league.delete({
          where: {
            id: league.id,
          },
        });

        const rebuiltLeague = await transaction.league.create({
          data: {
            seasonId: season.id,
            name: league.name,
            level: league.level,
            groupCode: league.groupCode,
            status:
              targetRound === TOTAL_ROUNDS
                ? "COMPLETED"
                : season.status === "ACTIVE"
                  ? "ACTIVE"
                  : "PREPARATION",
            currentRound: targetRound,
            entries: {
              create: clubIds.map((clubId) => ({
                clubId,
                ...standings.get(clubId),
              })),
            },
          },
        });

        await transaction.leagueFixture.createMany({
          data: fixtures.map((fixture) => ({
            leagueId: rebuiltLeague.id,
            round: fixture.round,
            homeClubId: fixture.homeClubId,
            awayClubId: fixture.awayClubId,
            scheduledAt: fixture.scheduledAt,
            status: fixture.score ? "PLAYED" : "SCHEDULED",
            homeScore: fixture.score?.homeScore ?? null,
            awayScore: fixture.score?.awayScore ?? null,
            playedAt: fixture.score ? fixture.scheduledAt : null,
          })),
        });

        const completedFixtures = fixtures.filter(
          (fixture) => fixture.score !== null
        );

        if (completedFixtures.length > 0) {
          await transaction.gameEvent.createMany({
            data: completedFixtures.map((fixture) => ({
              clubId: null,
              type: "Campionato",
              title:
                `${clubNames.get(fixture.homeClubId)} ` +
                `${fixture.score?.homeScore}-${fixture.score?.awayScore} ` +
                `${clubNames.get(fixture.awayClubId)}`,
              description: `Giornata ${fixture.round} di ${league.name}.`,
              createdAt: fixture.scheduledAt,
            })),
          });
        }

        return {
          removedEvents: removedEvents.count,
          completedFixtures: completedFixtures.length,
        };
      },
      {
        isolationLevel: "Serializable",
        timeout: 120000,
      }
    );

    resetFixtures += league.fixtures.length;
    playedFixtures += result.completedFixtures;
    deletedEvents += result.removedEvents;
  }

  return {
    seasonId: season.id,
    targetRound,
    synchronizedLeagues: lowerLeagues.length,
    resetFixtures,
    playedFixtures,
    deletedEvents,
    alreadySynchronized: false,
  };
}

function isLeagueSynchronized(
  league: {
    currentRound: number;
    entries: Array<{ played: number }>;
    fixtures: Array<{
      round: number;
      status: string;
      homeScore: number | null;
      awayScore: number | null;
    }>;
  },
  targetRound: number
) {
  return (
    league.currentRound === targetRound &&
    league.entries.every((entry) => entry.played === targetRound) &&
    league.fixtures.length === FIXTURES_PER_LEAGUE &&
    league.fixtures.every((fixture) =>
      fixture.round <= targetRound
        ? fixture.status === "PLAYED" &&
          fixture.homeScore !== null &&
          fixture.awayScore !== null
        : fixture.status === "SCHEDULED" &&
          fixture.homeScore === null &&
          fixture.awayScore === null
    )
  );
}

function calculateStandings(
  clubIds: number[],
  fixtures: Array<{
    homeClubId: number;
    awayClubId: number;
    score: { homeScore: number; awayScore: number } | null;
  }>
) {
  const standings = new Map<number, StandingValues>(
    clubIds.map((clubId) => [clubId, createEmptyStanding()])
  );

  for (const fixture of fixtures) {
    if (!fixture.score) {
      continue;
    }

    const home = standings.get(fixture.homeClubId);
    const away = standings.get(fixture.awayClubId);

    if (!home || !away) {
      throw new Error("WORLD_FIXTURE_CLUB_MISSING");
    }

    home.played += 1;
    away.played += 1;
    home.pointsFor += fixture.score.homeScore;
    home.pointsAgainst += fixture.score.awayScore;
    home.points += fixture.score.homeScore;
    away.pointsFor += fixture.score.awayScore;
    away.pointsAgainst += fixture.score.homeScore;
    away.points += fixture.score.awayScore;

    if (fixture.score.homeScore > fixture.score.awayScore) {
      home.won += 1;
      away.lost += 1;
    } else if (fixture.score.homeScore < fixture.score.awayScore) {
      away.won += 1;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
    }
  }

  return standings;
}

function createEmptyStanding(): StandingValues {
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

function simulateInitialFixture(fixture: {
  round: number;
  homeClubId: number;
  awayClubId: number;
  leagueLevel: number;
}) {
  const random = createSeededRandom(
    fixture.round * 31 +
      fixture.homeClubId * 17 +
      fixture.awayClubId * 13 +
      fixture.leagueLevel * 101
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
