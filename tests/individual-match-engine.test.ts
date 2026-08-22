import assert from "node:assert/strict";
import test from "node:test";

import {
  rankIndividualTournamentPlayers,
  shuffleIndividualDraw,
  simulateIndividualBestOfThree,
  type IndividualMatchPlayer,
} from "../lib/individual-match-engine";

test("qualifica esattamente i primi 256 giocatori per overall", () => {
  const players = Array.from({ length: 260 }, (_, index) =>
    createPlayer(index + 1, index + 1)
  );
  const qualified = rankIndividualTournamentPlayers(players);

  assert.equal(qualified.length, 256);
  assert.equal(qualified[0].player.id, 260);
  assert.equal(qualified[0].ranking, 1);
  assert.equal(qualified[255].player.id, 5);
});

test("il sorteggio cambia l'ordine senza perdere partecipanti", () => {
  const draw = shuffleIndividualDraw([1, 2, 3, 4], () => 0);

  assert.deepEqual(draw, [2, 3, 4, 1]);
  assert.deepEqual([...draw].sort((a, b) => a - b), [1, 2, 3, 4]);
});

test("un incontro individuale termina appena un giocatore vince due prove", () => {
  const randomValues = [0, 0.99, 0];
  let randomIndex = 0;
  const result = simulateIndividualBestOfThree(
    createPlayer(1, 70),
    createPlayer(2, 70),
    "ITALIANA",
    () => randomValues[randomIndex++]
  );

  assert.equal(result.winnerPlayerId, 1);
  assert.equal(result.loserPlayerId, 2);
  assert.equal(result.playerOneWins, 2);
  assert.equal(result.playerTwoWins, 1);
  assert.deepEqual(
    result.games.map((game) => ({
      order: game.order,
      specialty: game.specialty,
      winnerSide: game.winnerSide,
      winnerPlayerId: game.winnerPlayerId,
    })),
    [
      {
        order: 1,
        specialty: "ITALIANA",
        winnerSide: "PLAYER_ONE",
        winnerPlayerId: 1,
      },
      {
        order: 2,
        specialty: "ITALIANA",
        winnerSide: "PLAYER_TWO",
        winnerPlayerId: 2,
      },
      {
        order: 3,
        specialty: "ITALIANA",
        winnerSide: "PLAYER_ONE",
        winnerPlayerId: 1,
      },
    ]
  );
  assert.deepEqual(
    result.games.map((game) => [
      game.playerOnePerformanceRating,
      game.playerTwoPerformanceRating,
    ]),
    [
      [70, 70],
      [70, 70],
      [70, 70],
    ]
  );
  assert.equal(randomIndex, 3);
});

function createPlayer(id: number, rating: number): IndividualMatchPlayer {
  return {
    id,
    precisione: rating,
    diretto: rating,
    sponde: rating,
    tattica: rating,
    mentalita: rating,
    difesa: rating,
    realizzazione: rating,
    creativita: rating,
    misura: rating,
    form: 5,
    morale: 5,
    experience: 0,
  };
}
