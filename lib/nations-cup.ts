import { getNationalityDisplay } from "@/lib/nationalities";
import { rankGlobalPlayers, type RankablePlayer } from "@/lib/player-ranking";
import {
  NATIONS_CUP_PLAYERS_PER_TEAM,
  NATIONS_CUP_TEAM_COUNT,
} from "@/lib/world-structure";
import {
  calculatePlayerPerformance,
  type MatchPerformancePlayerValues,
  type MatchSpecialty,
} from "@/lib/match-engine";
import { simulateMatchWinner } from "@/lib/match-simulator";

export const NATIONS_CUP_GROUPS = ["A", "B", "C", "D"] as const;
export const NATIONS_CUP_LEAGUE_ROUND = 7;

export type NationsCupGroup = (typeof NATIONS_CUP_GROUPS)[number];

export type NationsCupPlayer = RankablePlayer & {
  firstName: string;
  lastName: string;
  nationality: string;
};

const NATIONS_CUP_SPECIALTIES: readonly MatchSpecialty[] = [
  "ITALIANA",
  "GORIZIANA",
  "TUTTI_DOPPI",
];

export type NationsCupTeam<T extends NationsCupPlayer = NationsCupPlayer> = {
  code: string;
  name: string;
  flag: string;
  seed: number;
  group: NationsCupGroup;
  rankingTotal: number;
  players: Array<{
    player: T;
    ranking: number;
    overall: number;
  }>;
};

export type NationsCupGroupFixture = {
  group: NationsCupGroup;
  matchday: 1 | 2 | 3;
  position: number;
  homeSeed: number;
  awaySeed: number;
};

export type NationsCupStanding = {
  seed: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number;
};

export type NationsCupScore = {
  homeSeed: number;
  awaySeed: number;
  homeScore: number;
  awayScore: number;
};

export function selectNationsCupTeams<T extends NationsCupPlayer>(
  players: T[]
): NationsCupTeam<T>[] {
  const ranked = rankGlobalPlayers(players);
  const byNation = new Map<string, typeof ranked>();

  for (const rankedPlayer of ranked) {
    const nation = getNationalityDisplay(rankedPlayer.player.nationality);
    const entries = byNation.get(nation.code) ?? [];
    entries.push(rankedPlayer);
    byNation.set(nation.code, entries);
  }

  const eligible = Array.from(byNation.entries())
    .filter(([, entries]) => entries.length >= NATIONS_CUP_PLAYERS_PER_TEAM)
    .map(([code, entries]) => {
      const selected = entries.slice(0, NATIONS_CUP_PLAYERS_PER_TEAM);
      const nation = getNationalityDisplay(selected[0].player.nationality);

      return {
        code,
        name: nation.label,
        flag: nation.flag,
        rankingTotal: selected.reduce((total, entry) => total + entry.position, 0),
        bestRanking: selected[0].position,
        players: selected.map((entry) => ({
          player: entry.player,
          ranking: entry.position,
          overall: entry.overall,
        })),
      };
    })
    .sort(
      (first, second) =>
        first.rankingTotal - second.rankingTotal ||
        first.bestRanking - second.bestRanking ||
        first.code.localeCompare(second.code)
    )
    .slice(0, NATIONS_CUP_TEAM_COUNT);

  if (eligible.length !== NATIONS_CUP_TEAM_COUNT) {
    throw new Error("NATIONS_CUP_ELIGIBLE_NATIONS_INCOMPLETE");
  }

  return eligible.map((nation, index) => ({
    code: nation.code,
    name: nation.name,
    flag: nation.flag,
    seed: index + 1,
    group: NATIONS_CUP_GROUPS[index % NATIONS_CUP_GROUPS.length],
    rankingTotal: nation.rankingTotal,
    players: nation.players,
  }));
}

export function buildNationsCupGroupFixtures(
  teams: ReadonlyArray<Pick<NationsCupTeam, "seed" | "group">>
): NationsCupGroupFixture[] {
  return NATIONS_CUP_GROUPS.flatMap((group) => {
    const seeds = teams
      .filter((team) => team.group === group)
      .map((team) => team.seed);

    if (seeds.length !== 4) {
      throw new Error(`NATIONS_CUP_GROUP_${group}_INCOMPLETE`);
    }

    const pairings = [
      [[0, 3], [1, 2]],
      [[0, 2], [3, 1]],
      [[0, 1], [2, 3]],
    ] as const;

    return pairings.flatMap((matches, matchdayIndex) =>
      matches.map(([home, away], matchIndex) => ({
        group,
        matchday: (matchdayIndex + 1) as 1 | 2 | 3,
        position: matchdayIndex * 2 + matchIndex + 1,
        homeSeed: seeds[home],
        awaySeed: seeds[away],
      }))
    );
  });
}

export function calculateNationsCupStandings(
  teams: ReadonlyArray<Pick<NationsCupTeam, "seed">>,
  scores: NationsCupScore[]
) {
  const standings = new Map<number, NationsCupStanding>(
    teams.map((team) => [team.seed, emptyStanding(team.seed)])
  );

  for (const score of scores) {
    const home = standings.get(score.homeSeed);
    const away = standings.get(score.awaySeed);
    if (!home || !away) throw new Error("NATIONS_CUP_UNKNOWN_TEAM");

    home.played += 1;
    away.played += 1;
    home.pointsFor += score.homeScore;
    home.pointsAgainst += score.awayScore;
    away.pointsFor += score.awayScore;
    away.pointsAgainst += score.homeScore;

    if (score.homeScore > score.awayScore) {
      home.won += 1; away.lost += 1;
    } else if (score.awayScore > score.homeScore) {
      away.won += 1; home.lost += 1;
    } else {
      home.drawn += 1; away.drawn += 1;
    }
    home.points += score.homeScore;
    away.points += score.awayScore;
  }

  return Array.from(standings.values()).sort(
    (first, second) =>
      second.points - first.points ||
      (second.pointsFor - second.pointsAgainst) -
        (first.pointsFor - first.pointsAgainst) ||
      second.pointsFor - first.pointsFor ||
      first.seed - second.seed
  );
}

export function buildNationsCupQuarterFinals(
  qualified: Readonly<Record<NationsCupGroup, readonly [number, number]>>
) {
  return [
    { position: 1, homeSeed: qualified.A[0], awaySeed: qualified.B[1] },
    { position: 2, homeSeed: qualified.B[0], awaySeed: qualified.A[1] },
    { position: 3, homeSeed: qualified.C[0], awaySeed: qualified.D[1] },
    { position: 4, homeSeed: qualified.D[0], awaySeed: qualified.C[1] },
  ];
}

export function resolveNationsCupKnockoutTie<
  T extends NationsCupPlayer & MatchPerformancePlayerValues,
>(
  home: NationsCupTeam<T>,
  away: NationsCupTeam<T>,
  specialtyRandomValue = Math.random(),
  matchRandomValue = Math.random()
) {
  const specialtyIndex = Math.min(
    NATIONS_CUP_SPECIALTIES.length - 1,
    Math.floor(Math.max(0, specialtyRandomValue) * NATIONS_CUP_SPECIALTIES.length)
  );
  const specialty = NATIONS_CUP_SPECIALTIES[specialtyIndex];
  const homePlayer = home.players[0].player;
  const awayPlayer = away.players[0].player;
  const homePerformance = calculatePlayerPerformance(homePlayer, specialty);
  const awayPerformance = calculatePlayerPerformance(awayPlayer, specialty);
  const result = simulateMatchWinner(
    homePerformance.performanceRating,
    awayPerformance.performanceRating,
    matchRandomValue
  );

  return {
    specialty,
    homePlayerId: homePlayer.id,
    awayPlayerId: awayPlayer.id,
    winnerSeed: result.winner === "HOME" ? home.seed : away.seed,
    winnerPlayerId: result.winner === "HOME" ? homePlayer.id : awayPlayer.id,
    homePerformanceRating: homePerformance.performanceRating,
    awayPerformanceRating: awayPerformance.performanceRating,
    randomValue: result.randomValue,
  };
}

function emptyStanding(seed: number): NationsCupStanding {
  return {
    seed, played: 0, won: 0, drawn: 0, lost: 0,
    pointsFor: 0, pointsAgainst: 0, points: 0,
  };
}
