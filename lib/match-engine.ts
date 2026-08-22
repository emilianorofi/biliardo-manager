export type FormationSlot =
  | "A"
  | "B"
  | "C";

export type MatchSpecialty =
  | "ITALIANA"
  | "GORIZIANA"
  | "TUTTI_DOPPI";

export const MATCH_TARGET_POINTS: Record<MatchSpecialty, number> = {
  ITALIANA: 80,
  GORIZIANA: 400,
  TUTTI_DOPPI: 600,
};

export const MATCH_SHOT_SCORES: Record<MatchSpecialty, readonly number[]> = {
  ITALIANA: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  GORIZIANA: [
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
    38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 60, 64, 68, 72, 76, 80, 84, 88,
    92, 96, 100, 104, 108, 112,
  ],
  TUTTI_DOPPI: [
    4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72,
    76, 80, 84, 88, 92, 96, 100, 104, 108, 112,
  ],
};

export const MATCH_TOTAL_SCORE_STEP: Record<MatchSpecialty, number> = {
  ITALIANA: 1,
  GORIZIANA: 2,
  TUTTI_DOPPI: 4,
};

export type MatchPlayerValues = {
  precisione: number;
  diretto: number;
  sponde: number;
};

export type MatchPerformancePlayerValues =
  MatchPlayerValues & {
    form: number;
    morale: number;
    experience: number;
  };

export type PlayerPerformanceBreakdown = {
  specialtyRating: number;

  formModifier: number;
  moraleModifier: number;
  experienceModifier: number;

  performanceRating: number;
};

export type MatchWinProbabilities = {
  homePerformanceRating: number;
  awayPerformanceRating: number;

  performanceDifference: number;

  homeWinProbability: number;
  awayWinProbability: number;
};

export type LeagueMatchDefinition = {
  order: number;

  specialty:
    MatchSpecialty;

  targetPoints: number;

  homeSlots:
    FormationSlot[];

  awaySlots:
    FormationSlot[];
};

export const LEAGUE_MATCH_DEFINITIONS:
  LeagueMatchDefinition[] = [
  {
    order: 1,

    specialty:
      "ITALIANA",

    targetPoints: MATCH_TARGET_POINTS.ITALIANA,

    homeSlots: [
      "A",
    ],

    awaySlots: [
      "A",
    ],
  },

  {
    order: 2,

    specialty:
      "ITALIANA",

    targetPoints: MATCH_TARGET_POINTS.ITALIANA,

    homeSlots: [
      "B",
      "C",
    ],

    awaySlots: [
      "B",
      "C",
    ],
  },

  {
    order: 3,

    specialty:
      "GORIZIANA",

    targetPoints: MATCH_TARGET_POINTS.GORIZIANA,

    homeSlots: [
      "B",
    ],

    awaySlots: [
      "B",
    ],
  },

  {
    order: 4,

    specialty:
      "GORIZIANA",

    targetPoints: MATCH_TARGET_POINTS.GORIZIANA,

    homeSlots: [
      "A",
      "C",
    ],

    awaySlots: [
      "A",
      "C",
    ],
  },

  {
    order: 5,

    specialty:
      "TUTTI_DOPPI",

    targetPoints: MATCH_TARGET_POINTS.TUTTI_DOPPI,

    homeSlots: [
      "C",
    ],

    awaySlots: [
      "C",
    ],
  },

  {
    order: 6,

    specialty:
      "TUTTI_DOPPI",

    targetPoints: MATCH_TARGET_POINTS.TUTTI_DOPPI,

    homeSlots: [
      "A",
      "B",
    ],

    awaySlots: [
      "A",
      "B",
    ],
  },
];

export function getLeagueMatchDefinitions() {
  return LEAGUE_MATCH_DEFINITIONS.map(
    (match) => ({
      ...match,

      homeSlots: [
        ...match.homeSlots,
      ],

      awaySlots: [
        ...match.awaySlots,
      ],
    })
  );
}

export function calculateSpecialtyRating(
  player:
    MatchPlayerValues,

  specialty:
    MatchSpecialty
) {
  switch (specialty) {
    case "ITALIANA":
      return roundRating(
        (
          player.precisione +
          player.diretto
        ) / 2
      );

    case "GORIZIANA":
      return roundRating(
        (
          player.precisione +
          player.sponde
        ) / 2
      );

    case "TUTTI_DOPPI":
      return roundRating(
        (
          player.diretto +
          player.sponde
        ) / 2
      );
  }
}

export function calculateTeamSpecialtyRating(
  players:
    MatchPlayerValues[],

  specialty:
    MatchSpecialty
) {
  if (players.length === 0) {
    throw new Error(
      "Serve almeno un giocatore per calcolare la forza della squadra."
    );
  }

  const totalRating =
    players.reduce(
      (
        total,
        player
      ) =>
        total +
        calculateSpecialtyRating(
          player,
          specialty
        ),
      0
    );

  return roundRating(
    totalRating /
      players.length
  );
}

export function calculatePlayerPerformance(
  player:
    MatchPerformancePlayerValues,

  specialty:
    MatchSpecialty
): PlayerPerformanceBreakdown {
  const specialtyRating =
    calculateSpecialtyRating(
      player,
      specialty
    );

  const normalizedForm =
    clamp(
      player.form,
      1,
      10
    );

  const normalizedMorale =
    clamp(
      player.morale,
      1,
      10
    );

  const normalizedExperience =
    clamp(
      player.experience,
      0,
      100
    );

  const formModifier =
    roundRating(
      (
        normalizedForm - 5
      ) * 0.75
    );

  const moraleModifier =
    roundRating(
      (
        normalizedMorale - 5
      ) * 0.5
    );

  const experienceModifier =
    roundRating(
      normalizedExperience *
        0.025
    );

  const performanceRating =
    roundRating(
      clamp(
        specialtyRating +
          formModifier +
          moraleModifier +
          experienceModifier,
        1,
        100
      )
    );

  return {
    specialtyRating,

    formModifier,
    moraleModifier,
    experienceModifier,

    performanceRating,
  };
}

export function calculateTeamPerformanceRating(
  players:
    MatchPerformancePlayerValues[],

  specialty:
    MatchSpecialty
) {
  if (players.length === 0) {
    throw new Error(
      "Serve almeno un giocatore per calcolare la prestazione della squadra."
    );
  }

  const performances =
    players.map(
      (player) =>
        calculatePlayerPerformance(
          player,
          specialty
        )
    );

  const totalPerformance =
    performances.reduce(
      (
        total,
        performance
      ) =>
        total +
        performance.performanceRating,
      0
    );

  return roundRating(
    totalPerformance /
      performances.length
  );
}

export function calculateMatchWinProbabilities(
  homePerformanceRating: number,
  awayPerformanceRating: number
): MatchWinProbabilities {
  const normalizedHomePerformance =
    roundRating(
      clamp(
        homePerformanceRating,
        1,
        100
      )
    );

  const normalizedAwayPerformance =
    roundRating(
      clamp(
        awayPerformanceRating,
        1,
        100
      )
    );

  const performanceDifference =
    roundRating(
      normalizedHomePerformance -
        normalizedAwayPerformance
    );

  const homeWinProbability =
    roundRating(
      clamp(
        50 +
          performanceDifference *
            1.5,
        8,
        92
      )
    );

  const awayWinProbability =
    roundRating(
      100 -
        homeWinProbability
    );

  return {
    homePerformanceRating:
      normalizedHomePerformance,

    awayPerformanceRating:
      normalizedAwayPerformance,

    performanceDifference,

    homeWinProbability,
    awayWinProbability,
  };
}

function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );
}

function roundRating(
  rating: number
) {
  return Math.round(
    rating * 100
  ) / 100;
}
