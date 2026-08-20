import {
  TRAINING_SKILLS,
  calculateOverall,
  type TrainingPlayerValues,
} from "@/lib/training-engine";

type WeeklyAgeDeclineInput = {
  age: number;
  talent: number;
  currentValue: number;
};

type ApplyWeeklyDevelopmentInput = {
  age: number;
  talent: number;
  currentValues: TrainingPlayerValues;
  gains: Partial<TrainingPlayerValues>;
};

export function getWeeklyDeclineBase(
  age: number
) {
  if (age <= 40) return 0;
  if (age <= 42) return 0.005;
  if (age <= 45) return 0.0075;
  if (age <= 48) return 0.033;
  if (age <= 51) return 0.034;
  if (age <= 54) return 0.035;
  if (age <= 57) return 0.036;
  if (age <= 60) return 0.045;
  if (age <= 63) return 0.0575;
  if (age <= 66) return 0.0725;
  if (age <= 69) return 0.0875;
  if (age <= 72) return 0.1075;
  if (age <= 75) return 0.13;
  if (age <= 78) return 0.155;
  if (age <= 81) return 0.185;
  if (age <= 84) return 0.2125;
  if (age <= 87) return 0.245;
  if (age <= 90) return 0.28;

  return 0.3375;
}

export function calculateWeeklyAgeDecline({
  age,
  talent,
  currentValue,
}: WeeklyAgeDeclineInput) {
  const baseDecline =
    getWeeklyDeclineBase(age);

  if (baseDecline === 0) {
    return 0;
  }

  const normalizedTalent = clamp(
    talent,
    0,
    100
  );
  const normalizedValue = clamp(
    currentValue,
    0,
    100
  );
  const talentMultiplier =
    1.1 - normalizedTalent * 0.002;
  const valueMultiplier =
    0.6 + normalizedValue * 0.004;

  return roundToFourDecimals(
    baseDecline *
      talentMultiplier *
      valueMultiplier
  );
}

export function applyWeeklyDevelopment({
  age,
  talent,
  currentValues,
  gains,
}: ApplyWeeklyDevelopmentInput) {
  const values = {
    ...currentValues,
  };
  const declines = {
    ...currentValues,
  };

  for (const skill of TRAINING_SKILLS) {
    const currentValue =
      currentValues[skill];
    const gain =
      gains[skill] ?? 0;
    const decline =
      calculateWeeklyAgeDecline({
        age,
        talent,
        currentValue,
      });

    declines[skill] = decline;
    values[skill] = roundToThreeDecimals(
      clamp(
        currentValue + gain - decline,
        0,
        100
      )
    );
  }

  const overallBefore =
    calculateOverall(currentValues);
  const overallAfterTraining =
    calculateOverall(
      addGains(currentValues, gains)
    );
  const overallAfter =
    calculateOverall(values);

  return {
    values,
    declines,
    overallBefore,
    overallAfter,
    overallDecline:
      roundToThreeDecimals(
        Math.max(
          0,
          overallAfterTraining -
            overallAfter
        )
      ),
  };
}

function addGains(
  currentValues: TrainingPlayerValues,
  gains: Partial<TrainingPlayerValues>
) {
  const values = {
    ...currentValues,
  };

  for (const skill of TRAINING_SKILLS) {
    values[skill] =
      roundToThreeDecimals(
        clamp(
          currentValues[skill] +
            (gains[skill] ?? 0),
          0,
          100
        )
      );
  }

  return values;
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

function roundToFourDecimals(
  value: number
) {
  return Math.round(value * 10000) / 10000;
}
