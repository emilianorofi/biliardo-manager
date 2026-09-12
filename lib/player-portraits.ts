import { getNationalityDisplay } from "@/lib/nationalities";

export const PLAYER_PORTRAIT_IDENTITIES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

type PlayerPortraitIdentity =
  (typeof PLAYER_PORTRAIT_IDENTITIES)[number];

const MEDITERRANEAN_IDENTITIES = [
  1, 6, 7, 11, 12, 13, 17, 18, 20, 2, 5, 8, 9, 16, 19,
] as const satisfies readonly PlayerPortraitIdentity[];

const CENTRAL_NORTHERN_EUROPE_IDENTITIES = [
  2, 5, 8, 9, 11, 13, 16, 17, 19, 1, 6, 7, 12,
] as const satisfies readonly PlayerPortraitIdentity[];

const EAST_ASIAN_IDENTITIES = [
  4, 14,
] as const satisfies readonly PlayerPortraitIdentity[];

const MIDDLE_EASTERN_IDENTITIES = [
  1, 3, 6, 7, 9, 12, 18, 20,
] as const satisfies readonly PlayerPortraitIdentity[];

const SOUTH_AMERICAN_IDENTITIES = [
  1, 2, 3, 5, 6, 7, 8, 11, 12, 13, 16, 17, 18, 19, 20,
] as const satisfies readonly PlayerPortraitIdentity[];

const MIXED_LATIN_AMERICAN_IDENTITIES = [
  1, 3, 6, 7, 10, 11, 12, 15, 16, 17, 18, 19, 20,
] as const satisfies readonly PlayerPortraitIdentity[];

const IDENTITIES_BY_NATIONALITY: Record<
  string,
  readonly PlayerPortraitIdentity[]
> = {
  ITA: MEDITERRANEAN_IDENTITIES,
  ESP: MEDITERRANEAN_IDENTITIES,
  POR: MEDITERRANEAN_IDENTITIES,
  SMR: MEDITERRANEAN_IDENTITIES,
  ALB: MEDITERRANEAN_IDENTITIES,
  GER: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  FRA: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  DEN: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  BEL: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  NED: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  SUI: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  CZE: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  AUT: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  LUX: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  NOR: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  SWE: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  LIE: CENTRAL_NORTHERN_EUROPE_IDENTITIES,
  JPN: EAST_ASIAN_IDENTITIES,
  KOR: EAST_ASIAN_IDENTITIES,
  TUR: MIDDLE_EASTERN_IDENTITIES,
  EGY: MIDDLE_EASTERN_IDENTITIES,
  ARG: SOUTH_AMERICAN_IDENTITIES,
  URU: SOUTH_AMERICAN_IDENTITIES,
  BRA: MIXED_LATIN_AMERICAN_IDENTITIES,
  COL: MIXED_LATIN_AMERICAN_IDENTITIES,
};

export function getPlayerPortraitIdentity(
  playerId: number,
  nationality?: string
) {
  const nationalityCode = nationality
    ? getNationalityDisplay(nationality).code
    : null;
  const identities =
    (nationalityCode && IDENTITIES_BY_NATIONALITY[nationalityCode]) ||
    PLAYER_PORTRAIT_IDENTITIES;
  const index = positiveModulo(Math.trunc(playerId), identities.length);

  return identities[index];
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}
