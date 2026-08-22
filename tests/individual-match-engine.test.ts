import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateIndividualGameScore,
  rankIndividualTournamentPlayers,
  shuffleIndividualDraw,
  simulateIndividualBestOfThree,
  type IndividualMatchPlayer,
} from "../lib/individual-match-engine";
import { buildIndividualGameChronicle } from "../lib/individual-game-chronicle";
import { MATCH_SHOT_SCORES } from "../lib/match-engine";

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
  assert.deepEqual(
    result.games.map((game) => [game.playerOneScore, game.playerTwoScore]),
    [
      [80, 62],
      [75, 80],
      [80, 62],
    ]
  );
  assert.equal(randomIndex, 3);
});

test("usa il traguardo punti previsto da ogni specialità", () => {
  assert.deepEqual(
    calculateIndividualGameScore({
      specialty: "ITALIANA",
      winnerSide: "PLAYER_ONE",
      playerOnePerformanceRating: 80,
      playerTwoPerformanceRating: 70,
      randomValue: 0.5,
    }),
    { playerOneScore: 80, playerTwoScore: 66 }
  );
  assert.deepEqual(
    calculateIndividualGameScore({
      specialty: "GORIZIANA",
      winnerSide: "PLAYER_TWO",
      playerOnePerformanceRating: 70,
      playerTwoPerformanceRating: 80,
      randomValue: 0.5,
    }),
    { playerOneScore: 330, playerTwoScore: 400 }
  );
  assert.deepEqual(
    calculateIndividualGameScore({
      specialty: "TUTTI_DOPPI",
      winnerSide: "PLAYER_ONE",
      playerOnePerformanceRating: 80,
      playerTwoPerformanceRating: 70,
      randomValue: 0.5,
    }),
    { playerOneScore: 600, playerTwoScore: 492 }
  );
});

test("conserva i punteggi ammessi per ogni singolo tiro", () => {
  assert.deepEqual(MATCH_SHOT_SCORES.ITALIANA, [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ]);
  assert.deepEqual(MATCH_SHOT_SCORES.GORIZIANA, [
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
    38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 60, 64, 68, 72, 76, 80, 84, 88,
    92, 96, 100, 104, 108, 112,
  ]);
  assert.deepEqual(MATCH_SHOT_SCORES.TUTTI_DOPPI, [
    4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72,
    76, 80, 84, 88, 92, 96, 100, 104, 108, 112,
  ]);
});

test("costruisce una cronaca alternata con punteggi e totali corretti", () => {
  const chronicle = buildIndividualGameChronicle({
    gameId: 510,
    specialty: "GORIZIANA",
    winnerSide: "PLAYER_TWO",
    playerOneScore: 324,
    playerTwoScore: 400,
  });

  assert.equal(chronicle.length, 16);
  assert.deepEqual(chronicle.at(-1), {
    order: 16,
    playerSide: "PLAYER_TWO",
    points: chronicle.at(-1)!.points,
    playerOneTotal: 324,
    playerTwoTotal: 400,
  });

  for (const [index, shot] of chronicle.entries()) {
    assert.equal(shot.order, index + 1);
    assert.equal(
      shot.playerSide,
      index % 2 === 0 ? "PLAYER_ONE" : "PLAYER_TWO"
    );
    assert.ok(
      shot.points === 0 || MATCH_SHOT_SCORES.GORIZIANA.includes(shot.points)
    );
    assert.equal(shot.points % 2, 0);
  }
});

test("chiude ogni specialità con il tiro del vincitore", () => {
  const cases = [
    {
      gameId: 1,
      specialty: "ITALIANA" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 80,
      playerTwoScore: 65,
    },
    {
      gameId: 2,
      specialty: "GORIZIANA" as const,
      winnerSide: "PLAYER_TWO" as const,
      playerOneScore: 324,
      playerTwoScore: 400,
    },
    {
      gameId: 3,
      specialty: "TUTTI_DOPPI" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 600,
      playerTwoScore: 492,
    },
  ];

  for (const game of cases) {
    const chronicle = buildIndividualGameChronicle(game);
    const finalShot = chronicle.at(-1)!;
    const allowedScores = MATCH_SHOT_SCORES[game.specialty];

    assert.equal(finalShot.playerSide, game.winnerSide);
    assert.ok(finalShot.points > 0);
    assert.ok(allowedScores.includes(finalShot.points));
    assert.equal(finalShot.playerOneTotal, game.playerOneScore);
    assert.equal(finalShot.playerTwoTotal, game.playerTwoScore);

    for (const shot of chronicle) {
      assert.ok(shot.points === 0 || allowedScores.includes(shot.points));
      assert.ok(shot.playerOneTotal <= game.playerOneScore);
      assert.ok(shot.playerTwoTotal <= game.playerTwoScore);
    }
  }
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