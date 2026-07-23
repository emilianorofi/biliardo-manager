import { Club } from "./club";

export interface Match {
  id: number;

  competition: string;
  round: number;

  date: string;
  time: string;

  homeClub: Club;
  awayClub: Club;

  venue: string;

  homeScore?: number;
  awayScore?: number;

  preparation: number;
  morale: string;
  form: number;
  fitness: number;
  absences: number;
}

export interface Matchday {
  round: number;
  matches: Match[];
}