import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PlayerPortrait from "../app/components/player/PlayerPortrait";

function getPortraitIdentity(markup: string) {
  const match = markup.match(/billiards-player-identity-(\d+)\.webp/);
  assert.ok(match, "Il markup deve contenere un'identità grafica");
  return Number(match[1]);
}

test("ranking e scheda personale usano lo stesso ritratto", () => {
  const basePlayer = {
    id: 4,
    firstName: "Luca",
    lastName: "Rossi",
    age: 37,
  };
  const profileMarkup = renderToStaticMarkup(
    createElement(PlayerPortrait, {
      player: { ...basePlayer, nationality: "ITA" },
    })
  );
  const rankingMarkup = renderToStaticMarkup(
    createElement(PlayerPortrait, {
      player: { ...basePlayer, nationalityCode: "ITA" },
    })
  );

  assert.equal(
    getPortraitIdentity(rankingMarkup),
    getPortraitIdentity(profileMarkup)
  );
});
