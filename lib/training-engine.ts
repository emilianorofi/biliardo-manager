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
  currentValue: number;
  intensity: number;
  trainerEfficiency: number;
  focusWeight: number;
};

const BASE_WEEKLY_GAIN = 0.9;

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
  currentValue,
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

  const skillLevelMultiplier =
    getSkillLevelMultiplier(currentValue);

  const gain =
    BASE_WEEKLY_GAIN *
    (normalizedIntensity / 100) *
    (normalizedTrainerEfficiency / 100) *
    normalizedFocusWeight *
    ageMultiplier *
    talentMultiplier *
    skillLevelMultiplier;

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

export function getTrainingWeekRange(
  date = new Date()
) {
  const start = new Date(date);

  start.setUTCHours(0, 0, 0, 0);

  const dayNumber =
    start.getUTCDay() || 7;

  start.setUTCDate(
    start.getUTCDate() - dayNumber + 1
  );

  const end = new Date(start);

  end.setUTCDate(
    end.getUTCDate() + 7
  );

  return {
    start,
    end,
  };
}

export function getAgeMultiplier(
  age: number
) {
  if (age <= 18) {
    return 1.45;
  }

  if (age <= 20) {
    return 1.38;
  }

  if (age <= 22) {
    return 1.32;
  }

  if (age <= 24) {
    return 1.25;
  }

  if (age <= 27) {
    return 1.16;
  }

  if (age <= 30) {
    return 1.06;
  }

  if (age <= 33) {
    return 0.98;
  }

  if (age <= 36) {
    return 0.9;
  }

  if (age <= 39) {
    return 0.8;
  }

  if (age <= 42) {
    return 0.65;
  }

  if (age <= 45) {
    return 0.55;
  }

  if (age <= 48) {
    return 0.43;
  }

  if (age <= 51) {
    return 0.3;
  }

  if (age <= 54) {
    return 0.18;
  }

  if (age <= 57) {
    return 0.09;
  }

  if (age <= 60) {
    return 0.06;
  }

  if (age <= 63) {
    return 0.04;
  }

  if (age <= 66) {
    return 0.02;
  }

  return 0.005;
}

function getTalentMultiplier(
  talent: number
) {
  const normalizedTalent =
    clamp(talent, 0, 100);

  return 0.9 + (normalizedTalent / 100) * 0.2;
}

function getSkillLevelMultiplier(currentValue: number) {
  const normalizedValue = clamp(currentValue, 0, 100) / 100;

  if (normalizedValue >= 1) {
    return 0;
  }

  return 1 - 0.8 * Math.pow(normalizedValue, 2);
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
