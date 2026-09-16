export const ECONOMY_WEEKS_PER_SEASON = 15;

export const NEW_MANAGER_STARTING_BALANCE = 100_000;
export const TRANSFER_FEE_RATE = 0.05;
export const FINANCIAL_WARNING_BALANCE = -25_000;
export const CONTROLLED_ADMINISTRATION_BALANCE = -50_000;

export const PLAYER_VALUE_BASE_AT_60 = 30_000;
export const PLAYER_VALUE_OVERALL_GROWTH = 1.075;
export const PLAYER_VALUE_ROUNDING = 100;

export const TRAINER_WEEKLY_COSTS = {
  1: 500,
  2: 900,
  3: 1_500,
  4: 2_400,
  5: 3_800,
} as const;

export const YOUTH_COACH_WEEKLY_COSTS = {
  1: 250,
  2: 450,
  3: 800,
  4: 1_300,
  5: 2_100,
} as const;

export const LEAGUE_ECONOMY = {
  1: {
    sponsorWeekly: 8_500,
    homeGateBase: 14_000,
    clubManagementWeekly: 2_600,
  },
  2: {
    sponsorWeekly: 7_000,
    homeGateBase: 11_000,
    clubManagementWeekly: 1_900,
  },
  3: {
    sponsorWeekly: 5_800,
    homeGateBase: 8_400,
    clubManagementWeekly: 1_350,
  },
  4: {
    sponsorWeekly: 4_800,
    homeGateBase: 6_400,
    clubManagementWeekly: 900,
  },
} as const;

export const FIRST_LEAGUE_PRIZES = {
  1: 35_000,
  2: 22_000,
  3: 14_000,
} as const;

export const TRAINING_CENTER_LEVELS = {
  1: {
    upgradeCost: 0,
    weeklyMaintenance: 300,
    growthBonus: 0,
    upgradeDays: 0,
  },
  2: {
    upgradeCost: 25_000,
    weeklyMaintenance: 700,
    growthBonus: 0.04,
    upgradeDays: 7,
  },
  3: {
    upgradeCost: 60_000,
    weeklyMaintenance: 1_400,
    growthBonus: 0.08,
    upgradeDays: 14,
  },
  4: {
    upgradeCost: 130_000,
    weeklyMaintenance: 2_400,
    growthBonus: 0.13,
    upgradeDays: 21,
  },
  5: {
    upgradeCost: 260_000,
    weeklyMaintenance: 3_800,
    growthBonus: 0.18,
    upgradeDays: 28,
  },
} as const;

export const ACADEMY_LEVELS = {
  1: {
    upgradeCost: 0,
    weeklyMaintenance: 150,
    overallBonus: [0, 0] as const,
    upgradeDays: 0,
  },
  2: {
    upgradeCost: 20_000,
    weeklyMaintenance: 300,
    overallBonus: [0, 1] as const,
    upgradeDays: 7,
  },
  3: {
    upgradeCost: 50_000,
    weeklyMaintenance: 500,
    overallBonus: [0, 2] as const,
    upgradeDays: 14,
  },
  4: {
    upgradeCost: 110_000,
    weeklyMaintenance: 800,
    overallBonus: [1, 3] as const,
    upgradeDays: 21,
  },
  5: {
    upgradeCost: 220_000,
    weeklyMaintenance: 1_200,
    overallBonus: [2, 4] as const,
    upgradeDays: 28,
  },
} as const;

export const ACADEMY_TALENT_BANDS = {
  1: [
    { minimum: 45, maximum: 59, probability: 0.78 },
    { minimum: 60, maximum: 69, probability: 0.17 },
    { minimum: 70, maximum: 79, probability: 0.045 },
    { minimum: 80, maximum: 89, probability: 0.005 },
    { minimum: 90, maximum: 95, probability: 0 },
  ],
  2: [
    { minimum: 45, maximum: 59, probability: 0.72 },
    { minimum: 60, maximum: 69, probability: 0.2 },
    { minimum: 70, maximum: 79, probability: 0.065 },
    { minimum: 80, maximum: 89, probability: 0.015 },
    { minimum: 90, maximum: 95, probability: 0 },
  ],
  3: [
    { minimum: 45, maximum: 59, probability: 0.65 },
    { minimum: 60, maximum: 69, probability: 0.23 },
    { minimum: 70, maximum: 79, probability: 0.09 },
    { minimum: 80, maximum: 89, probability: 0.025 },
    { minimum: 90, maximum: 95, probability: 0.005 },
  ],
  4: [
    { minimum: 45, maximum: 59, probability: 0.58 },
    { minimum: 60, maximum: 69, probability: 0.25 },
    { minimum: 70, maximum: 79, probability: 0.12 },
    { minimum: 80, maximum: 89, probability: 0.04 },
    { minimum: 90, maximum: 95, probability: 0.01 },
  ],
  5: [
    { minimum: 45, maximum: 59, probability: 0.5 },
    { minimum: 60, maximum: 69, probability: 0.27 },
    { minimum: 70, maximum: 79, probability: 0.16 },
    { minimum: 80, maximum: 89, probability: 0.06 },
    { minimum: 90, maximum: 95, probability: 0.01 },
  ],
} as const;

export const ECONOMY_DESIGN_TARGETS = {
  normalSalaryShare: [0.55, 0.6],
  normalStaffShare: [0.2, 0.25],
  normalStructuresShare: 0.1,
  normalFreeMarginShare: [0.05, 0.15],
  titlePushExpenseToIncome: [1.2, 1.5],
  superTeamExpenseToIncome: [2.5, 3],
  healthyMedianBalanceAfterLongRun: [50_000, 150_000],
  maximumDesiredTechnicalGap: 12,
} as const;

export function calculatePlayerWeeklySalary(overall: number) {
  const normalizedOverall = Math.max(0, Math.min(100, overall));

  return Math.max(
    250,
    Math.round(
      250 * Math.pow(1.105, normalizedOverall - 50)
    )
  );
}

export function calculateSquadWeeklySalary(overalls: readonly number[]) {
  return overalls.reduce(
    (total, overall) => total + calculatePlayerWeeklySalary(overall),
    0
  );
}

export function calculatePlayerBaseMarketValue(overall: number) {
  const normalizedOverall = Math.max(0, Math.min(100, overall));

  return (
    PLAYER_VALUE_BASE_AT_60 *
    Math.pow(
      PLAYER_VALUE_OVERALL_GROWTH,
      normalizedOverall - 60
    )
  );
}

export function getPlayerValueAgeMultiplier(age: number) {
  const normalizedAge = Math.max(0, Math.round(age));

  if (normalizedAge <= 20) return 2.3;
  if (normalizedAge <= 25) return 2.1;
  if (normalizedAge <= 30) return 1.8;
  if (normalizedAge <= 35) return 1.55;
  if (normalizedAge <= 40) return 1.3;
  if (normalizedAge <= 45) return 1.15;
  if (normalizedAge <= 50) return 0.95;
  if (normalizedAge <= 55) return 0.75;
  if (normalizedAge <= 60) return 0.55;
  if (normalizedAge <= 65) return 0.4;
  if (normalizedAge <= 70) return 0.28;
  if (normalizedAge <= 75) return 0.18;

  return 0.1;
}

export function getPlayerValueTalentMultiplier(talent: number) {
  const normalizedTalent = Math.max(0, Math.min(100, talent));
  return 0.7 + normalizedTalent / 180;
}

export function calculatePlayerMarketValue({
  overall,
  age,
  talent,
}: {
  overall: number;
  age: number;
  talent: number;
}) {
  const rawValue =
    calculatePlayerBaseMarketValue(overall) *
    getPlayerValueAgeMultiplier(age) *
    getPlayerValueTalentMultiplier(talent);

  return (
    Math.round(rawValue / PLAYER_VALUE_ROUNDING) *
    PLAYER_VALUE_ROUNDING
  );
}

export function getTrainingCenterLevel(level: number) {
  return TRAINING_CENTER_LEVELS[normalizeStructureLevel(level)];
}

export function getTrainingCenterGrowthMultiplier(level: number) {
  return 1 + getTrainingCenterLevel(level).growthBonus;
}

export function applyTrainingCenterGrowthBonus(
  trainingGain: number,
  level: number
) {
  const normalizedGain = Math.max(0, trainingGain);
  return normalizedGain * getTrainingCenterGrowthMultiplier(level);
}

export function getAcademyLevel(level: number) {
  return ACADEMY_LEVELS[normalizeStructureLevel(level)];
}

export function getAcademyTalentBands(level: number) {
  return ACADEMY_TALENT_BANDS[normalizeStructureLevel(level)];
}

export function calculateTransferFee(price: number) {
  const normalizedPrice = Math.max(0, Math.round(price));
  return Math.round(normalizedPrice * TRANSFER_FEE_RATE);
}

export function calculateSellerProceeds(price: number) {
  const normalizedPrice = Math.max(0, Math.round(price));
  return normalizedPrice - calculateTransferFee(normalizedPrice);
}

export function getTrainerWeeklyCost(level: number) {
  return TRAINER_WEEKLY_COSTS[normalizeStaffLevel(level)];
}

export function getYouthCoachWeeklyCost(level: number) {
  return YOUTH_COACH_WEEKLY_COSTS[normalizeStaffLevel(level)];
}

export function getLeagueEconomy(level: number) {
  const normalizedLevel = Math.max(1, Math.min(4, Math.round(level))) as 1 | 2 | 3 | 4;
  return LEAGUE_ECONOMY[normalizedLevel];
}

function normalizeStructureLevel(level: number) {
  return Math.max(1, Math.min(5, Math.round(level))) as 1 | 2 | 3 | 4 | 5;
}

function normalizeStaffLevel(level: number) {
  return Math.max(1, Math.min(5, Math.round(level))) as 1 | 2 | 3 | 4 | 5;
}
