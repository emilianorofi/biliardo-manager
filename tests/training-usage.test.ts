import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateLeagueTrainingUsage,
} from "../lib/training-usage";

test("calcola l'intensità dalle prove di campionato", () => {
  assert.deepEqual(
    calculateLeagueTrainingUsage([]),
    {
      singles: 0,
      doubles: 0,
      intensity: 15,
      label: "Panchina",
    }
  );
  assert.equal(
    calculateLeagueTrainingUsage([
      "DOUBLES",
    ]).intensity,
    30
  );
  assert.equal(
    calculateLeagueTrainingUsage([
      "SINGLES",
    ]).intensity,
    40
  );
  assert.equal(
    calculateLeagueTrainingUsage([
      "SINGLES",
      "DOUBLES",
    ]).intensity,
    70
  );
  assert.deepEqual(
    calculateLeagueTrainingUsage([
      "SINGLES",
      "DOUBLES",
      "DOUBLES",
    ]),
    {
      singles: 1,
      doubles: 2,
      intensity: 100,
      label: "Singolo + 2 coppie",
    }
  );
});
