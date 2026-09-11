import assert from "node:assert/strict";
import test from "node:test";

import { getNationalityDisplay } from "../lib/nationalities";
import {
  getPlayerPortraitIdentity,
  PLAYER_PORTRAIT_IDENTITIES,
} from "../lib/player-portraits";
import { buildGlobalPlayerRanking } from "../lib/player-ranking";

const values = {
  precisione: 70,
  diretto: 70,
  sponde: 70,
  tattica: 70,
  mentalita: 70,
  difesa: 70,
  realizzazione: 70,
  creativita: 70,
  misura: 70,
};

test("calcola il ranking globale per overall e usa l'id a parità", () => {
  const ranking = buildGlobalPlayerRanking([
    { id: 8, ...values },
    { id: 3, ...values },
    { id: 5, ...values, precisione: 88 },
  ]);

  assert.equal(ranking.get(5)?.position, 1);
  assert.equal(ranking.get(3)?.position, 2);
  assert.equal(ranking.get(8)?.position, 3);
});

test("riconosce sigla, nome e bandiera della nazionalità", () => {
  const fromCode = getNationalityDisplay("ITA");
  const fromCountry = getNationalityDisplay("Italia");
  const fromFlag = getNationalityDisplay("🇮🇹");

  assert.deepEqual(fromCode, fromCountry);
  assert.deepEqual(fromCountry, fromFlag);
  assert.equal(fromCode.code, "ITA");
  assert.equal(fromCode.flag, "🇮🇹");
});

test("distribuisce i giocatori su nove identità grafiche", () => {
  const identities = new Set(
    Array.from({ length: 9 }, (_, index) =>
      getPlayerPortraitIdentity(index)
    )
  );

  assert.equal(PLAYER_PORTRAIT_IDENTITIES.length, 9);
  assert.equal(identities.size, 9);
});
