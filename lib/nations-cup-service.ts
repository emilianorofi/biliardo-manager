import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { simulateFixtureWithPlayers, type FixtureCareerPlayer } from "@/lib/fixture-player-simulator";
import { calculateFixtureStandingsDeltas } from "@/lib/league-standings";
import { buildNationsCupCalendar } from "@/lib/nations-cup-calendar";
import {
  buildNationsCupGroupFixtures,
  buildNationsCupQuarterFinals,
  NATIONS_CUP_GROUPS,
  resolveNationsCupKnockoutTie,
  selectNationsCupTeams,
  type NationsCupGroup,
  type NationsCupTeam,
} from "@/lib/nations-cup";
import { prisma } from "@/lib/prisma";

const PLAYER_SELECT = {
  id: true, clubId: true, firstName: true, lastName: true, nationality: true,
  age: true, form: true, morale: true, experience: true, talent: true,
  precisione: true, diretto: true, sponde: true, tattica: true,
  mentalita: true, difesa: true, realizzazione: true, creativita: true,
  misura: true,
} as const;

const ENTRY_INCLUDE = {
  firstPlayer: { select: PLAYER_SELECT },
  secondPlayer: { select: PLAYER_SELECT },
  thirdPlayer: { select: PLAYER_SELECT },
} as const;

export async function initializeNationsCup() {
  const referenceLeague = await prisma.league.findFirst({
    where: {
      level: 1,
      groupCode: "A",
      season: { status: { in: ["PREPARATION", "ACTIVE"] } },
    },
    orderBy: { season: { number: "desc" } },
    select: {
      seasonId: true,
      fixtures: {
        orderBy: [{ round: "asc" }, { id: "asc" }],
        select: { round: true, scheduledAt: true },
      },
    },
  });
  if (!referenceLeague) return 0;

  const roundDates = new Map<number, Date>();
  for (const fixture of referenceLeague.fixtures) {
    if (!roundDates.has(fixture.round)) roundDates.set(fixture.round, fixture.scheduledAt);
  }
  const calendar = buildNationsCupCalendar(roundDates);
  const cup = await prisma.nationsCupTournament.upsert({
    where: { seasonId: referenceLeague.seasonId },
    create: {
      seasonId: referenceLeague.seasonId,
      leagueRound: calendar.leagueRound,
      name: calendar.name,
      drawAt: calendar.drawAt,
      finalAt: calendar.finalAt,
    },
    update: {},
    select: { id: true },
  });
  return cup.id;
}

export async function drawNationsCup(tournamentId: number, scheduledAt: Date) {
  return prisma.$transaction(async (tx) => {
    await lockCup(tx, tournamentId);
    const cup = await tx.nationsCupTournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, status: true, drawAt: true, seasonId: true },
    });
    if (!cup || cup.status !== "SCHEDULED" || cup.drawAt.getTime() !== scheduledAt.getTime()) {
      return { status: "SKIPPED" as const, teams: 0, matches: 0 };
    }

    const players = await tx.player.findMany({
      where: { careerStatus: "ACTIVE" },
      select: PLAYER_SELECT,
    });
    const teams = selectNationsCupTeams(players);
    await tx.nationsCupEntry.createMany({
      data: teams.map((team) => ({
        tournamentId,
        nationCode: team.code,
        nationName: team.name,
        nationFlag: team.flag,
        seed: team.seed,
        groupCode: team.group,
        rankingTotal: team.rankingTotal,
        firstPlayerId: team.players[0].player.id,
        secondPlayerId: team.players[1].player.id,
        thirdPlayerId: team.players[2].player.id,
      })),
    });
    const entries = await tx.nationsCupEntry.findMany({
      where: { tournamentId },
      select: { id: true, seed: true, groupCode: true },
    });
    const bySeed = new Map(entries.map((entry) => [entry.seed, entry]));
    const calendar = await getCupCalendar(tx, cup.seasonId);
    const fixtures = buildNationsCupGroupFixtures(
      entries.map((entry) => ({ seed: entry.seed, group: entry.groupCode as NationsCupGroup }))
    );
    await tx.nationsCupMatch.createMany({
      data: fixtures.map((fixture) => ({
        tournamentId,
        stage: `GROUP_${fixture.matchday}`,
        stageOrder: fixture.matchday,
        groupCode: fixture.group,
        position: (NATIONS_CUP_GROUPS.indexOf(fixture.group) * 6) + fixture.position,
        scheduledAt: calendar.stages[fixture.matchday].scheduledAt,
        homeEntryId: bySeed.get(fixture.homeSeed)!.id,
        awayEntryId: bySeed.get(fixture.awaySeed)!.id,
      })),
    });
    await tx.nationsCupTournament.update({
      where: { id: tournamentId },
      data: { status: "DRAWN", currentStage: "GROUP_1" },
    });
    await tx.gameEvent.create({
      data: {
        type: "Coppa delle Nazioni",
        title: "Sorteggiati i quattro gironi",
        description: "Le migliori 16 nazioni hanno convocato i propri tre giocatori più forti.",
        createdAt: scheduledAt,
      },
    });
    return { status: "PROCESSED" as const, teams: teams.length, matches: fixtures.length };
  }, { isolationLevel: "Serializable", timeout: 120000 });
}

export async function playNationsCupStage(candidateMatchId: number, scheduledAt: Date) {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.nationsCupMatch.findUnique({
      where: { id: candidateMatchId },
      select: { tournamentId: true, stage: true, stageOrder: true, status: true, scheduledAt: true },
    });
    if (!candidate || candidate.status !== "SCHEDULED" || candidate.scheduledAt.getTime() !== scheduledAt.getTime()) {
      return { status: "SKIPPED" as const, matches: 0 };
    }
    await lockCup(tx, candidate.tournamentId);
    const cup = await tx.nationsCupTournament.findUnique({
      where: { id: candidate.tournamentId },
      select: { id: true, name: true, seasonId: true },
    });
    if (!cup) throw new Error("NATIONS_CUP_NOT_FOUND");

    const matches = await tx.nationsCupMatch.findMany({
      where: {
        tournamentId: cup.id,
        stageOrder: candidate.stageOrder,
        status: "SCHEDULED",
        scheduledAt,
      },
      orderBy: { position: "asc" },
      include: {
        homeEntry: { include: ENTRY_INCLUDE },
        awayEntry: { include: ENTRY_INCLUDE },
      },
    });
    for (const match of matches) {
      const home = toTeam(match.homeEntry);
      const away = toTeam(match.awayEntry);
      const simulation = simulateFixtureWithPlayers(toFormation(home), toFormation(away));
      const isKnockout = candidate.stageOrder >= 4;
      const tieBreak = isKnockout && simulation.winner === "DRAW"
        ? resolveNationsCupKnockoutTie(home, away)
        : null;
      const winnerEntryId = simulation.winner === "HOME"
        ? match.homeEntryId
        : simulation.winner === "AWAY"
          ? match.awayEntryId
          : tieBreak?.winnerSeed === home.seed
            ? match.homeEntryId
            : tieBreak?.winnerSeed === away.seed
              ? match.awayEntryId
              : null;

      await tx.nationsCupMatch.update({
        where: { id: match.id },
        data: {
          status: "PLAYED",
          playedAt: scheduledAt,
          homeScore: simulation.homeScore,
          awayScore: simulation.awayScore,
          winnerEntryId,
          tieBreakSpecialty: tieBreak?.specialty,
          tieBreakHomePlayerId: tieBreak?.homePlayerId,
          tieBreakAwayPlayerId: tieBreak?.awayPlayerId,
          tieBreakWinnerPlayerId: tieBreak?.winnerPlayerId,
          games: simulation.games as unknown as Prisma.InputJsonValue,
        },
      });

      if (!isKnockout) {
        const deltas = calculateFixtureStandingsDeltas(simulation.homeScore, simulation.awayScore);
        await tx.nationsCupEntry.update({ where: { id: match.homeEntryId }, data: incrementStanding(deltas.home) });
        await tx.nationsCupEntry.update({ where: { id: match.awayEntryId }, data: incrementStanding(deltas.away) });
      }
    }

    const next = await createNextStage(tx, cup.id, cup.seasonId, candidate.stageOrder);
    await tx.nationsCupTournament.update({
      where: { id: cup.id },
      data: next.cupUpdate,
    });
    await tx.gameEvent.create({
      data: {
        type: "Coppa delle Nazioni",
        title: `${candidate.stage} completata`,
        description: `${matches.length} incontri disputati nella ${cup.name}.`,
        createdAt: scheduledAt,
      },
    });
    return { status: "PROCESSED" as const, matches: matches.length, nextStage: next.cupUpdate.currentStage ?? null };
  }, { isolationLevel: "Serializable", timeout: 120000 });
}

async function createNextStage(
  tx: Prisma.TransactionClient,
  tournamentId: number,
  seasonId: number,
  stageOrder: number
) {
  if (stageOrder < 3) {
    return { cupUpdate: { status: "IN_PROGRESS", currentStage: `GROUP_${stageOrder + 1}` } };
  }
  const calendar = await getCupCalendar(tx, seasonId);
  if (stageOrder === 3) {
    const entries = await tx.nationsCupEntry.findMany({ where: { tournamentId } });
    const qualified = Object.fromEntries(NATIONS_CUP_GROUPS.map((group) => {
      const groupEntries = entries.filter((entry) => entry.groupCode === group);
      const actual = [...groupEntries].sort((a, b) =>
        b.points - a.points ||
        (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst) ||
        b.pointsFor - a.pointsFor || a.seed - b.seed
      );
      return [group, [actual[0].seed, actual[1].seed] as const];
    })) as Record<NationsCupGroup, readonly [number, number]>;
    const quarters = buildNationsCupQuarterFinals(qualified);
    const bySeed = new Map(entries.map((entry) => [entry.seed, entry.id]));
    await tx.nationsCupMatch.createMany({ data: quarters.map((match) => ({
      tournamentId, stage: "QUARTER_FINAL", stageOrder: 4, position: match.position,
      scheduledAt: calendar.stages[4].scheduledAt,
      homeEntryId: bySeed.get(match.homeSeed)!, awayEntryId: bySeed.get(match.awaySeed)!,
    })) });
    return { cupUpdate: { status: "IN_PROGRESS", currentStage: "QUARTER_FINAL" } };
  }
  if (stageOrder === 4 || stageOrder === 5) {
    const completed = await tx.nationsCupMatch.findMany({
      where: { tournamentId, stageOrder }, orderBy: { position: "asc" },
      select: { winnerEntryId: true },
    });
    if (completed.some((match) => !match.winnerEntryId)) throw new Error("NATIONS_CUP_WINNER_MISSING");
    const nextOrder = stageOrder + 1;
    const stage = nextOrder === 5 ? "SEMI_FINAL" : "FINAL";
    await tx.nationsCupMatch.createMany({ data: Array.from({ length: completed.length / 2 }, (_, index) => ({
      tournamentId, stage, stageOrder: nextOrder, position: index + 1,
      scheduledAt: calendar.stages[nextOrder].scheduledAt,
      homeEntryId: completed[index * 2].winnerEntryId!,
      awayEntryId: completed[index * 2 + 1].winnerEntryId!,
    })) });
    return { cupUpdate: { status: "IN_PROGRESS", currentStage: stage } };
  }
  const final = await tx.nationsCupMatch.findFirst({
    where: { tournamentId, stageOrder: 6 }, include: { winnerEntry: true },
  });
  if (!final?.winnerEntry) throw new Error("NATIONS_CUP_CHAMPION_MISSING");
  return { cupUpdate: { status: "COMPLETED", currentStage: "FINAL", championCode: final.winnerEntry.nationCode } };
}

function toFormation(team: NationsCupTeam<FixtureCareerPlayer>) {
  return { A: team.players[0].player, B: team.players[1].player, C: team.players[2].player };
}

function toTeam(entry: {
  seed: number; nationCode: string; nationName: string; nationFlag: string;
  groupCode: string; rankingTotal: number;
  firstPlayer: FixtureCareerPlayer; secondPlayer: FixtureCareerPlayer; thirdPlayer: FixtureCareerPlayer;
}): NationsCupTeam<FixtureCareerPlayer> {
  const players = [entry.firstPlayer, entry.secondPlayer, entry.thirdPlayer];
  return {
    seed: entry.seed, code: entry.nationCode, name: entry.nationName, flag: entry.nationFlag,
    group: entry.groupCode as NationsCupGroup, rankingTotal: entry.rankingTotal,
    players: players.map((player, index) => ({ player, ranking: index + 1, overall: 0 })),
  };
}

async function getCupCalendar(tx: Prisma.TransactionClient, seasonId: number) {
  const league = await tx.league.findFirst({
    where: { seasonId, level: 1, groupCode: "A" },
    select: { fixtures: { select: { round: true, scheduledAt: true }, orderBy: [{ round: "asc" }, { id: "asc" }] } },
  });
  if (!league) throw new Error("NATIONS_CUP_REFERENCE_LEAGUE_MISSING");
  const dates = new Map<number, Date>();
  for (const fixture of league.fixtures) if (!dates.has(fixture.round)) dates.set(fixture.round, fixture.scheduledAt);
  return buildNationsCupCalendar(dates);
}

async function lockCup(tx: Prisma.TransactionClient, tournamentId: number) {
  await tx.$queryRaw`SELECT "id" FROM "NationsCupTournament" WHERE "id" = ${tournamentId} FOR UPDATE`;
}

function incrementStanding(delta: {
  played: number; won: number; drawn: number; lost: number;
  pointsFor: number; pointsAgainst: number; points: number;
}) {
  return {
    played: { increment: delta.played }, won: { increment: delta.won },
    drawn: { increment: delta.drawn }, lost: { increment: delta.lost },
    pointsFor: { increment: delta.pointsFor },
    pointsAgainst: { increment: delta.pointsAgainst },
    points: { increment: delta.points },
  };
}
