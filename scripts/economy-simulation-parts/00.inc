#!/usr/bin/env node

// Stress test deterministico della baseline economica.
// Non accede al database: simula 120 club e usa gli stessi valori approvati
// in lib/economy-rules.ts e lib/economy-prizes.ts.
// Le decisioni gestionali IA sono assunzioni del simulatore, non regole live.
const ECONOMY_WEEKS_PER_SEASON = 15;
const NEW_MANAGER_STARTING_BALANCE = 100_000;
const FINANCIAL_WARNING_BALANCE = -25_000;
const CONTROLLED_ADMINISTRATION_BALANCE = -50_000;
const TRANSFER_FEE_RATE = 0.05;

const LEAGUE_ECONOMY = {
  1: { sponsorWeekly: 8_500, homeGateBase: 14_000, clubManagementWeekly: 2_600 },
  2: { sponsorWeekly: 7_000, homeGateBase: 11_000, clubManagementWeekly: 1_900 },
  3: { sponsorWeekly: 5_800, homeGateBase: 8_400, clubManagementWeekly: 1_350 },
  4: { sponsorWeekly: 4_800, homeGateBase: 6_400, clubManagementWeekly: 900 },
};

const TRAINER_WEEKLY_COSTS = { 1: 500, 2: 900, 3: 1_500, 4: 2_400, 5: 3_800 };
const YOUTH_COACH_WEEKLY_COSTS = { 1: 250, 2: 450, 3: 800, 4: 1_300, 5: 2_100 };
const TRAINER_EFFICIENCY = { 1: 60, 2: 70, 3: 80, 4: 90, 5: 100 };

const TRAINING_CENTER_LEVELS = {
  1: { upgradeCost: 0, weeklyMaintenance: 300, growthBonus: 0, upgradeDays: 0 },
  2: { upgradeCost: 25_000, weeklyMaintenance: 700, growthBonus: 0.04, upgradeDays: 7 },
  3: { upgradeCost: 60_000, weeklyMaintenance: 1_400, growthBonus: 0.08, upgradeDays: 14 },
  4: { upgradeCost: 130_000, weeklyMaintenance: 2_400, growthBonus: 0.13, upgradeDays: 21 },
  5: { upgradeCost: 260_000, weeklyMaintenance: 3_800, growthBonus: 0.18, upgradeDays: 28 },
};

const ACADEMY_LEVELS = {
  1: { upgradeCost: 0, weeklyMaintenance: 150, overallBonus: [0, 0], upgradeDays: 0 },
  2: { upgradeCost: 20_000, weeklyMaintenance: 300, overallBonus: [0, 1], upgradeDays: 7 },
  3: { upgradeCost: 50_000, weeklyMaintenance: 500, overallBonus: [0, 2], upgradeDays: 14 },
  4: { upgradeCost: 110_000, weeklyMaintenance: 800, overallBonus: [1, 3], upgradeDays: 21 },
  5: { upgradeCost: 220_000, weeklyMaintenance: 1_200, overallBonus: [2, 4], upgradeDays: 28 },
};

const ACADEMY_TALENT_BANDS = {
  1: [[45, 59, .78], [60, 69, .17], [70, 79, .045], [80, 89, .005], [90, 95, 0]],
  2: [[45, 59, .72], [60, 69, .20], [70, 79, .065], [80, 89, .015], [90, 95, 0]],
  3: [[45, 59, .65], [60, 69, .23], [70, 79, .09], [80, 89, .025], [90, 95, .005]],
  4: [[45, 59, .58], [60, 69, .25], [70, 79, .12], [80, 89, .04], [90, 95, .01]],
  5: [[45, 59, .50], [60, 69, .27], [70, 79, .16], [80, 89, .06], [90, 95, .01]],
};

const VENUE_LEVELS = {
  1: { upgradeCost: 0, weeklyMaintenance: 150, gateBonus: 0, upgradeDays: 0 },
  2: { upgradeCost: 30_000, weeklyMaintenance: 250, gateBonus: 0.07, upgradeDays: 7 },
  3: { upgradeCost: 75_000, weeklyMaintenance: 400, gateBonus: 0.15, upgradeDays: 14 },
  4: { upgradeCost: 160_000, weeklyMaintenance: 650, gateBonus: 0.25, upgradeDays: 21 },
  5: { upgradeCost: 320_000, weeklyMaintenance: 1_000, gateBonus: 0.40, upgradeDays: 28 },
};

const FAN_LIMITS = { minimum: 10, reference: 90, maximum: 300 };
const FAN_MATCH_CHANGES = [-3, -2, -1, 0, 1, 2, 3];
const FAN_SEASON_POSITION_CHANGES = [0, 12, 7, 4, 0, 0, -3, -6, -9];
const REPUTATION_SEASON_POSITION_CHANGES = [0, 4, 2, 1, 0, 0, -1, -2, -3];
const FAN_PROMOTION_CHANGE = 6;
const FAN_RELEGATION_CHANGE = -6;
const REPUTATION_PROMOTION_CHANGE = 2;
const REPUTATION_RELEGATION_CHANGE = -2;
const FIRST_LEAGUE_CHAMPION_REPUTATION_BONUS = 2;

const LEAGUE_POSITION_PRIZES = {
  1: { 1: 35_000, 2: 22_000, 3: 14_000 },
  2: { 1: 20_000, 2: 12_000, 3: 7_000 },
  3: { 1: 13_000, 2: 8_000, 3: 5_000 },
  4: { 1: 8_000, 2: 5_000, 3: 3_000 },
};
const PROMOTION_PRIZES_BY_SOURCE_LEVEL = { 2: 10_000, 3: 7_000, 4: 5_000 };
const INDIVIDUAL_TOURNAMENT_PRIZES = [6_000, 3_000, 1_500, 1_500, 500, 500, 500, 500];
const WORLD_CHAMPIONSHIP_PRIZES = [15_000, 8_000, 4_000, 4_000, 1_500, 1_500, 1_500, 1_500];

const LEVEL_GROUP_COUNTS = { 1: 1, 2: 2, 3: 4, 4: 8 };
const LEVEL_OVERALLS = {
  1: [66, 65, 64, 62, 60],
  2: [63, 62, 61, 59, 57],
  3: [60, 59, 58, 56, 54],
  4: [57, 56, 55, 53, 51],
};
const AGE_RANGES = [[28,42],[24,38],[20,34],[36,55],[18,25]];
const SKILL_COUNT = 9;
const BASE_WEEKLY_GAIN = 0.9;
const CHECKPOINTS = new Set([1,5,10,15,20]);

const STRATEGY_CONFIG = {
  saver: { reserve: 120_000, transferAggression: 0.28, maxBidShare: 0.20, salaryShare: 0.58 },
  balanced: { reserve: 70_000, transferAggression: 0.56, maxBidShare: 0.33, salaryShare: 0.66 },
  contender: { reserve: 40_000, transferAggression: 0.78, maxBidShare: 0.48, salaryShare: 0.82 },
};

function parseArgs(argv) {
  const args = { runs: 10, seasons: 20, seed: 20260916, json: false, raw: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') args.json = true;
    else if (arg === '--raw') args.raw = true;
    else if (arg === '--runs') args.runs = Number(argv[++i]);
    else if (arg === '--seasons') args.seasons = Number(argv[++i]);
    else if (arg === '--seed') args.seed = Number(argv