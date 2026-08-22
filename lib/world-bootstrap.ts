import type { Prisma } from "@/generated/prisma/client";
import {
  buildWeeklyRoundDates,
  getNextLeagueDate,
} from "@/lib/league-calendar";
import { generateDoubleRoundRobin } from "@/lib/league-scheduler";
import { prisma } from "@/lib/prisma";
import {
  buildNationalityQueue,
  createAiClubBlueprint,
  createGeneratedWorldPlayer,
  normalizeNationalityFlag,
} from "@/lib/world-generation";
import {
  CLUBS_PER_LEAGUE,
  getWorldLeagueDefinitions,
  INITIAL_PLAYERS_PER_CLUB,
  TOTAL_WORLD_CLUBS,
  TOTAL_WORLD_LEAGUES,
  type WorldLeagueLevel,
} from "@/lib/world-structure";

const TOTAL_ROUNDS = CLUBS_PER_LEAGUE * 2 - 2;
const FIXTURES_PER_LEAGUE =
  CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1);
const WORLD_BOOTSTRAP_LOCK = 202608221;

export type WorldBootstrapResult = {
  seasonId: number;
  seasonNumber: number;
  seasonStatus: string;
  createdClubs: number;
  renamedClubs: number;
  createdPlayers: number;
  createdLeagues: number;
  createdFixtures: number;
  totalClubs: number;
  totalClubPlayers: number;
  totalLeagues: number;
};

export async function bootstrapWorld(
  now = new Date()
): Promise<WorldBootstrapResult> {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(${WORLD_BOOTSTRAP_LOCK})
      `;

      const season = await findOrCreateCurrentSeason(transaction);
      const clubResult = await ensureWorldClubs(transaction);
      const leagueResult = await ensureWorldLeagues(
        transaction,
        season.id,
        season.status
      );
      const createdPlayers = await ensureWorldPlayers(
        transaction,
        season.id
      );
      const scheduleResult = await ensureWorldSchedules(
        transaction,
        season.id,
        now
      );

      const [totalClubs, totalClubPlayers, totalLeagues] =
        await Promise.all([
          transaction.club.count({
            where: {
              leagueEntries: {
                some: {
                  league: {
                    seasonId: season.id,
                  },
                },
              },
            },
          }),
          transaction.player.count({
            where: {
              careerStatus: "ACTIVE",
              club: {
                leagueEntries: {
                  some: {
                    league: {
                      seasonId: season.id,
                    },
                  },
                },
              },
            },
          }),
          transaction.league.count({
            where: {
              seasonId: season.id,
            },
          }),
        ]);

      return {
        seasonId: season.id,
        seasonNumber: season.number,
        seasonStatus: season.status,
        createdClubs: clubResult.createdClubs,
        renamedClubs: clubResult.renamedClubs,
        createdPlayers,
        createdLeagues: leagueResult.createdLeagues,
        createdFixtures: scheduleResult.createdFixtures,
        totalClubs,
        totalClubPlayers,
        totalLeagues,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: 120000,
    }
  );
}

async function findOrCreateCurrentSeason(
  transaction: Prisma.TransactionClient
) {
  const currentSeason = await transaction.season.findFirst({
    where: {
      status: {
        in: ["ACTIVE", "PREPARATION"],
      },
    },
    orderBy: {
      number: "desc",
    },
  });

  if (currentSeason) {
    return currentSeason;
  }

  const latestSeason = await transaction.season.findFirst({
    orderBy: {
      number: "desc",
    },
    select: {
      number: true,
    },
  });
  const number = (latestSeason?.number ?? 0) + 1;

  return transaction.season.create({
    data: {
      number,
      name: `Stagione ${number}`,
      status: "PREPARATION",
    },
  });
}

async function ensureWorldClubs(
  transaction: Prisma.TransactionClient
) {
  const initialCount = await transaction.club.count();
  let missingClubs = Math.max(0, TOTAL_WORLD_CLUBS - initialCount);
  let createdClubs = 0;
  let renamedClubs = 0;

  for (
    let sequence = 0;
    sequence < TOTAL_WORLD_CLUBS;
    sequence += 1
  ) {
    const blueprint = createAiClubBlueprint(sequence);
    const existing = await transaction.club.findUnique({
      where: {
        normalizedName: blueprint.normalizedName,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
      },
    });

    if (existing) {
      if (
        existing.name !== blueprint.name ||
        existing.shortName !== blueprint.shortName
      ) {
        await transaction.club.update({
          where: {
            id: existing.id,
          },
          data: {
            name: blueprint.name,
            shortName: blueprint.shortName,
          },
        });
        renamedClubs += 1;
      }

      continue;
    }

    if (missingClubs === 0) {
      continue;
    }

    await transaction.club.create({
      data: blueprint,
    });
    missingClubs -= 1;
    createdClubs += 1;
  }

  if (missingClubs > 0) {
    throw new Error("WORLD_CLUB_GENERATION_INCOMPLETE");
  }

  return {
    createdClubs,
    renamedClubs,
  };
}

async function ensureWorldLeagues(
  transaction: Prisma.TransactionClient,
  seasonId: number,
  seasonStatus: string
) {
  const definitions = getWorldLeagueDefinitions();
  const assignedEntries = await transaction.leagueEntry.findMany({
    where: {
      league: {
        seasonId,
      },
    },
    select: {
      clubId: true,
    },
  });
  const assignedClubIds = new Set(
    assignedEntries.map((entry) => entry.clubId)
  );
  const availableClubs = await transaction.club.findMany({
    where: {
      id: {
        notIn: [...assignedClubIds],
      },
      manager: null,
    },
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
    },
  });
  let availableIndex = 0;
  let createdLeagues = 0;

  for (const definition of definitions) {
    const existingLeague = await transaction.league.findUnique({
      where: {
        seasonId_level_groupCode: {
          seasonId,
          level: definition.level,
          groupCode: definition.groupCode,
        },
      },
      include: {
        entries: {
          select: {
            clubId: true,
          },
        },
      },
    });
    const league = existingLeague
      ? await transaction.league.update({
          where: {
            id: existingLeague.id,
          },
          data: {
            name: definition.name,
          },
        })
      : await transaction.league.create({
          data: {
            seasonId,
            name: definition.name,
            level: definition.level,
            groupCode: definition.groupCode,
            status:
              seasonStatus === "ACTIVE" ? "ACTIVE" : "PREPARATION",
            currentRound: 0,
          },
        });

    if (!existingLeague) {
      createdLeagues += 1;
    }

    const existingClubIds = existingLeague?.entries.map(
      (entry) => entry.clubId
    ) ?? [];
    const missingEntries = CLUBS_PER_LEAGUE - existingClubIds.length;

    if (missingEntries < 0) {
      throw new Error("WORLD_LEAGUE_HAS_TOO_MANY_CLUBS");
    }

    const selectedClubs = availableClubs.slice(
      availableIndex,
      availableIndex + missingEntries
    );

    if (selectedClubs.length !== missingEntries) {
      throw new Error("WORLD_LEAGUE_CLUBS_INCOMPLETE");
    }

    if (selectedClubs.length > 0) {
      await transaction.leagueEntry.createMany({
        data: selectedClubs.map((club) => ({
          leagueId: league.id,
          clubId: club.id,
        })),
      });
      availableIndex += selectedClubs.length;
    }
  }

  return {
    createdLeagues,
  };
}

async function ensureWorldPlayers(
  transaction: Prisma.TransactionClient,
  seasonId: number
) {
  const entries = await transaction.leagueEntry.findMany({
    where: {
      league: {
        seasonId,
      },
    },
    orderBy: [
      { league: { level: "asc" } },
      { league: { groupCode: "asc" } },
      { clubId: "asc" },
    ],
    select: {
      clubId: true,
      league: {
        select: {
          level: true,
        },
      },
      club: {
        select: {
          players: {
            where: {
              careerStatus: "ACTIVE",
            },
            orderBy: {
              id: "asc",
            },
            select: {
              id: true,
              nationality: true,
            },
          },
        },
      },
    },
  });
  const existingCounts = new Map<string, number>();
  let requiredPlayers = 0;

  for (const entry of entries) {
    requiredPlayers += Math.max(
      0,
      INITIAL_PLAYERS_PER_CLUB - entry.club.players.length
    );

    for (const player of entry.club.players) {
      const flag = normalizeNationalityFlag(player.nationality);
      existingCounts.set(flag, (existingCounts.get(flag) ?? 0) + 1);
    }
  }

  const nationalities = buildNationalityQueue(
    existingCounts,
    requiredPlayers
  );
  const nationalitySequences = new Map(existingCounts);
  const players: Array<
    ReturnType<typeof createGeneratedWorldPlayer> & { clubId: number }
  > = [];
  let nationalityIndex = 0;
  let globalSeed = 1;

  for (const entry of entries) {
    const existingPlayers = entry.club.players.length;
    const missingPlayers = Math.max(
      0,
      INITIAL_PLAYERS_PER_CLUB - existingPlayers
    );

    for (let index = 0; index < missingPlayers; index += 1) {
      const nationality = nationalities[nationalityIndex];
      if (!nationality) {
        throw new Error("WORLD_PLAYER_NATIONALITY_MISSING");
      }
      const nationalitySequence =
        nationalitySequences.get(nationality) ?? 0;
      const player = createGeneratedWorldPlayer({
        leagueLevel: entry.league.level as WorldLeagueLevel,
        rosterIndex: existingPlayers + index,
        nationality,
        nationalitySequence,
        seed: entry.clubId * 100 + globalSeed,
      });

      players.push({
        ...player,
        clubId: entry.clubId,
      });
      nationalitySequences.set(nationality, nationalitySequence + 1);
      nationalityIndex += 1;
      globalSeed += 1;
    }
  }

  if (players.length > 0) {
    await transaction.player.createMany({
      data: players,
    });
  }

  return players.length;
}

async function ensureWorldSchedules(
  transaction: Prisma.TransactionClient,
  seasonId: number,
  now: Date
) {
  const leagues = await transaction.league.findMany({
    where: {
      seasonId,
    },
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
        },
      },
      fixtures: {
        orderBy: [
          { round: "asc" },
          { id: "asc" },
        ],
        select: {
          round: true,
          scheduledAt: true,
        },
      },
    },
  });

  if (leagues.length !== TOTAL_WORLD_LEAGUES) {
    throw new Error("WORLD_LEAGUES_INCOMPLETE");
  }

  const referenceLeague = leagues.find(
    (league) => league.level === 1 && league.groupCode === "A"
  );
  const existingRoundDates = new Map<number, Date>();

  for (const fixture of referenceLeague?.fixtures ?? []) {
    if (!existingRoundDates.has(fixture.round)) {
      existingRoundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  const roundDates =
    existingRoundDates.size === TOTAL_ROUNDS
      ? Array.from({ length: TOTAL_ROUNDS }, (_, index) => {
          const value = existingRoundDates.get(index + 1);
          if (!value) {
            throw new Error("WORLD_ROUND_DATE_MISSING");
          }
          return value;
        })
      : buildWeeklyRoundDates(getNextLeagueDate(now), TOTAL_ROUNDS);
  let createdFixtures = 0;

  for (const league of leagues) {
    if (league.entries.length !== CLUBS_PER_LEAGUE) {
      throw new Error("WORLD_LEAGUE_ENTRIES_INCOMPLETE");
    }

    if (league.fixtures.length === FIXTURES_PER_LEAGUE) {
      continue;
    }

    if (league.fixtures.length > 0) {
      throw new Error("WORLD_LEAGUE_SCHEDULE_PARTIAL");
    }

    const fixtures = generateDoubleRoundRobin(
      league.entries.map((entry) => entry.clubId)
    );
    await transaction.leagueFixture.createMany({
      data: fixtures.map((fixture) => ({
        leagueId: league.id,
        round: fixture.round,
        homeClubId: fixture.homeClubId,
        awayClubId: fixture.awayClubId,
        scheduledAt: roundDates[fixture.round - 1],
        status: "SCHEDULED",
      })),
    });
    createdFixtures += fixtures.length;
  }

  await transaction.season.update({
    where: {
      id: seasonId,
    },
    data: {
      startsAt: roundDates[0],
      endsAt: roundDates[roundDates.length - 1],
    },
  });

  return {
    createdFixtures,
  };
}
