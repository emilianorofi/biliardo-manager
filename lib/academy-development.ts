import type { TrainingPlayerValues } from "@/lib/training-engine";
import { TRAINING_SKILLS } from "@/lib/training-engine";

const ACADEMY_BASE_WEEKLY_GAIN = 0.16;

export function getTalentDevelopmentMultiplier(talent: number) {
  const normalized = Math.min(95, Math.max(45, talent));
  return roundToFourDecimals(
    0.8 + ((normalized - 45) / 50) * 0.7
  );
}

export function getAcademyAgeMultiplier(age: number) {
  if (age <= 14) return 1.35;
  if (age === 15) return 1.15;
  if (age === 16) return 1;
  return 0.85;
}

export function getAcademyLevelDevelopmentMultiplier(level: number) {
  const normalized = Math.min(5, Math.max(1, Math.round(level)));
  return {
    1: 0.85,
    2: 0.925,
    3: 1,
    4: 1.075,
    5: 1.15,
  }[normalized]!;
}

function getAcademySkillMultiplier(currentValue: number) {
  if (currentValue < 45) return 1.12;
  if (currentValue < 55) return 1.06;
  if (currentValue < 65) return 1;
  if (currentValue < 75) return 0.88;
  if (currentValue < 85) return 0.72;
  if (currentValue < 95) return 0.5;
  return 0.25;
}

export function calculateAcademyWeeklyDevelopment({
  age,
  talent,
  academyLevel,
  currentValues,
}: {
  age: number;
  talent: number;
  academyLevel: number;
  currentValues: TrainingPlayerValues;
}) {
  const talentMultiplier = getTalentDevelopmentMultiplier(talent);
  const ageMultiplier = getAcademyAgeMultiplier(age);
  const academyMultiplier =
    getAcademyLevelDevelopmentMultiplier(academyLevel);

  const gains = Object.fromEntries(
    TRAINING_SKILLS.map((skill) => {
      const currentValue = currentValues[skill];
      const gain =
        ACADEMY_BASE_WEEKLY_GAIN *
        talentMultiplier *
        ageMultiplier *
        academyMultiplier *
        getAcademySkillMultiplier(currentValue);

      return [skill, roundToThreeDecimals(gain)];
    })
  ) as TrainingPlayerValues;

  const values = Object.fromEntries(
    TRAINING_SKILLS.map((skill) => [
      skill,
      roundToThreeDecimals(currentValues[skill] + gains[skill]),
    ])
  ) as TrainingPlayerValues;

  return {
    gains,
    values,
    overallGain:
      roundToThreeDecimals(
        TRAINING_SKILLS.reduce(
          (sum, skill) => sum + gains[skill],
          0
        ) / TRAINING_SKILLS.length
      ),
  };
}

function roundToThreeDecimals(value: number) {
  return Math.round(value * 1000) / 1000;
}

function roundToFourDecimals(value: number) {
  return Math.round(value * 10000) / 10000;
}
