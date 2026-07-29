import {
  calculateMatchWinProbabilities,
  type MatchWinProbabilities,
} from "@/lib/match-engine";

export type MatchWinner =
  | "HOME"
  | "AWAY";

export type SimulatedMatchResult = {
  winner: MatchWinner;

  randomValue: number;
  randomPercentage: number;

  probabilities:
    MatchWinProbabilities;
};

export function simulateMatchWinner(
  homePerformanceRating: number,
  awayPerformanceRating: number,
  randomValue: number =
    Math.random()
): SimulatedMatchResult {
  if (
    !Number.isFinite(
      randomValue
    ) ||
    randomValue < 0 ||
    randomValue > 1
  ) {
    throw new Error(
      "Il valore casuale deve essere compreso tra 0 e 1."
    );
  }

  const probabilities =
    calculateMatchWinProbabilities(
      homePerformanceRating,
      awayPerformanceRating
    );

  const randomPercentage =
    roundValue(
      randomValue * 100
    );

  const winner:
    MatchWinner =
      randomPercentage <
      probabilities.homeWinProbability
        ? "HOME"
        : "AWAY";

  return {
    winner,

    randomValue:
      roundValue(
        randomValue
      ),

    randomPercentage,

    probabilities,
  };
}

function roundValue(
  value: number
) {
  return Math.round(
    value * 10000
  ) / 10000;
}