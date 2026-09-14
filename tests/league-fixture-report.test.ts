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
import { buildFixtureStory } from "../lib/league-fixture-story";

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

test("racconta le sei prove con i nomi dei giocatori e il verdetto finale", () => {
  const games = Array.from({ length: 6 }, (_, index) => ({
    order: index + 1,
    specialty:
      index < 2 ? "ITALIANA" : index < 4 ? "GORIZIANA" : "TUTTI_DOPPI",
    gameType: index % 2 === 0 ? "SINGLES" : "DOUBLES",
    winnerSide: index % 2 === 0 ? "HOME" : "AWAY",
    homePoints: index % 2 === 0 ? 80 : 70,
    awayPoints: index % 2 === 0 ? 62 : 80,
    playerPerformances: [
      createStoryPerformance("HOME", `Casa${index + 1}`, "Test"),
      createStoryPerformance("AWAY", `Ospite${index + 1}`, "Test"),
      ...(index % 2 === 1
        ? [
            createStoryPerformance("HOME", `Casa${index + 1}B`, "Test"),
            createStoryPerformance("AWAY", `Ospite${index + 1}B`, "Test"),
          ]
        : []),
    ],
  }));
  const story = buildFixtureStory({
    homeName: "Club Casa",
    awayName: "Club Ospite",
    homeScore: 3,
    awayScore: 3,
    games,
  });

  assert.equal(story.passages.length, 6);
  assert.deepEqual(
    story.passages.map((passage) => passage.score),
    ["1–0", "1–1", "2–1", "2–2", "3–2", "3–3"]
  );
  assert.match(story.passages[0].text, /Casa1 Test/);
  assert.match(story.passages[0].text, /Ospite1 Test/);
  assert.match(story.passages[0].text, /80–62/);
  assert.match(story.closing, /Club Casa e Club Ospite/);
  assert.match(story.closing, /3–3/);
  assert.match(story.closing, /firmano l'ultimo punto/);
});

function createStoryPerformance(side: string, firstName: string, lastName: string) {
  return {
    appearance: {
      side,
      playerFirstName: firstName,
      playerLastName: lastName,
    },
  };
}

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
