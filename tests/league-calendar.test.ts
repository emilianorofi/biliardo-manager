import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWeeklyRoundDates,
  getNextLeagueDate,
} from "../lib/league-calendar";
import {
  getRomeParts,
} from "../lib/rome-calendar";

test("programma una sola giornata ogni sette giorni", () => {
  const reference =
    new Date("2026-08-20T10:00:00.000Z");
  const firstRound =
    getNextLeagueDate(reference);
  const dates =
    buildWeeklyRoundDates(
      firstRound,
      14
    );

  assert.deepEqual(
    getRomeParts(firstRound),
    {
      year: 2026,
      month: 8,
      day: 21,
      hour: 21,
      minute: 0,
      second: 0,
    }
  );
  assert.equal(dates.length, 14);

  for (
    let index = 0;
    index < dates.length;
    index += 1
  ) {
    const local =
      getRomeParts(dates[index]);
    const localDate = new Date(
      Date.UTC(
        local.year,
        local.month - 1,
        local.day
      )
    );
    const expectedLocalDate =
      new Date(
        Date.UTC(2026, 7, 21)
      );

    expectedLocalDate.setUTCDate(
      expectedLocalDate.getUTCDate() +
        index * 7
    );

    assert.equal(
      localDate.getTime(),
      expectedLocalDate.getTime()
    );
    assert.equal(
      localDate.getUTCDay(),
      5
    );
    assert.equal(local.hour, 21);
    assert.equal(local.minute, 0);
  }
});
