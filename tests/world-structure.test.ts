import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNationalityQueue,
  createAiClubBlueprint,
  createGeneratedWorldPlayer,
} from "../lib/world-generation";
import {
  getWorldLeagueDefinitions,
  TOTAL_INITIAL_PLAYERS,
  TOTAL_WORLD_CLUBS,
  TOTAL_WORLD_LEAGUES,
  WORLD_NATIONALITY_ALLOCATION,
} from "../lib/world-structure";

test("crea una piramide di 15 gironi, 120 squadre e 600 giocatori", () => {
  assert.equal(TOTAL_WORLD_LEAGUES, 15);
  assert.equal(TOTAL_WORLD_CLUBS, 120);
  assert.equal(TOTAL_INITIAL_PLAYERS, 600);

  const definitions = getWorldLeagueDefinitions();
  assert.deepEqual(
    definitions.map((definition) => definition.level),
    [1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4]
  );
});

test("distribuisce 600 giocatori tra 25 nazioni", () => {
  assert.equal(WORLD_NATIONALITY_ALLOCATION.length, 25);
  assert.equal(
    WORLD_NATIONALITY_ALLOCATION.reduce(
      (total, nationality) => total + nationality.count,
      0
    ),
    600
  );

  const allocation = new Map(
    WORLD_NATIONALITY_ALLOCATION.map((nationality) => [
      nationality.country,
      nationality.count,
    ])
  );
  assert.equal(allocation.get("Italia"), 390);
  assert.equal(allocation.get("Argentina"), 75);
  assert.equal(allocation.get("Germania"), 39);
  assert.equal(allocation.get("Uruguay"), 24);
  assert.equal(allocation.get("Francia"), 24);
  assert.equal(allocation.get("Danimarca"), 18);
  assert.equal(allocation.get("Belgio"), 12);
});

test("genera 120 identità di club differenti", () => {
  const clubs = Array.from({ length: 120 }, (_, index) =>
    createAiClubBlueprint(index)
  );

  assert.equal(new Set(clubs.map((club) => club.name)).size, 120);
  assert.equal(
    new Set(clubs.map((club) => club.normalizedName)).size,
    120
  );
  assert.equal(
    clubs.some((club) =>
      /^(Biliardo|Sporting|Master|Accademia) /.test(club.name)
    ),
    false
  );
  assert.equal(
    clubs.some((club) => club.shortName.startsWith("IA")),
    false
  );
});

test("la coda delle nazionalità conserva tutte le quote iniziali", () => {
  const queue = buildNationalityQueue(new Map(), 600);
  const counts = new Map<string, number>();

  for (const nationality of queue) {
    counts.set(nationality, (counts.get(nationality) ?? 0) + 1);
  }

  for (const nationality of WORLD_NATIONALITY_ALLOCATION) {
    assert.equal(counts.get(nationality.flag), nationality.count);
  }
});

test("i nomi dei 390 giocatori italiani iniziali non si ripetono", () => {
  const names = new Set<string>();

  for (let index = 0; index < 390; index += 1) {
    const player = createGeneratedWorldPlayer({
      leagueLevel: 1,
      rosterIndex: index % 5,
      nationality: "🇮🇹",
      nationalitySequence: index,
      seed: index + 1,
    });
    names.add(`${player.firstName} ${player.lastName}`);
  }

  assert.equal(names.size, 390);
});
