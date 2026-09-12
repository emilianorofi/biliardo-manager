import {
  calculatePlayerPerformance,
  MATCH_SHOT_SCORES,
  MATCH_TARGET_POINTS,
  MATCH_TOTAL_SCORE_STEP,
  type MatchPerformancePlayerValues,
  type MatchSpecialty,
} from "@/lib/match-engine";
import { simulateMatchWinner } from "@/lib/match-simulator";
import { calculateOverall } from "@/lib/training-engine";
import type { IndividualTournamentType } from "@/lib/individual-tournament-calendar";

export const INDIVIDUAL_TOURNAMENT_SIZE = 256;

export type IndividualMatchPlayer = MatchPerformancePlayerValues & {
  id: number;
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
};

export type RankedIndividualTournamentPlayer = {
  player: IndividualMatchPlayer;
  overall: number;
  ranking: number;
};

export type IndividualTournamentEntrySlot = {
  id: number;
  playerId: number;
  drawPosition: number;
};

export type IndividualTournamentRosterReplacement = {
  entryId: number;
  drawPosition: number;
  previousPlayerId: number;
  replacementPlayerId: number;
  rankingAtDraw: number;
  overallAtDraw: number;
};

export function rankIndividualTournamentPlayers(
  players: IndividualMatchPlayer[]
): RankedIndividualTournamentPlayer[] {
  return players
    .map((player) => ({
      player,
      overall: calculateOverall(player),
    }))
    .sort(
      (first, second) =>
        second.overall - first.overall ||
        first.player.id - second.player.id
    )
    .slice(0, INDIVIDUAL_TOURNAMENT_SIZE)
    .map((qualified, index) => ({
      ...qualified,
      ranking: index + 1,
    }));
}

export function planIndividualTournamentRosterReplacements(
  entries: IndividualTournamentEntrySlot[],
  qualified: RankedIndividualTournamentPlayer[]
): IndividualTournamentRosterReplacement[] {
  const qualifiedIds = new Set(
    qualified.map((candidate) => candidate.player.id)
  );
  const enteredIds = new Set(
    entries.map((entry) => entry.playerId)
  );
  const outgoing = entries
    .filter((entry) => !qualifiedIds.has(entry.playerId))
    .sort(
      (first, second) =>
        first.drawPosition - second.drawPosition
    );
  const incoming = qualified.filter(
    (candidate) => !enteredIds.has(candidate.player.id)
  );

  if (outgoing.length !== incoming.length) {
    throw new Error(
      "INDIVIDUAL_TOURNAMENT_REPLACEMENTS_INCOMPLETE"
    );
  }

  return outgoing.map((entry, index) => ({
    entryId: entry.id,
    drawPosition: entry.drawPosition,
    previousPlayerId: entry.playerId,
    replacementPlayerId: incoming[index].player.id,
    rankingAtDraw: incoming[index].ranking,
    overallAtDraw: incoming[index].overall,
  }));
}

export function getIndividualTournamentWalkover(
  playerOneId: number | null,
  playerTwoId: number | null
) {
  if (playerOneId !== null && playerTwoId !== null) {
    return null;
  }

  return {
    winnerPlayerId: playerOneId ?? playerTwoId,
    playerOneWins: playerOneId === null ? 0 : 2,
    playerTwoWins: playerTwoId === null ? 0 : 2,
  };
}

export function shuffleIndividualDraw<T>(
  values: T[],
  random: () => number = Math.random
) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [
      shuffled[targetIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function simulateIndividualBestOfThree(
  playerOne: IndividualMatchPlayer,
  playerTwo: IndividualMatchPlayer,
  tournamentType: IndividualTournamentType,
  random: () => number = Math.random
) {
  const specialties = getMatchSpecialties(tournamentType, random);
  let playerOneWins = 0;
  let playerTwoWins = 0;
  const games = [];

  for (const [index, specialty] of specialties.entries()) {
    if (playerOneWins === 2 || playerTwoWins === 2) {
      break;
    }

    const playerOnePerformance = calculatePlayerPerformance(
      playerOne,
      specialty
    );
    const playerTwoPerformance = calculatePlayerPerformance(
      playerTwo,
      specialty
    );
    const result = simulateMatchWinner(
      playerOnePerformance.performanceRating,
      playerTwoPerformance.performanceRating,
      random()
    );
    const score = calculateIndividualGameScore({
      specialty,
      winnerSide: result.winner === "HOME" ? "PLAYER_ONE" : "PLAYER_TWO",
      playerOnePerformanceRating:
        playerOnePerformance.performanceRating,
      playerTwoPerformanceRating:
        playerTwoPerformance.performanceRating,
      randomValue: result.randomValue,
    });

    if (result.winner === "HOME") {
      playerOneWins += 1;
    } else {
      playerTwoWins += 1;
    }

    games.push({
      order: index + 1,
      specialty,
      winnerSide: result.winner === "HOME" ? "PLAYER_ONE" : "PLAYER_TWO",
      winnerPlayerId:
        result.winner === "HOME" ? playerOne.id : playerTwo.id,
      playerOnePerformanceRating:
        playerOnePerformance.performanceRating,
      playerTwoPerformanceRating:
        playerTwoPerformance.performanceRating,
      playerOneScore: score.playerOneScore,
      playerTwoScore: score.playerTwoScore,
    });
  }

  return {
    winnerPlayerId:
      playerOneWins === 2 ? playerOne.id : playerTwo.id,
    loserPlayerId:
      playerOneWins === 2 ? playerTwo.id : playerOne.id,
    playerOneWins,
    playerTwoWins,
    games,
  };
}

export function calculateIndividualGameScore({
  specialty,
  winnerSide,
  playerOnePerformanceRating,
  playerTwoPerformanceRating,
  randomValue,
}: {
  specialty: MatchSpecialty;
  winnerSide: "PLAYER_ONE" | "PLAYER_TWO";
  playerOnePerformanceRating: number;
  playerTwoPerformanceRating: number;
  randomValue: number;
}) {
  const targetPoints = MATCH_TARGET_POINTS[specialty];
  const winnerRating =
    winnerSide === "PLAYER_ONE"
      ? playerOnePerformanceRating
      : playerTwoPerformanceRating;
  const loserRating =
    winnerSide === "PLAYER_ONE"
      ? playerTwoPerformanceRating
      : playerOnePerformanceRating;
  const ratingRatio = clamp(loserRating / Math.max(1, winnerRating), 0.4, 1.2);
  const losingShare = clamp(
    0.48 + ratingRatio * 0.3 + clamp(randomValue, 0, 1) * 0.16,
    0.42,
    0.96
  );
  const rawLoserScore = clamp(
    Math.round(targetPoints * losingShare),
    MATCH_SHOT_SCORES[specialty][0],
    targetPoints - 1
  );
  const scoreStep = MATCH_TOTAL_SCORE_STEP[specialty];
  const loserScore = clamp(
    Math.round(rawLoserScore / scoreStep) * scoreStep,
    MATCH_SHOT_SCORES[specialty][0],
    targetPoints - scoreStep
  );
  const winnerScore = calculateWinnerScore({
    specialty,
    targetPoints,
    winnerRating,
    loserRating,
    randomValue,
  });

  return winnerSide === "PLAYER_ONE"
    ? {
        playerOneScore: winnerScore,
        playerTwoScore: loserScore,
      }
    : {
        playerOneScore: loserScore,
        playerTwoScore: winnerScore,
      };
}

const EXACT_FINISH_PROBABILITY = 0.05;
const RARE_HIGH_OVERSHOOT_PROBABILITY = 0.015;

const MAXIMUM_WINNER_OVERSHOOT: Record<MatchSpecialty, number> = {
  ITALIANA: 15,
  GORIZIANA: 110,
  TUTTI_DOPPI: 108,
};

const COMMON_WINNER_OVERSHOOT: Record<MatchSpecialty, number> = {
  ITALIANA: 15,
  GORIZIANA: 50,
  TUTTI_DOPPI: 68,
};

function calculateWinnerScore({
  specialty,
  targetPoints,
  winnerRating,
  loserRating,
  randomValue,
}: {
  specialty: MatchSpecialty;
  targetPoints: number;
  winnerRating: number;
  loserRating: number;
  randomValue: number;
}) {
  const finishRoll = getFinishRoll({
    specialty,
    winnerRating,
    loserRating,
    randomValue,
  });

  if (finishRoll < EXACT_FINISH_PROBABILITY) return targetPoints;

  const scoreStep = MATCH_TOTAL_SCORE_STEP[specialty];
  const maximumSteps = Math.floor(
    MAXIMUM_WINNER_OVERSHOOT[specialty] / scoreStep
  );
  const overshootRoll =
    (finishRoll - EXACT_FINISH_PROBABILITY) /
    (1 - EXACT_FINISH_PROBABILITY);
  const commonMaximumSteps = Math.floor(
    COMMON_WINNER_OVERSHOOT[specialty] / scoreStep
  );
  const commonFinishProbability = 1 - RARE_HIGH_OVERSHOOT_PROBABILITY;
  const overshootSteps =
    overshootRoll < commonFinishProbability
      ? Math.min(
          commonMaximumSteps,
          1 +
            Math.floor(
              Math.pow(overshootRoll / commonFinishProbability, 2.4) *
                commonMaximumSteps
            )
        )
      : Math.min(
          maximumSteps,
          commonMaximumSteps +
            1 +
            Math.floor(
              ((overshootRoll - commonFinishProbability) /
                RARE_HIGH_OVERSHOOT_PROBABILITY) *
                (maximumSteps - commonMaximumSteps)
            )
        );

  return targetPoints + overshootSteps * scoreStep;
}

function getFinishRoll({
  specialty,
  winnerRating,
  loserRating,
  randomValue,
}: {
  specialty: MatchSpecialty;
  winnerRating: number;
  loserRating: number;
  randomValue: number;
}) {
  const specialtySalt: Record<MatchSpecialty, number> = {
    ITALIANA: 0x2c1b3c6d,
    GORIZIANA: 0x297a2d39,
    TUTTI_DOPPI: 0x1b873593,
  };
  let state =
    Math.floor(clamp(randomValue, 0, 1) * 0xffffffff) ^
    specialtySalt[specialty] ^
    Math.round(winnerRating * 1009) ^
    Math.round(loserRating * 9176);

  state = Math.imul(state ^ (state >>> 16), 0x7feb352d);
  state = Math.imul(state ^ (state >>> 15), 0x846ca68b);
  state ^= state >>> 16;

  return (state >>> 0) / 0x100000000;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getMatchSpecialties(
  tournamentType: IndividualTournamentType,
  random: () => number
): MatchSpecialty[] {
  if (tournamentType === "ITALIANA") {
    return ["ITALIANA", "ITALIANA", "ITALIANA"];
  }

  if (tournamentType === "GORIZIANA") {
    return ["GORIZIANA", "GORIZIANA", "GORIZIANA"];
  }

  if (tournamentType === "TUTTI_DOPPI") {
    return ["TUTTI_DOPPI", "TUTTI_DOPPI", "TUTTI_DOPPI"];
  }

  return shuffleIndividualDraw<MatchSpecialty>(
    ["ITALIANA", "GORIZIANA", "TUTTI_DOPPI"],
    random
  );
}
