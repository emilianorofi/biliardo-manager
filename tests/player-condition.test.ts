import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateWeeklyPlayerCondition,
} from "../lib/player-condition";

test("aggiorna forma e morale una sola volta a settimana", () => {
  assert.deepEqual(
    calculateWeeklyPlayerCondition({
      currentForm: 5,
      currentMorale: 5,
      gamesPlayed: 3,
      gamesWon: 2,
      teamResult: "WIN",
      consecutiveBenchWeeks: 0,
    }),
    {
      formChange: 1,
      formAfter: 6,
      moraleChange: 1,
      moraleAfter: 6,
    }
  );

  assert.deepEqual(
    calculateWeeklyPlayerCondition({
      currentForm: 8,
      currentMorale: 5,
      gamesPlayed: 0,
      gamesWon: 0,
      teamResult: "LOSS",
      consecutiveBenchWeeks: 2,
    }),
    {
      formChange: -1,
      formAfter: 7,
      moraleChange: -2,
      moraleAfter: 3,
    }
  );
});

test("mantiene forma e morale tra uno e dieci", () => {
  const result =
    calculateWeeklyPlayerCondition({
      currentForm: 10,
      currentMorale: 10,
      gamesPlayed: 3,
      gamesWon: 3,
      teamResult: "WIN",
      consecutiveBenchWeeks: 0,
    });

  assert.equal(result.formAfter, 10);
  assert.equal(result.moraleAfter, 10);
});
