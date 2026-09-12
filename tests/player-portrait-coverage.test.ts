import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const portraitSource = readFileSync(
  new URL("../app/components/player/PlayerPortrait.tsx", import.meta.url),
  "utf8"
);

const playerCardSources = [
  "../app/team/page.tsx",
  "../app/ranking/page.tsx",
  "../app/components/player/PlayerListCard.tsx",
  "../app/components/formation/FormationSlot.tsx",
  "../app/components/market/MarketPlayerCard.tsx",
  "../app/onboarding/complete/page.tsx",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));

test("mantiene le proporzioni originali dei ritratti", () => {
  assert.match(portraitSource, /backgroundSize: "400% auto"/);
  assert.match(
    portraitSource,
    /backgroundPositionY: row === 0 \? "0%" : "72\.75%"/
  );
  assert.doesNotMatch(portraitSource, /backgroundSize: "400% 200%"/);
});

test("usa un riquadro quattro quinti in tutte le schede principali", () => {
  for (const source of playerCardSources) {
    assert.match(source, /aspect-\[4\/5\]/);
  }
});

test("le principali schede usano ritratti e non iniziali", () => {
  for (const source of playerCardSources) {
    assert.match(source, /PlayerPortrait/);
    assert.doesNotMatch(source, /firstName\.charAt\(0\)/);
    assert.doesNotMatch(source, /lastName\.charAt\(0\)/);
  }
});
