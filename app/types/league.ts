import { Club } from "./club";

export interface League {
  id: number;

  name: string;

  season: number;

  currentMatchday: number;

  totalMatchdays: number;

  clubs: Club[];
}

export interface LeagueStanding {
  clubId: number;

  played: number;

  won: number;

  drawn: number;

  lost: number;

  matchPointsFor: number;

  matchPointsAgainst: number;

  difference: number;

  leaguePoints: number;
}