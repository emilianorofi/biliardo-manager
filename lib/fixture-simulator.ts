import {
  getLeagueMatchDefinitions,
  type MatchSpecialty,
} from "@/lib/match-engine";

import {
  simulateMatchWinner,
  type SimulatedMatchResult,
} from "@/lib/match-simulator";

export type FixtureWinner =
  | "HOME"
  | "AWAY"
  | "DRAW";

export type SimulatedFixtureMatch = {
  order: number;

  specialty:
    MatchSpecialty;

  targetPoints: number;

  homePerformanceRating: number;
  awayPerformanceRating: number;

  result:
    SimulatedMatchResult;
};

export type SimulatedFixtureResult = {
  homeScore: number;
  awayScore: number;

  winner:
    FixtureWinner;

  matches:
    SimulatedFixtureMatch[];
};

export function simulateLeagueFixture(
  homePerformanceRatings:
    number[],

  awayPerformanceRatings:
    number[],

  randomValues?:
    number[]
): SimulatedFixtureResult {
  const matchDefinitions =
    getLeagueMatchDefinitions();

  validatePerformanceRatings(
    homePerformanceRatings,
    "casa",
    matchDefinitions.length
  );

  validatePerformanceRatings(
    awayPerformanceRatings,
    "trasferta",
    matchDefinitions.length
  );

  if (
    randomValues !== undefined &&
    randomValues.length !==
      matchDefinitions.length
  ) {
    throw new Error(
      "Devono essere indicati esattamente 6 valori casuali."
    );
  }

  const matches =
    matchDefinitions.map(
      (
        definition,
        index
      ) => {
        const homePerformanceRating =
          homePerformanceRatings[
            index
          ];

        const awayPerformanceRating =
          awayPerformanceRatings[
            index
          ];

        const randomValue =
          randomValues?.[
            index
          ];

        const result =
          simulateMatchWinner(
            homePerformanceRating,
            awayPerformanceRating,
            randomValue
          );

        return {
          order:
            definition.order,

          specialty:
            definition.specialty,

          targetPoints:
            definition.targetPoints,

          homePerformanceRating,
          awayPerformanceRating,

          result,
        };
      }
    );

  const homeScore =
    matches.filter(
      (match) =>
        match.result.winner ===
        "HOME"
    ).length;

  const awayScore =
    matches.filter(
      (match) =>
        match.result.winner ===
        "AWAY"
    ).length;

  const winner:
    FixtureWinner =
      homeScore > awayScore
        ? "HOME"
        : awayScore > homeScore
          ? "AWAY"
          : "DRAW";

  return {
    homeScore,
    awayScore,

    winner,

    matches,
  };
}

function validatePerformanceRatings(
  ratings:
    number[],

  teamLabel:
    string,

  expectedLength:
    number
) {
  if (
    ratings.length !==
    expectedLength
  ) {
    throw new Error(
      `La squadra di ${teamLabel} deve avere esattamente 6 valori di prestazione.`
    );
  }

  const containsInvalidValue =
    ratings.some(
      (rating) =>
        !Number.isFinite(
          rating
        )
    );

  if (
    containsInvalidValue
  ) {
    throw new Error(
      `La squadra di ${teamLabel} contiene un valore di prestazione non valido.`
    );
  }
}