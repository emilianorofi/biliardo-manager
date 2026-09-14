import assert from "node:assert/strict";
import test from "node:test";

import {
  getGeneratedPlayerName,
  getPlayerSurnamePoolSize,
  getStablePlayerSurname,
} from "../lib/player-names";
import { getPlayerPortraitIdentity } from "../lib/player-portraits";
import { WORLD_NATIONALITY_ALLOCATION } from "../lib/world-structure";

test("offre molti più cognomi italiani", () => {
  assert.ok(getPlayerSurnamePoolSize("🇮🇹") >= 120);
});

test("ogni nazionalità del mondo ha un pool di cognomi adeguato", () => {
  for (const nationality of WORLD_NATIONALITY_ALLOCATION) {
    const poolSize = getPlayerSurnamePoolSize(nationality.flag);
    assert.ok(
      poolSize >= Math.min(30, nationality.count),
      `${nationality.code}: pool troppo piccolo (${poolSize})`
    );
  }
});

test("i cognomi cambiano subito invece di ripetersi a blocchi", () => {
  const surnames = Array.from({ length: 100 }, (_, sequence) =>
    getGeneratedPlayerName("🇮🇹", sequence).lastName
  );

  assert.equal(new Set(surnames).size, 100);
  for (let index = 1; index < surnames.length; index += 1) {
    assert.notEqual(surnames[index], surnames[index - 1]);
  }
});

test("i nomi generati restano nel pool della nazionalità", () => {
  const japanese = Array.from({ length: 20 }, (_, sequence) =>
    getGeneratedPlayerName("🇯🇵", sequence)
  );
  const korean = Array.from({ length: 20 }, (_, sequence) =>
    getGeneratedPlayerName("🇰🇷", sequence)
  );

  assert.ok(japanese.some((player) => player.lastName === "Sato"));
  assert.ok(korean.some((player) => player.lastName === "Kim"));
  assert.ok(japanese.every((player) => player.lastName !== "Rossi"));
  assert.ok(korean.every((player) => player.lastName !== "Rossi"));
});

test("il cognome stabile non cambia tra due letture dello stesso giocatore", () => {
  assert.equal(
    getStablePlayerSurname("🇦🇷", 1234),
    getStablePlayerSurname("ARG", 1234)
  );
});

test("tutte le nazionalità configurate hanno anche un ritratto deterministico", () => {
  for (const nationality of WORLD_NATIONALITY_ALLOCATION) {
    const first = getPlayerPortraitIdentity(47, nationality.flag);
    const second = getPlayerPortraitIdentity(47, nationality.code);
    assert.equal(first, second, nationality.code);
  }
});
