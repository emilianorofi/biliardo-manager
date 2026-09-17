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

export const VENUE_LEVELS = {
  1: {
    upgradeCost: 0,
    weeklyMaintenance: 150,
    gateBonus: 0,
    upgradeDays: 0,
  },
  2: {
    upgradeCost: 30_000,
    weeklyMaintenance: 250,
    gateBonus: 0.07,
    upgradeDays: 7,
  },
  3: {
    upgradeCost: 75_000,
    weeklyMaintenance: 400,
    gateBonus: 0.15,
    upgradeDays: 14,
  },
  4: {
    upgradeCost: 160_000,
    weeklyMaintenance: 650,
    gateBonus: 0.25,
    upgradeDays: 21,
  },
  5: {
    upgradeCost: 320_000,
    weeklyMaintenance: 1_000,
    gateBonus: 0.4,
    upgradeDays: 28,
  },
} as const;

export const FAN_LIMITS = {
  minimum: 10,
  reference: 90,
  maximum: 300,
} as const;

export const FAN_MATCH_CHANGES = {
  0: -3,
  1: -2,
  2: -1,
  3: 0,
  4: 1,
  5: 2,
  6: 3,
} as const;

export const FAN_SEASON_POSITION_CHANGES = {
  1: 12,
  2: 7,
  3: 4,
  4: 0,
  5: 0,
  6: -3,
  7: -6,
  8: -9,
} as const;

export const FAN_PROMOTION_CHANGE = 6;
export const FAN_RELEGATION_CHANGE = -6;

export const REPUTATION_LIMITS = {
  minimum: 1,
  reference: 40,
  maximum: 100,
} as const;

export const REPUTATION_SEASON_POSITION_CHANGES = {
  1: 4,
  2: 2,
  3: 1,
  4: 0,
  5: 0,
  6: -1,
  7: -2,
  8: -3,
} as const;

export const REPUTATION_PROMOTION_CHANGE = 2;
export const REPUTATION_RELEGATION_CHANGE = -2;
export const FIRST_LEAGUE_CHAMPION_REPUTATION_BONUS = 2;

export const SPONSOR_MULTIPLIER_LIMITS = {
  minimum: 0.85,
  maximum: 1.15,
} as const;

export const MATCH_INTEREST_MULTIPLIER_LIMITS = {
  minimum: 0.8,
  maximum: 1.25,
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
  const normalizedOverall = Math.max(0, overall);

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
  const normalizedOverall = Math.max(0, overall);

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

export function getVenueLevel(level: number) {
  return VENUE_LEVELS[normalizeStructureLevel(level)];
}

export function getVenueGateMultiplier(level: number) {
  return 1 + getVenueLevel(level).gateBonus;
}

export function applyVenueGateBonus(
  baseGateIncome: number,
  level: number
) {
  const normalizedBaseGateIncome = Math.max(0, baseGateIncome);
  return Math.round(
    normalizedBaseGateIncome * getVenueGateMultiplier(level)
  );
}

export function getFanMatchChange(points: number) {
  const normalizedPoints = Math.max(0, Math.min(6, Math.round(points))) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return FAN_MATCH_CHANGES[normalizedPoints];
}

export function applyFanMatchChange(fans: number, points: number) {
  return normalizeFans(fans + getFanMatchChange(points));
}

export function applyFanSeasonChange({
  fans,
  position,
  promoted = false,
  relegated = false,
}: {
  fans: number;
  position: number;
  promoted?: boolean;
  relegated?: boolean;
}) {
  const normalizedPosition = Math.max(1, Math.min(8, Math.round(position))) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  const movementChange =
    (promoted ? FAN_PROMOTION_CHANGE : 0) +
    (relegated ? FAN_RELEGATION_CHANGE : 0);

  return normalizeFans(
    fans +
      FAN_SEASON_POSITION_CHANGES[normalizedPosition] +
      movementChange
  );
}

export function applyReputationSeasonChange({
  reputation,
  position,
  promoted = false,
  relegated = false,
  firstLeagueChampion = false,
}: {
  reputation: number;
  position: number;
  promoted?: boolean;
  relegated?: boolean;
  firstLeagueChampion?: boolean;
}) {
  const normalizedPosition = Math.max(1, Math.min(8, Math.round(position))) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  const movementChange =
    (promoted ? REPUTATION_PROMOTION_CHANGE : 0) +
    (relegated ? REPUTATION_RELEGATION_CHANGE : 0);
  const championBonus = firstLeagueChampion
    ? FIRST_LEAGUE_CHAMPION_REPUTATION_BONUS
    : 0;

  return normalizeReputation(
    reputation +
      REPUTATION_SEASON_POSITION_CHANGES[normalizedPosition] +
      movementChange +
      championBonus
  );
}

export function getSponsorReputationMultiplier(reputation: number) {
  const rawMultiplier =
    1 + (normalizeReputation(reputation) - REPUTATION_LIMITS.reference) * 0.004;
  return clamp(rawMultiplier, 0.92, 1.08);
}

export function getSponsorFanMultiplier(fans: number) {
  const rawMultiplier =
    1 + (normalizeFans(fans) - FAN_LIMITS.reference) * 0.0015;
  return clamp(rawMultiplier, SPONSOR_MULTIPLIER_LIMITS.minimum, SPONSOR_MULTIPLIER_LIMITS.maximum);
}

export function getRecentFormMultiplier(averagePoints: number) {
  const normalizedAverage = clamp(averagePoints, 0, 6);
  return 0.9 + (normalizedAverage / 6) * 0.2;
}

export function calculateWeeklySponsorIncome({
  leagueLevel,
  reputation,
  fans,
  recentAveragePoints,
}: {
  leagueLevel: number;
  reputation: number;
  fans: number;
  recentAveragePoints: number;
}) {
  const league = getLeagueEconomy(leagueLevel);
  const income =
    league.sponsorWeekly *
    getSponsorReputationMultiplier(reputation) *
    getSponsorFanMultiplier(fans) *
    getRecentFormMultiplier(recentAveragePoints);

  return Math.max(0, Math.round(income));
}

export function getMatchInterestMultiplier({
  homeReputation,
  opponentReputation,
  recentAveragePoints,
}: {
  homeReputation: number;
  opponentReputation: number;
  recentAveragePoints: number;
}) {
  const reputationGap = clamp(opponentReputation - homeReputation, -30, 30);
  const reputationMultiplier = 1 + reputationGap * 0.004;
  const formMultiplier = 0.92 + (clamp(recentAveragePoints, 0, 6) / 6) * 0.16;
  return clamp(
    reputationMultiplier * formMultiplier,
    MATCH_INTEREST_MULTIPLIER_LIMITS.minimum,
    MATCH_INTEREST_MULTIPLIER_LIMITS.maximum
  );
}

export function calculateHomeGateIncome({
  leagueLevel,
  fans,
  homeReputation,
  opponentReputation,
  recentAveragePoints,
  venueLevel,
}: {
  leagueLevel: number;
  fans: number;
  homeReputation: number;
  opponentReputation: number;
  recentAveragePoints: number;
  venueLevel: number;
}) {
  const league = getLeagueEconomy(leagueLevel);
  const fanMultiplier = clamp(
    normalizeFans(fans) / FAN_LIMITS.reference,
    0.55,
    2.4
  );
  const baseGate =
    league.homeGateBase *
    fanMultiplier *
    getMatchInterestMultiplier({
      homeReputation,
      opponentReputation,
      recentAveragePoints,
    });

  return applyVenueGateBonus(baseGate, venueLevel);
}

export function calculateSellerProceeds(finalPrice: number) {
  const normalizedPrice = Math.max(0, Math.round(finalPrice));
  return Math.max(
    0,
    normalizedPrice - Math.round(normalizedPrice * TRANSFER_FEE_RATE)
  );
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

function normalizeStructureLevel(level: number) {
  return Math.max(1, Math.min(5, Math.round(level))) as 1 | 2 | 3 | 4 | 5;
}

function normalizeFans(fans: number) {
  return Math.max(
    FAN_LIMITS.minimum,
    Math.min(FAN_LIMITS.maximum, Math.round(fans))
  );
}

function normalizeReputation(reputation: number) {
  return Math.max(
    REPUTATION_LIMITS.minimum,
    Math.min(REPUTATION_LIMITS.maximum, Math.round(reputation))
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}
