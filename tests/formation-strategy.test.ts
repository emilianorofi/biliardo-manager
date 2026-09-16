import assert from "node:assert/strict";
import test from "node:test";

import {
  parseFormationStrategy,
  sanitizeFormationStrategy,
} from "../lib/formation-strategy";

test("accetta fino a tre riserve diverse e tre cambi programmati", () => {
  const result = parseFormationStrategy({
    starterPlayerIds: [1, 2, 3],
    reservesInput: { R1: 4, R2: 5, R3: 6 },
    substitutionsInput: [
      { afterGame: 1, slot: "A", reserveSlot: "R1" },
      { afterGame: 3, slot: "B", reserveSlot: "R2" },
      { afterGame: 5, slot: "C", reserveSlot: "R3" },
    ],
    validPlayerIds: new Set([1, 2, 3, 4, 5, 6]),
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.strategy.substitutions.length, 3);
  assert.deepEqual(result.strategy.reserves, {
    R1: 4,
    R2: 5,
    R3: 6,
  });
});

test("impedisce che un titolare sia anche riserva", () => {
  const result = parseFormationStrategy({
    starterPlayerIds: [1, 2, 3],
    reservesInput: { R1: 1, R2: null, R3: null },
    substitutionsInput: [],
  });

  assert.equal(result.ok, false);
});

test("impedisce di usare la stessa riserva in due cambi", () => {
  const result = parseFormationStrategy({
    starterPlayerIds: [1, 2, 3],
    reservesInput: { R1: 4, R2: null, R3: null },
    substitutionsInput: [
      { afterGame: 1, slot: "A", reserveSlot: "R1" },
      { afterGame: 3, slot: "B", reserveSlot: "R1" },
    ],
  });

  assert.equal(result.ok, false);
});

test("rimuove automaticamente riserve non piu attive", () => {
  const strategy = sanitizeFormationStrategy(
    {
      reserves: { R1: 4, R2: 5, R3: null },
      substitutions: [
        { afterGame: 1, slot: "A", reserveSlot: "R1" },
        { afterGame: 3, slot: "B", reserveSlot: "R2" },
      ],
    },
    [1, 2, 3],
    new Set([1, 2, 3, 5])
  );

  assert.equal(strategy.reserves.R1, null);
  assert.equal(strategy.reserves.R2, 5);
  assert.deepEqual(strategy.substitutions, [
    { afterGame: 3, slot: "B", reserveSlot: "R2" },
  ]);
});
