export const TRAINING_SKILLS = [
  "precisione",
  "diretto",
  "sponde",
  "tattica",
  "mentalita",
  "difesa",
  "realizzazione",
  "creativita",
  "misura",
] as const;

export type TrainingFocus =
  (typeof TRAINING_SKILLS)[number];

export type TrainingPlayerValues = {
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

type TrainingGainInput = {
  age: number;
  talent: number;
  potential: number;
  currentOverall: number;
  intensity: number;
  trainerEfficiency: number;
  focusWeight: number;
};

const BASE_WEEKLY_GAIN = 0.18;

export function isTrainingFocus(
  value: unknown
): value is TrainingFocus {
  return (
    typeof value === "string" &&
    TRAINING_SKILLS.includes(
      value as TrainingFocus
    )
  );
}

export function getTrainerEfficiency(
  trainerLevel: number
) {
  const efficiencies: Record<number, number> = {
    1: 60,
    2: 70,
    3: 80,
    4: 90,
    5: 100,
  };

  return efficiencies[trainerLevel] ?? 60;
}

export function calculateOverall(
  player: TrainingPlayerValues
) {
  const total =
    player.precisione +
    player.diretto +
    player.sponde +
    player.tattica +
    player.mentalita +
    player.difesa +
    player.realizzazione +
    player.creativita +
    player.misura;

  return roundToThreeDecimals(total / 9);
}

export function calculateTrainingGain({
  age,
  talent,
  potential,
  currentOverall,
  intensity,
  trainerEfficiency,
  focusWeight,
}: TrainingGainInput) {
  const normalizedIntensity = clamp(
    intensity,
    0,
    100
  );

  const normalizedTrainerEfficiency = clamp(
    trainerEfficiency,
    0,
    100
  );

  const normalizedFocusWeight = clamp(
    focusWeight,
    0,
    1
  );

  const ageMultiplier =
    getAgeMultiplier(age);

  const talentMultiplier =
    getTalentMultiplier(talent);

  const potentialMultiplier =
    getPotentialMultiplier(
      currentOverall,
      potential
    );

  const gain =
    BASE_WEEKLY_GAIN *
    (normalizedIntensity / 100) *
    (normalizedTrainerEfficiency / 100) *
    normalizedFocusWeight *
    ageMultiplier *
    talentMultiplier *
    potentialMultiplier;

  return roundToThreeDecimals(
    Math.max(0, gain)
  );
}

export function applyTrainingGain(
  currentValue: number,
  gain: number
) {
  return roundToThreeDecimals(
    clamp(currentValue + gain, 0, 100)
  );
}

export function getTrainingWeekKey(
  date = new Date()
) {
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );

  const dayNumber =
    utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(
    utcDate.getUTCDate() +
      4 -
      dayNumber
  );

  const isoYear =
    utcDate.getUTCFullYear();

  const firstDayOfYear = new Date(
    Date.UTC(isoYear, 0, 1)
  );

  const weekNumber = Math.ceil(
    ((utcDate.getTime() -
      firstDayOfYear.getTime()) /
      86400000 +
      1) /
      7
  );

  return `${isoYear}-W${String(
    weekNumber
  ).padStart(2, "0")}`;
}

function getAgeMultiplier(
  age: number
) {
  if (age <= 18) {
    return 1.35;
  }

  if (age <= 23) {
    return 1.2;
  }

  if (age <= 29) {
    return 1;
  }

  if (age <= 39) {
    return 0.8;
  }

  if (age <= 49) {
    return 0.6;
  }

  if (age <= 59) {
    return 0.4;
  }

  return 0.25;
}

function getTalentMultiplier(
  talent: number
) {
  const normalizedTalent =
    clamp(talent, 0, 100);

  return (
    0.7 +
    (normalizedTalent / 100) * 0.6
  );
}

function getPotentialMultiplier(
  currentOverall: number,
  potential: number
) {
  const gap =
    potential - currentOverall;

  if (gap <= 0) {
    return 0;
  }

  if (gap < 3) {
    return 0.2;
  }

  if (gap < 8) {
    return 0.5;
  }

  if (gap < 15) {
    return 0.8;
  }

  return 1;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function roundToThreeDecimals(
  value: number
) {
  return Math.round(value * 1000) / 1000;
}