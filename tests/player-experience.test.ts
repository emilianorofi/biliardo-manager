import assert from "node:assert/strict";
import test from "node:test";

import {
  applyExperienceGain,
  calculateLeagueExperienceGain,
} from "../lib/player-experience";

test("assegna esperienza solo dal campionato", () => {
  assert.equal(
    calculateLeagueExperienceGain({
      singles: 1,
      doubles: 2,
      wasOnBench: false,
    }),
    0.3
  );
  assert.equal(
    calculateLeagueExperienceGain({
      singles: 0,
      doubles: 0,
      wasOnBench: true,
    }),
    0.03
  );
  assert.equal(
    applyExperienceGain(99.9, 0.3),
    100
  );
});
