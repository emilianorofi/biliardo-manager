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
  { country: "Italia", flag: "🇮🇹", count: 390 },
  { country: "Argentina", flag: "🇦🇷", count: 75 },
  { country: "Germania", flag: "🇩🇪", count: 39 },
  { country: "Uruguay", flag: "🇺🇾", count: 24 },
  { country: "Francia", flag: "🇫🇷", count: 24 },
  { country: "Danimarca", flag: "🇩🇰", count: 18 },
  { country: "Belgio", flag: "🇧🇪", count: 12 },
  { country: "Lussemburgo", flag: "🇱🇺", count: 1 },
  { country: "Svizzera", flag: "🇨🇭", count: 1 },
  { country: "Repubblica Ceca", flag: "🇨🇿", count: 1 },
  { country: "Austria", flag: "🇦🇹", count: 1 },
  { country: "San Marino", flag: "🇸🇲", count: 1 },
  { country: "Brasile", flag: "🇧🇷", count: 1 },
  { country: "Paesi Bassi", flag: "🇳🇱", count: 1 },
  { country: "Spagna", flag: "🇪🇸", count: 1 },
  { country: "Norvegia", flag: "🇳🇴", count: 1 },
  { country: "Portogallo", flag: "🇵🇹", count: 1 },
  { country: "Svezia", flag: "🇸🇪", count: 1 },
  { country: "Albania", flag: "🇦🇱", count: 1 },
  { country: "Liechtenstein", flag: "🇱🇮", count: 1 },
  { country: "Turchia", flag: "🇹🇷", count: 1 },
  { country: "Colombia", flag: "🇨🇴", count: 1 },
  { country: "Corea del Sud", flag: "🇰🇷", count: 1 },
  { country: "Giappone", flag: "🇯🇵", count: 1 },
  { country: "Egitto", flag: "🇪🇬", count: 1 },
] as const;

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
