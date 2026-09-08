import assert from "node:assert/strict";
import test from "node:test";

import {
  simulateFixtureWithPlayers,
  type FixtureCareerFormation,
  type FixtureCareerPlayer,
} from "../lib/fixture-player-simulator";
import {
  MATCH_TOTAL_SCORE_STEP,
  MATCH_TARGET_POINTS,
} from "../lib/match-engine";

test("registra un punteggio completo e valido per le sei prove di campionato", () => {
  const home = createFormation(1, 72);
  const away = createFormation(11, 72);
  const simulation = simulateFixtureWithPlayers(
    home,
    away,
    [0, 1, 0, 1, 0, 1]
  );

  assert.equal(simulation.games.length, 6);
  assert.equal(simulation.homeScore, 3);
  assert.equal(simulation.awayScore, 3);

  for (const game of simulation.games) {
    const target = MATCH_TARGET_POINTS[game.specialty];
    const step = MATCH_TOTAL_SCORE_STEP[game.specialty];
    const winnerPoints =
      game.result.winner === "HOME" ? game.homePoints : game.awayPoints;
    const loserPoints =
      game.result.winner === "HOME" ? game.awayPoints : game.homePoints;

    assert.ok(winnerPoints >= target);
    assert.ok(loserPoints < target);
    assert.equal(game.homePoints % step, 0);
    assert.equal(game.awayPoints % step, 0);
  }
});

function createFormation(
  firstId: number,
  rating: number
): FixtureCareerFormation {
  return {
    A: createPlayer(firstId, rating),
    B: createPlayer(firstId + 1, rating),
    C: createPlayer(firstId + 2, rating),
  };
}

function createPlayer(id: number, rating: number): FixtureCareerPlayer {
  return {
    id,
    clubId: id < 10 ? 1 : 2,
    firstName: `Giocatore${id}`,
    lastName: "Test",
    nationality: "🇮🇹",
    age: 30,
    talent: rating,
    form: 5,
    morale: 5,
    experience: 50,
    precisione: rating,
    diretto: rating,
    sponde: rating,
    tattica: rating,
    mentalita: rating,
    difesa: rating,
    realizzazione: rating,
    creativita: rating,
    misura: rating,
  };
}
