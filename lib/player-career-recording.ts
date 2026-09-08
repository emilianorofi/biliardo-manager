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
    const gameRecord =
      await transaction.leagueFixtureGame.create({
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
          homePerformanceRating:
            game.homePerformanceRating,
          awayPerformanceRating:
            game.awayPerformanceRating,
          homeWinProbability:
            game.result.probabilities.homeWinProbability,
          awayWinProbability:
            game.result.probabilities.awayWinProbability,
          randomValue: game.result.randomValue,
          createdAt: input.playedAt,
        },
      });

    const performances = game.participants.map(
      (participant) => {
        const appearanceId = appearanceIds.get(
          getAppearanceKey(participant.side, participant.slot)
        );

        if (appearanceId === undefined) {
          throw new Error(
            "PLAYER_APPEARANCE_NOT_FOUND"
          );
        }

        return {
          fixtureGameId: gameRecord.id,
          appearanceId,
          result: participant.result,
          specialtyRating:
            participant.performance.specialtyRating,
          performanceRating:
            participant.performance.performanceRating,
          formModifier:
            participant.performance.formModifier,
          moraleModifier:
            participant.performance.moraleModifier,
          experienceModifier:
            participant.performance.experienceModifier,
          createdAt: input.playedAt,
        };
      }
    );

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
  formation: FixtureCareerFormation,
  teamScore: number,
  opponentScore: number,
  appearanceIds: Map<string, number>
) {
  const slots: FormationSlot[] = ["A", "B", "C"];

  for (const slot of slots) {
    const player = formation[slot];
    const performances = input.simulation.games.flatMap(
      (game) =>
        game.participants.filter(
          (participant) =>
            participant.side === side &&
            participant.slot === slot
        )
    );

    if (performances.length !== 3) {
      throw new Error(
        "Ogni giocatore deve disputare esattamente tre prove."
      );
    }

    const performanceRating = roundRating(
      performances.reduce(
        (total, participant) =>
          total + participant.performance.performanceRating,
        0
      ) / performances.length
    );
    const appearance =
      await transaction.playerFixtureAppearance.create({
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
          formationSlot: slot,
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

    appearanceIds.set(
      getAppearanceKey(side, slot),
      appearance.id
    );
  }
}

function getAppearanceKey(
  side: FixturePlayerSide,
  slot: FormationSlot
) {
  return `${side}:${slot}`;
}

function roundRating(value: number) {
  return Math.round(value * 1000) / 1000;
}
