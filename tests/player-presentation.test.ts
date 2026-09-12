import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import CountryFlag from "../app/components/player/CountryFlag";
import PlayerCareerSection from "../app/components/player/PlayerCareerSection";
import PlayerListCard from "../app/components/player/PlayerListCard";
import type { Player } from "../app/types/player";
import { canViewPlayerTechnicalValues } from "../lib/player-visibility";
import { getNationalityDisplay } from "../lib/nationalities";
import {
  getPlayerPortraitIdentity,
  PLAYER_PORTRAIT_IDENTITIES,
} from "../lib/player-portraits";
import {
  buildGlobalPlayerRanking,
  rankGlobalPlayers,
} from "../lib/player-ranking";

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

test("restituisce la graduatoria ufficiale completa nello stesso ordine", () => {
  const rankedPlayers = rankGlobalPlayers([
    { id: 8, ...values },
    { id: 3, ...values },
    { id: 5, ...values, precisione: 88 },
  ]);

  assert.deepEqual(
    rankedPlayers.map(({ player, position }) => ({
      id: player.id,
      position,
    })),
    [
      { id: 5, position: 1 },
      { id: 3, position: 2 },
      { id: 8, position: 3 },
    ]
  );
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


test("mostra i valori tecnici soltanto al club proprietario", () => {
  assert.equal(canViewPlayerTechnicalValues(12, 12), true);
  assert.equal(canViewPlayerTechnicalValues(12, 13), false);
  assert.equal(canViewPlayerTechnicalValues(12, null), false);
});

test("la rosa pubblica non inserisce i valori tecnici nel markup", () => {
  const player: Player = {
    id: 101,
    firstName: "Luca",
    lastName: "Riservato",
    nationality: "ITA",
    age: 31,
    overall: 78,
    form: 7,
    morale: 8,
    experience: 44,
    value: 120000,
    salary: 8500,
    image: "",
    style: ["Preciso"],
    specialties: {
      italiana: 86,
      goriziana: 87,
      tuttiDoppi: 88,
    },
    attributes: {
      precisione: 91,
      diretto: 92,
      sponde: 93,
      tattica: 94,
      mentalita: 95,
      difesa: 96,
      realizzazione: 97,
      creativita: 98,
      misura: 99,
    },
  };
  const markup = renderToStaticMarkup(
    createElement(PlayerListCard, {
      player,
      showTechnicalValues: false,
    })
  );

  assert.match(markup, /Valori tecnici riservati/);
  assert.doesNotMatch(markup, /Precisione/);
  assert.doesNotMatch(markup, /Tutti Doppi/);
  for (const value of [91, 92, 93, 94, 95, 96, 97, 98, 99]) {
    assert.doesNotMatch(markup, new RegExp(`>${value}<`));
  }
});

test("la carriera pubblica mostra partite, prove e trasferimenti", () => {
  const markup = renderToStaticMarkup(
    createElement(PlayerCareerSection, {
      career: {
        summary: {
          appearances: 4,
          clubs: 2,
          played: 12,
          wins: 7,
          losses: 5,
          winRate: 58.3,
          averagePerformance: 74.2,
        },
        specialties: [],
        gameTypes: [],
        seasons: [],
        recentAppearances: [],
        transfers: [
          {
            id: 1,
            completedAt: "2026-09-12T00:00:00.000Z",
            type: "AUCTION",
            fromClubName: "Club Uno",
            fromClubId: 1,
            toClubName: "Club Due",
            toClubId: 2,
            amount: 120000,
          },
        ],
      },
    })
  );

  assert.match(markup, /Carriera e partite/);
  assert.match(markup, /Presenze/);
  assert.match(markup, /Prove/);
  assert.match(markup, /Trasferimenti/);
  assert.match(markup, /Club Uno/);
  assert.match(markup, /Club Due/);
});
