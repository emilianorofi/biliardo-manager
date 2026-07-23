import { Club } from "./club";
import { Match, Matchday } from "./match";

export interface GameState {
  season: number;

  currentRound: number;

  clubs: Club[];

  schedule: Matchday[];

  nextMatch: Match | null;
}