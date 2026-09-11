import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import CountryFlag from "../app/components/player/CountryFlag";
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

test("mostra la bandiera come grafica SVG e non come emoji", () => {
  const markup = renderToStaticMarkup(
    createElement(CountryFlag, { code: "ITA", label: "Italia" })
  );

  assert.match(markup, /<svg/);
  assert.match(markup, /#009246/);
  assert.doesNotMatch(markup, /🇮🇹/);
});

test("distribuisce i giocatori su venti identità grafiche", () => {
  const identities = new Set(
    Array.from({ length: 20 }, (_, index) =>
      getPlayerPortraitIdentity(index)
    )
  );

  assert.equal(PLAYER_PORTRAIT_IDENTITIES.length, 20);
  assert.equal(identities.size, 20);

  for (const identity of PLAYER_PORTRAIT_IDENTITIES) {
    assert.equal(
      existsSync(
        path.join(
          process.cwd(),
          "public",
          "players",
          `billiards-player-identity-${identity}.webp`
        )
      ),
      true
    );
  }
});
