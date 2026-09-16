export const LEAGUE_POSITION_PRIZES = {
  1: { 1: 35_000, 2: 22_000, 3: 14_000 },
  2: { 1: 20_000, 2: 12_000, 3: 7_000 },
  3: { 1: 13_000, 2: 8_000, 3: 5_000 },
  4: { 1: 8_000, 2: 5_000, 3: 3_000 },
} as const;

export const PROMOTION_PRIZES_BY_SOURCE_LEVEL = {
  2: 10_000,
  3: 7_000,
  4: 5_000,
} as const;

export const INDIVIDUAL_TOURNAMENT_PRIZES = {
  WINNER: 6_000,
  FINALIST: 3_000,
  SEMIFINALIST: 1_500,
  QUARTERFINALIST: 500,
} as const;

export const WORLD_CHAMPIONSHIP_PRIZES = {
  WINNER: 15_000,
  FINALIST: 8_000,
  SEMIFINALIST: 4_000,
  QUARTERFINALIST: 1_500,
} as const;

export const NATIONS_CUP_CLUB_PRIZE = 0;
export const RELEGATION_PARACHUTE_PAYMENT = 0;

export type KnockoutPrizeStage = keyof typeof INDIVIDUAL_TOURNAMENT_PRIZES;

export function getLeaguePositionPrize(level: number, position: number) {
  if (!isLeagueLevel(level) || !isPrizePosition(position)) {
    return 0;
  }

  return LEAGUE_POSITION_PRIZES[level][position];
}

export function getPromotionPrize(fromLeagueLevel: number) {
  if (
    fromLeagueLevel !== 2 &&
    fromLeagueLevel !== 3 &&
    fromLeagueLevel !== 4
  ) {
    return 0;
  }

  return PROMOTION_PRIZES_BY_SOURCE_LEVEL[fromLeagueLevel];
}

export function getIndividualTournamentPrize(stage: KnockoutPrizeStage) {
  return INDIVIDUAL_TOURNAMENT_PRIZES[stage];
}

export function getWorldChampionshipPrize(stage: KnockoutPrizeStage) {
  return WORLD_CHAMPIONSHIP_PRIZES[stage];
}

export function calculateIndividualTournamentPrizePool() {
  return calculateKnockoutPrizePool(INDIVIDUAL_TOURNAMENT_PRIZES);
}

export function calculateWorldChampionshipPrizePool() {
  return calculateKnockoutPrizePool(WORLD_CHAMPIONSHIP_PRIZES);
}

function calculateKnockoutPrizePool(prizes: Record<KnockoutPrizeStage, number>) {
  return (
    prizes.WINNER +
    prizes.FINALIST +
    prizes.SEMIFINALIST * 2 +
    prizes.QUARTERFINALIST * 4
  );
}

function isLeagueLevel(level: number): level is 1 | 2 | 3 | 4 {
  return level === 1 || level === 2 || level === 3 || level === 4;
}

function isPrizePosition(position: number): position is 1 | 2 | 3 {
  return position === 1 || position === 2 || position === 3;
}
