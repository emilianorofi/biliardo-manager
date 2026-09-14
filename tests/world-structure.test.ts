import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNationalityQueue,
  buildNationalityRebalancing,
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

test("crea una piramide di 15 gironi, 120 squadre e 720 giocatori", () => {
  assert.equal(TOTAL_WORLD_LEAGUES, 15);
  assert.equal(TOTAL_WORLD_CLUBS, 120);
  assert.equal(TOTAL_INITIAL_PLAYERS, 720);

  const definitions = getWorldLeagueDefinitions();
  assert.deepEqual(
    definitions.map((definition) => definition.level),
    [1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4]
  );
});

test("distribuisce 720 giocatori tra 25 nazioni e dà profondità a tutte", () => {
  assert.equal(WORLD_NATIONALITY_ALLOCATION.length, 25);
  assert.equal(
    WORLD_NATIONALITY_ALLOCATION.reduce(
      (total, nationality) => total + nationality.count,
      0
    ),
    720
  );

  const allocation = new Map(
    WORLD_NATIONALITY_ALLOCATION.map((nationality) => [
      nationality.country,
      nationality.count,
    ])
  );
  assert.equal(allocation.get("Italia"), 350);
  assert.equal(allocation.get("Argentina"), 80);
  assert.equal(allocation.get("Germania"), 50);
  assert.equal(allocation.get("Uruguay"), 30);
  assert.equal(allocation.get("Francia"), 30);
  assert.equal(allocation.get("Danimarca"), 24);
  assert.equal(allocation.get("Belgio"), 20);
  assert.ok(
    WORLD_NATIONALITY_ALLOCATION.every((nationality) => nationality.count >= 6)
  );
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
  const queue = buildNationalityQueue(new Map(), 720);
  const counts = new Map<string, number>();

  for (const nationality of queue) {
    counts.set(nationality, (counts.get(nationality) ?? 0) + 1);
  }

  for (const nationality of WORLD_NATIONALITY_ALLOCATION) {
    assert.equal(counts.get(nationality.flag), nationality.count);
  }
});

test("riallinea soltanto i giocatori delle nazioni in surplus", () => {
  const previousAllocation = [
    ...Array.from({ length: 410 }, (_, index) => ({ id: index + 1, nationality: "🇮🇹" })),
    ...WORLD_NATIONALITY_ALLOCATION.slice(1).flatMap((nation, nationIndex) =>
      Array.from({ length: Math.max(1, nation.count - 1) }, (_, index) => ({
        id: 1000 + nationIndex * 100 + index,
        nationality: nation.flag,
      }))
    ),
  ];
  const updates = buildNationalityRebalancing(previousAllocation);

  assert.ok(updates.length > 0);
  assert.equal(new Set(updates.map((update) => update.playerId)).size, updates.length);
  assert.ok(updates.every((update) => update.nationality !== "🇮🇹"));
});

test("i nomi dei 350 giocatori italiani iniziali non si ripetono", () => {
  const names = new Set<string>();

  for (let index = 0; index < 350; index += 1) {
    const player = createGeneratedWorldPlayer({
      leagueLevel: 1,
      rosterIndex: index % 6,
      nationality: "🇮🇹",
      nationalitySequence: index,
      seed: index + 1,
    });
    names.add(`${player.firstName} ${player.lastName}`);
  }

  assert.equal(names.size, 350);
});
