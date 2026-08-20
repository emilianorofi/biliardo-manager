import assert from "node:assert/strict";
import test from "node:test";

import {
  getCurrentRomeWeeklyWindow,
  getNextRomeWeeklyDate,
  getRomeParts,
  WEEKLY_UPDATE_EVENT,
} from "../lib/rome-calendar";

test("mantiene il lunedì alle dodici anche con il cambio dell'ora", () => {
  const next = getNextRomeWeeklyDate(
    new Date("2026-10-24T10:00:00.000Z"),
    WEEKLY_UPDATE_EVENT
  );

  assert.deepEqual(
    getRomeParts(next),
    {
      year: 2026,
      month: 10,
      day: 26,
      hour: 12,
      minute: 0,
      second: 0,
    }
  );
});

test("la finestra settimanale termina il lunedì a mezzogiorno", () => {
  const window =
    getCurrentRomeWeeklyWindow(
      new Date(
        "2026-08-23T12:00:00.000Z"
      )
    );

  assert.equal(
    window.start.toISOString(),
    "2026-08-17T10:00:00.000Z"
  );
  assert.equal(
    window.end.toISOString(),
    "2026-08-24T10:00:00.000Z"
  );
});
