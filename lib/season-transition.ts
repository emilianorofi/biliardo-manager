import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { calculatePlayerWeeklySalary } from "@/lib/economy-rules";
import {
  buildWeeklyRoundDates,
  getNextLeagueDate,
} from "@/lib/league-calendar";
import { generateDoubleRoundRobin } from "@/lib/league-scheduler";
import {
  buildIndividualTournamentCalendar,
  getSeasonWeekDate,
  INDIVIDUAL_TOURNAMENT_DEFINITIONS,
} from "@/lib/individual-tournament-calendar";
import { buildNationsCupCalendar } from "@/lib/nations-cup-calendar";
import { buildSpecialtyCupCalendar } from "@/lib/specialty-cup-calendar";
import { createLeagueTable } from "@/lib/league-table";
import { calculateOverall } from "@/lib/training-engine";
import { addRomeDaysAtTime } from "@/lib/rome-calendar";
import {
  CLUBS_PER_LEAGUE,
  getWorldLeagueDefinitions,
  TOTAL_WORLD_CLUBS,
  TOTAL_WORLD_LEAGUES,
  WORLD_LEAGUE_STRUCTURE,
} from "@/lib/world-structure";

const TOTAL_ROUNDS = CLUBS_PER_LEAGUE * 2 - 2;

export async function createNextSeasonFromCompletedSeason(
  transaction: Prisma.TransactionClient,
  completedSeasonId: number,
  now = new Date()
) {
  const season = await transaction.season.findUnique({
    where: { id: completedSeasonId },
    select: {
      id: true,
      number: true,
      status: true,
    },
  });

  if (!season || season.status !== "COMPLETED") {
    return { created: false, seasonId: null as number | null };
  }

  const existingNextSeason = await transaction.season.findUnique({
    where: { number: season.number + 1 },
    select: { id: true },
  });

  if (existingNextSeason) {
    return { created: false, seasonId: existingNextSeason.id };
  }

  const leagues = await transaction.league.findMany({
    where: { seasonId: completedSeasonId },
    orderBy: [{ level: "asc" }, { groupCode: "asc" }],
    select: {
      level: true,
      groupCode: true,
      status: true,
      entries: {
        select: {
          clubId: true,
          played: true,
          won: true,
          drawn: true,
          lost: true,
          pointsFor: true,
          pointsAgainst: true,
          points: true,
          club: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (leagues.length !== TOTAL_WORLD_LEAGUES) {
    throw new Error("SEASON_TRANSITION_LEAGUES_INCOMPLETE");
  }

  const rankedByLeague = new Map<string, ReturnType<typeof createLeagueTable>>();
  const destinations = new Map<number, { level: number; groupCode: string }>();

  for (const league of leagues) {
    if (
      league.status !== "COMPLETED" ||
      league.entries.length !== CLUBS_PER_LEAGUE
    ) {
      throw new Error("SEASON_TRANSITION_LEAGUE_NOT_READY");
    }

    const table = createLeagueTable(
      league.entries.map((entry) => ({
        clubId: entry.clubId,
        clubName: entry.club.name,
        played: entry.played,
        won: entry.won,
        drawn: entry.drawn,
        lost: entry.lost,
        pointsFor: entry.pointsFor,
        pointsAgainst: entry.pointsAgainst,
        points: entry.points,
      }))
    );

    rankedByLeague.set(leagueKey(league.level, league.groupCode), table);

    for (const entry of table) {
      destinations.set(entry.clubId, {
        level: league.level,
        groupCode: league.groupCode,
      });
    }
  }

  for (let level = 2; level <= 4; level += 1) {
    const childGroups = getGroups(level);
    const parentGroups = getGroups(level - 1);

    childGroups.forEach((groupCode, childIndex) => {
      const table = rankedByLeague.get(leagueKey(level, groupCode));
      const champion = table?.[0];
      const parentGroupCode = parentGroups[Math.floor(childIndex / 2)];

      if (!champion || !parentGroupCode) {
        throw new Error("SEASON_TRANSITION_PROMOTION_MAPPING_INVALID");
      }

      destinations.set(champion.clubId, {
        level: level - 1,
        groupCode: parentGroupCode,
      });
    });
  }

  for (let level = 1; level <= 3; level += 1) {
    const parentGroups = getGroups(level);
    const childGroups = getGroups(level + 1);

    parentGroups.forEach((groupCode, parentIndex) => {
      const table = rankedByLeague.get(leagueKey(level, groupCode));
      const seventh = table?.[6];
      const eighth = table?.[7];
      const firstChild = childGroups[parentIndex * 2];
      const secondChild = childGroups[parentIndex * 2 + 1];

      if (!seventh || !eighth || !firstChild || !secondChild) {
        throw new Error("SEASON_TRANSITION_RELEGATION_MAPPING_INVALID");
      }

      destinations.set(seventh.clubId, {
        level: level + 1,
        groupCode: firstChild,
      });
      destinations.set(eighth.clubId, {
        level: level + 1,
        groupCode: secondChild,
      });
    });
  }

  if (destinations.size !== TOTAL_WORLD_CLUBS) {
    throw new Error("SEASON_TRANSITION_CLUBS_INCOMPLETE");
  }

  const assignments = new Map<string, number[]>();
  for (const definition of getWorldLeagueDefinitions()) {
    assignments.set(leagueKey(definition.level, definition.groupCode), []);
  }

  for (const [clubId, destination] of destinations) {
    const key = leagueKey(destination.level, destination.groupCode);
    const clubs = assignments.get(key);

    if (!clubs) {
      throw new Error("SEASON_TRANSITION_DESTINATION_MISSING");
    }

    clubs.push(clubId);
  }

  for (const clubs of assignments.values()) {
    if (clubs.length !== CLUBS_PER_LEAGUE) {
      throw new Error("SEASON_TRANSITION_GROUP_SIZE_INVALID");
    }
    clubs.sort((first, second) => first - second);
  }

  const firstRoundDate = getNextLeagueDate(now);
  const roundDates = buildWeeklyRoundDates(firstRoundDate, TOTAL_ROUNDS);
  const seasonStartsAt = addRomeDaysAtTime(firstRoundDate, -4, 0, 1);
  const week15Friday = getSeasonWeekDate(
    new Map(roundDates.map((date, index) => [index + 1, date])),
    15
  );

  if (!week15Friday) {
    throw new Error("SEASON_TRANSITION_WEEK_15_MISSING");
  }

  const seasonEndsAt = new Date(
    addRomeDaysAtTime(week15Friday, 3, 0, 0).getTime() - 1000
  );

  const nextSeason = await transaction.season.create({
    data: {
      number: season.number + 1,
      name: `Stagione ${season.number + 1}`,
      status: "ACTIVE",
      startsAt: seasonStartsAt,
      endsAt: seasonEndsAt,
    },
    select: {
      id: true,
      number: true,
    },
  });

  for (const definition of getWorldLeagueDefinitions()) {
    const clubIds =
      assignments.get(leagueKey(definition.level, definition.groupCode)) ?? [];

    const league = await transaction.league.create({
      data: {
        seasonId: nextSeason.id,
        name: definition.name,
        level: definition.level,
        groupCode: definition.groupCode,
        status: "ACTIVE",
        currentRound: 0,
        entries: {
          create: clubIds.map((clubId) => ({ clubId })),
        },
      },
      select: { id: true },
    });

    const fixtures = generateDoubleRoundRobin(clubIds);
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
  }

  const seasonRoundDates = new Map(
    roundDates.map((date, index) => [index + 1, date])
  );
  const individualCalendar =
    buildIndividualTournamentCalendar(seasonRoundDates);
  const nationsCupCalendar =
    buildNationsCupCalendar(seasonRoundDates);
  const specialtyCupCalendar =
    buildSpecialtyCupCalendar(seasonRoundDates);

  await transaction.individualTournament.createMany({
    data: individualCalendar.map((tournament) => ({
      seasonId: nextSeason.id,
      leagueRound: tournament.leagueRound,
      type: tournament.type,
      name: tournament.name,
      specialty: tournament.specialty,
      status: "SCHEDULED",
      drawAt: tournament.drawAt,
      finalAt: tournament.finalAt,
    })),
    skipDuplicates: true,
  });

  await transaction.nationsCupTournament.upsert({
    where: { seasonId: nextSeason.id },
    create: {
      seasonId: nextSeason.id,
      leagueRound: nationsCupCalendar.leagueRound,
      name: nationsCupCalendar.name,
      status: "SCHEDULED",
      drawAt: nationsCupCalendar.drawAt,
      finalAt: nationsCupCalendar.finalAt,
    },
    update: {},
  });

  await transaction.$executeRaw`
    INSERT INTO "SpecialtyCupTournament"
      ("seasonId", "leagueRound", "status", "drawAt", "createdAt", "updatedAt")
    VALUES
      (
        ${nextSeason.id},
        ${specialtyCupCalendar.seasonWeek},
        'SCHEDULED',
        ${specialtyCupCalendar.drawAt},
        NOW(),
        NOW()
      )
    ON CONFLICT ("seasonId") DO NOTHING
  `;

  await verifyNewSeasonStructure(transaction, nextSeason.id);

  const players = await transaction.player.findMany({
    where: {
      careerStatus: "ACTIVE",
      clubId: { not: null },
    },
    select: {
      id: true,
      salary: true,
      precisione: true,
      diretto: true,
      sponde: true,
      tattica: true,
      mentalita: true,
      difesa: true,
      realizzazione: true,
      creativita: true,
      misura: true,
    },
  });

  let updatedSalaries = 0;
  for (const player of players) {
    const salary = calculatePlayerWeeklySalary(calculateOverall(player));
    if (salary === player.salary) continue;

    await transaction.player.update({
      where: { id: player.id },
      data: { salary },
    });
    updatedSalaries += 1;
  }

  const oldMemberships = new Map<number, { level: number; groupCode: string }>();
  for (const league of leagues) {
    for (const entry of league.entries) {
      oldMemberships.set(entry.clubId, {
        level: league.level,
        groupCode: league.groupCode,
      });
    }
  }

  const movements = Array.from(destinations.entries()).filter(([clubId, next]) => {
    const previous = oldMemberships.get(clubId);
    return previous && previous.level !== next.level;
  });

  if (movements.length > 0) {
    await transaction.gameEvent.createMany({
      data: movements.map(([clubId, next]) => {
        const previous = oldMemberships.get(clubId)!;
        const promoted = next.level < previous.level;

        return {
          clubId,
          type: promoted ? "PROMOTION" : "RELEGATION",
          title: promoted ? "Promozione!" : "Retrocessione",
          description: promoted
            ? `Il club sale dalla Serie ${previous.level} alla Serie ${next.level}.`
            : `Il club scende dalla Serie ${previous.level} alla Serie ${next.level}.`,
          createdAt: now,
        };
      }),
    });
  }

  await transaction.gameEvent.create({
    data: {
      clubId: null,
      type: "Campionato",
      title: `Stagione ${nextSeason.number} pronta`,
      description:
        "Promozioni e retrocessioni applicate. I nuovi gironi e il calendario sono stati pubblicati.",
      createdAt: now,
    },
  });

  return {
    created: true,
    seasonId: nextSeason.id,
    seasonNumber: nextSeason.number,
    movements: movements.length,
    updatedSalaries,
    firstRoundDate,
  };
}

function leagueKey(level: number, groupCode: string) {
  return `${level}:${groupCode}`;
}

function getGroups(level: number) {
  const tier = WORLD_LEAGUE_STRUCTURE.find((item) => item.level === level);
  if (!tier) throw new Error("SEASON_TRANSITION_LEVEL_INVALID");
  return [...tier.groupCodes];
}


async function verifyNewSeasonStructure(
  transaction: Prisma.TransactionClient,
  seasonId: number
) {
  const [
    leagueCount,
    entryCount,
    fixtureCount,
    tournamentCount,
    nationsCupCount,
    specialtyCupRows,
  ] = await Promise.all([
    transaction.league.count({ where: { seasonId } }),
    transaction.leagueEntry.count({
      where: { league: { seasonId } },
    }),
    transaction.leagueFixture.count({
      where: { league: { seasonId } },
    }),
    transaction.individualTournament.count({
      where: { seasonId },
    }),
    transaction.nationsCupTournament.count({
      where: { seasonId },
    }),
    transaction.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS "count"
      FROM "SpecialtyCupTournament"
      WHERE "seasonId" = ${seasonId}
    `,
  ]);

  const expectedFixtures =
    TOTAL_WORLD_LEAGUES * CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1);
  const specialtyCupCount = Number(specialtyCupRows[0]?.count ?? 0);

  if (
    leagueCount !== TOTAL_WORLD_LEAGUES ||
    entryCount !== TOTAL_WORLD_CLUBS ||
    fixtureCount !== expectedFixtures ||
    tournamentCount !== INDIVIDUAL_TOURNAMENT_DEFINITIONS.length ||
    nationsCupCount !== 1 ||
    specialtyCupCount !== 1
  ) {
    throw new Error("SEASON_TRANSITION_NEW_SEASON_INCOMPLETE");
  }
}
