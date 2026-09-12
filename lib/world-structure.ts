export const CLUBS_PER_LEAGUE = 8;
export const INITIAL_PLAYERS_PER_CLUB = 5;

export const WORLD_LEAGUE_STRUCTURE = [
  {
    level: 1,
    name: "Prima Serie",
    groupCodes: ["A"],
  },
  {
    level: 2,
    name: "Seconda Serie",
    groupCodes: ["A", "B"],
  },
  {
    level: 3,
    name: "Terza Serie",
    groupCodes: ["A", "B", "C", "D"],
  },
  {
    level: 4,
    name: "Quarta Serie",
    groupCodes: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
    ],
  },
] as const;

export type WorldLeagueLevel =
  (typeof WORLD_LEAGUE_STRUCTURE)[number]["level"];

export const TOTAL_WORLD_LEAGUES =
  WORLD_LEAGUE_STRUCTURE.reduce(
    (total, tier) => total + tier.groupCodes.length,
    0
  );

export const TOTAL_WORLD_CLUBS =
  TOTAL_WORLD_LEAGUES * CLUBS_PER_LEAGUE;

export const TOTAL_INITIAL_PLAYERS =
  TOTAL_WORLD_CLUBS * INITIAL_PLAYERS_PER_CLUB;

export const WORLD_NATIONALITY_ALLOCATION = [
  { country: "Italia", code: "ITA", flag: "🇮🇹", count: 330 },
  { country: "Argentina", code: "ARG", flag: "🇦🇷", count: 70 },
  { country: "Germania", code: "GER", flag: "🇩🇪", count: 40 },
  { country: "Uruguay", code: "URU", flag: "🇺🇾", count: 25 },
  { country: "Francia", code: "FRA", flag: "🇫🇷", count: 25 },
  { country: "Danimarca", code: "DEN", flag: "🇩🇰", count: 20 },
  { country: "Belgio", code: "BEL", flag: "🇧🇪", count: 15 },
  { country: "Brasile", code: "BRA", flag: "🇧🇷", count: 10 },
  { country: "Spagna", code: "ESP", flag: "🇪🇸", count: 10 },
  { country: "Paesi Bassi", code: "NED", flag: "🇳🇱", count: 8 },
  { country: "Svizzera", code: "SUI", flag: "🇨🇭", count: 7 },
  { country: "Repubblica Ceca", code: "CZE", flag: "🇨🇿", count: 6 },
  { country: "Austria", code: "AUT", flag: "🇦🇹", count: 5 },
  { country: "Turchia", code: "TUR", flag: "🇹🇷", count: 4 },
  { country: "Colombia", code: "COL", flag: "🇨🇴", count: 4 },
  { country: "Giappone", code: "JPN", flag: "🇯🇵", count: 4 },
  { country: "Lussemburgo", code: "LUX", flag: "🇱🇺", count: 2 },
  { country: "San Marino", code: "SMR", flag: "🇸🇲", count: 2 },
  { country: "Norvegia", code: "NOR", flag: "🇳🇴", count: 2 },
  { country: "Portogallo", code: "POR", flag: "🇵🇹", count: 2 },
  { country: "Svezia", code: "SWE", flag: "🇸🇪", count: 2 },
  { country: "Albania", code: "ALB", flag: "🇦🇱", count: 2 },
  { country: "Liechtenstein", code: "LIE", flag: "🇱🇮", count: 2 },
  { country: "Corea del Sud", code: "KOR", flag: "🇰🇷", count: 2 },
  { country: "Egitto", code: "EGY", flag: "🇪🇬", count: 1 },
] as const;

export const NATIONS_CUP_TEAM_COUNT = 16;
export const NATIONS_CUP_PLAYERS_PER_TEAM = 3;

const nationsCupEligibleAllocations = WORLD_NATIONALITY_ALLOCATION.filter(
  (nationality) => nationality.count >= NATIONS_CUP_PLAYERS_PER_TEAM
).length;

if (nationsCupEligibleAllocations < NATIONS_CUP_TEAM_COUNT) {
  throw new Error(
    `Servono almeno ${NATIONS_CUP_TEAM_COUNT} nazioni con ${NATIONS_CUP_PLAYERS_PER_TEAM} giocatori.`
  );
}

const allocatedPlayers =
  WORLD_NATIONALITY_ALLOCATION.reduce(
    (total, nationality) => total + nationality.count,
    0
  );

if (allocatedPlayers !== TOTAL_INITIAL_PLAYERS) {
  throw new Error(
    `La distribuzione delle nazionalità deve contenere ${TOTAL_INITIAL_PLAYERS} giocatori.`
  );
}

export const PROMOTION_RELEGATION_RULES = [
  {
    level: 1,
    promotedPerGroup: 0,
    relegatedPerGroup: 2,
  },
  {
    level: 2,
    promotedPerGroup: 1,
    relegatedPerGroup: 2,
  },
  {
    level: 3,
    promotedPerGroup: 1,
    relegatedPerGroup: 2,
  },
  {
    level: 4,
    promotedPerGroup: 1,
    relegatedPerGroup: 0,
  },
] as const;

export function getWorldLeagueDefinitions() {
  return WORLD_LEAGUE_STRUCTURE.flatMap((tier) =>
    tier.groupCodes.map((groupCode) => ({
      level: tier.level,
      groupCode,
      name: `${tier.name} - Girone ${groupCode}`,
    }))
  );
}
