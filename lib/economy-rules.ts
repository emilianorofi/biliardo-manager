export const ECONOMY_WEEKS_PER_SEASON = 15;

export const NEW_MANAGER_STARTING_BALANCE = 100_000;
export const TRANSFER_FEE_RATE = 0.05;
export const FINANCIAL_WARNING_BALANCE = -25_000;
export const CONTROLLED_ADMINISTRATION_BALANCE = -50_000;

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
  },
  2: {
    upgradeCost: 25_000,
    weeklyMaintenance: 700,
  },
  3: {
    upgradeCost: 60_000,
    weeklyMaintenance: 1_400,
  },
  4: {
    upgradeCost: 130_000,
    weeklyMaintenance: 2_400,
  },
  5: {
    upgradeCost: 260_000,
    weeklyMaintenance: 3_800,
  },
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

function normalizeStaffLevel(level: number) {
  return Math.max(1, Math.min(5, Math.round(level))) as 1 | 2 | 3 | 4 | 5;
}
