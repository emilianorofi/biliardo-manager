import { GameState } from "../types/gameState";
import { clubs } from "./clubs";

export const gameState: GameState = {
  season: 1,

  currentRound: 1,

  clubs,

  schedule: [],

  nextMatch: null,
};