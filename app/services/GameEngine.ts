import { gameState } from "../data/gameState";
import { generateSchedule } from "../../lib/schedule";

export class GameEngine {
  static newGame() {
    gameState.currentRound = 1;

    gameState.schedule = generateSchedule(gameState.clubs);

    return gameState;
  }

  static getCurrentMatchday() {
    return gameState.schedule.find(
      (day) => day.round === gameState.currentRound
    );
  }

  static getNextMatch() {
    const matchday = this.getCurrentMatchday();

    if (!matchday) return null;

    return matchday.matches[0];
  }

  static startSeason() {
  this.newGame();

  gameState.nextMatch = this.getNextMatch();

  return gameState;
}

static updateNextMatch() {
  gameState.nextMatch = this.getNextMatch();

  return gameState.nextMatch;
}

  static nextRound() {
    if (gameState.currentRound < gameState.schedule.length) {
    gameState.currentRound++;
  }

    return this.getCurrentMatchday();
  }

  static getGameState() {
    return gameState;
  }
}