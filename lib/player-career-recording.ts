import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  type FixtureCareerFormation,
  type FixturePlayerSide,
  type SimulatedPlayerFixture,
} from "@/lib/fixture-player-simulator";
import type { FormationSlot } from "@/lib/match-engine";
import { calculateOverall } from "@/lib/training-engine";

type CareerClubSnapshot = {
  id: number;
  name: string;
};

type RecordPlayerCareerInput = {
  fixtureId: number;
  playedAt: Date;
  homeClub: CareerClubSnapshot;
  awayClub: CareerClubSnapshot;
  homeFormation: FixtureCareerFormation;
  awayFormation: FixtureCareerFormation;
  simulation: SimulatedPlayerFixture;
};

export type RecordedPlayerCareerSummary = {
  games: number;
  appearances: number;
  performances: number;
};

export async function recordPlayerFixtureCareer(
  transaction: Prisma.TransactionClient,
  input: RecordPlayerCareerInput
): Promise<RecordedPlayerCareerSummary> {
  const appearanceIds = new Map<string, number>();

  await createSideAppearances(
    transaction,
    input,
    "HOME",
    input.homeClub,
    input.awayClub,
    input.homeFormation,
    input.simulation.homeScore,
    input.simulation.awayScore,
    appearanceIds
  );
  await createSideAppearances(
    transaction,
    input,
    "AWAY",
    input.awayClub,
    input.homeClub,
    input.awayFormation,
    input.simulation.awayScore,
    input.simulation.homeScore,
    appearanceIds
  );

  let performanceCount = 0;

  for (const game of input.simulation.games) {
    const gameRecord = await transaction.leagueFixtureGame.create({
      data: {
        fixtureId: input.fixtureId,
        order: game.order,
        specialty: game.specialty,
        gameType: game.gameType,
        targetPoints: game.targetPoints,
        winnerSide: game.result.winner,
        homePoints: game.homePoints,
        awayPoints: game.awayPoints,
        reconstructed: false,
        homePerformanceRating: game.homePerformanceRating,
        awayPerformanceRating: game.awayPerformanceRating,
        homeWinProbability: game.result.probabilities.homeWinProbability,
        awayWinProbability: game.result.probabilities.awayWinProbability,
        randomValue: game.result.randomValue,
        createdAt: input.playedAt,
      },
    });

    const performances = game.participants.map((participant) => {
      const appearanceId = appearanceIds.get(
        getAppearanceKey(participant.side, participant.player.id)
      );

      if (appearanceId === undefined) {
        throw new Error("PLAYER_APPEARANCE_NOT_FOUND");
      }

      return {
        fixtureGameId: gameRecord.id,
        appearanceId,
        result: participant.result,
        specialtyRating: participant.performance.specialtyRating,
        performanceRating: participant.performance.performanceRating,
        formModifier: participant.performance.formModifier,
        moraleModifier: participant.performance.moraleModifier,
        experienceModifier: participant.performance.experienceModifier,
        createdAt: input.playedAt,
      };
    });

    await transaction.playerGamePerformance.createMany({
      data: performances,
    });
    performanceCount += performances.length;
  }

  return {
    games: input.simulation.games.length,
    appearances: appearanceIds.size,
    performances: performanceCount,
  };
}

async function createSideAppearances(
  transaction: Prisma.TransactionClient,
  input: RecordPlayerCareerInput,
  side: FixturePlayerSide,
  club: CareerClubSnapshot,
  opponentClub: CareerClubSnapshot,
  initialFormation: FixtureCareerFormation,
  teamScore: number,
  opponentScore: number,
  appearanceIds: Map<string, number>
) {
  const participants = input.simulation.games.flatMap((game) =>
    game.participants.filter((participant) => participant.side === side)
  );
  const uniquePlayers = new Map<
    number,
    {
      player: (typeof participants)[number]["player"];
      firstSlot: FormationSlot;
      performances: typeof participants;
    }
  >();

  for (const participant of participants) {
    const existing = uniquePlayers.get(participant.player.id);
    if (existing) {
      existing.performances.push(participant);
      continue;
    }

    uniquePlayers.set(participant.player.id, {
      player: participant.player,
      firstSlot: participant.slot,
      performances: [participant],
    });
  }

  const usedStorageSlots = new Set<string>();

  for (const { player, firstSlot, performances } of uniquePlayers.values()) {
    const performanceRating = roundRating(
      performances.reduce(
        (total, participant) =>
          total + participant.performance.performanceRating,
        0
      ) / performances.length
    );
    const storageSlot = createStorageSlot(
      firstSlot,
      player.id,
      usedStorageSlots,
      initialFormation
    );
    const appearance = await transaction.playerFixtureAppearance.create({
      data: {
        fixtureId: input.fixtureId,
        playerId: player.id,
        clubId: club.id,
        playerFirstName: player.firstName,
        playerLastName: player.lastName,
        playerNationality: player.nationality,
        playerAge: player.age,
        clubName: club.name,
        opponentClubName: opponentClub.name,
        side,
        formationSlot: storageSlot,
        teamScore,
        opponentScore,
        overall: calculateOverall(player),
        form: player.form,
        morale: player.morale,
        experience: player.experience,
        performanceRating,
        playedAt: input.playedAt,
        createdAt: input.playedAt,
      },
    });

    usedStorageSlots.add(storageSlot);
    appearanceIds.set(
      getAppearanceKey(side, player.id),
      appearance.id
    );
  }
}

function createStorageSlot(
  slot: FormationSlot,
  playerId: number,
  usedSlots: Set<string>,
  initialFormation: FixtureCareerFormation
) {
  const isInitialStarter = initialFormation[slot]?.id === playerId;
  const preferred = isInitialStarter ? slot : `${slot}:${playerId}`;

  if (!usedSlots.has(preferred)) return preferred;
  return `${slot}:${playerId}`;
}

function getAppearanceKey(
  side: FixturePlayerSide,
  playerId: number
) {
  return `${side}:${playerId}`;
}

function roundRating(value: number) {
  return Math.round(value * 1000) / 1000;
}
