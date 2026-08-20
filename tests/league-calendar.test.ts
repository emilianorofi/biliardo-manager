import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWeeklyRoundDates,
  getNextLeagueDate,
} from "../lib/league-calendar";

test("programma una sola giornata ogni sette giorni", () => {
  const reference =
    new Date(2026, 7, 24, 10, 0, 0);
  const firstRound =
    getNextLeagueDate(reference);
  const dates =
    buildWeeklyRoundDates(
      firstRound,
      14
    );

  assert.equal(firstRound.getDay(), 2);
  assert.equal(firstRound.getHours(), 16);
  assert.equal(dates.length, 14);

  for (
    let index = 0;
    index < dates.length;
    index += 1
  ) {
    const expected =
      new Date(firstRound);

    expected.setDate(
      firstRound.getDate() +
        index * 7
    );

    assert.equal(
      dates[index].getTime(),
      expected.getTime()
    );
    assert.equal(
      dates[index].getDay(),
      2
    );
    assert.equal(
      dates[index].getHours(),
      16
    );
  }
});
