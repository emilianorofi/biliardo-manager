import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIndividualTournamentCalendar,
  INDIVIDUAL_TOURNAMENT_DEFINITIONS,
} from "../lib/individual-tournament-calendar";
import { buildNationsCupCalendar } from "../lib/nations-cup-calendar";
import { buildSpecialtyCupCalendar } from "../lib/specialty-cup-calendar";
import {
  ACADEMY_EVENT,
  addRomeWeeks,
  getRomeParts,
  LEAGUE_EVENT,
  WEEKLY_UPDATE_EVENT,
} from "../lib/rome-calendar";

function seasonRoundDates() {
  const firstLeagueFriday = new Date("2026-09-18T19:00:00.000Z");
  return new Map(
    Array.from({ length: 14 }, (_, index) => [
      index + 1,
      addRomeWeeks(firstLeagueFriday, index),
    ])
  );
}

test("copre tutte le settimane 1-15 con una competizione weekend e senza sovrapposizioni", () => {
  const roundDates = seasonRoundDates();
  const individual = buildIndividualTournamentCalendar(roundDates);
  const nations = buildNationsCupCalendar(roundDates);
  const specialty = buildSpecialtyCupCalendar(roundDates);

  const competitionByWeek = new Map<number, string>();
  for (const tournament of individual) {
    assert.equal(competitionByWeek.has(tournament.leagueRound), false);
    competitionByWeek.set(tournament.leagueRound, tournament.type);
  }
  assert.equal(competitionByWeek.has(nations.leagueRound), false);
  competitionByWeek.set(nations.leagueRound, "NATIONS_CUP");
  assert.equal(competitionByWeek.has(specialty.seasonWeek), false);
  competitionByWeek.set(specialty.seasonWeek, "SPECIALTY_CUP");

  assert.deepEqual(
    Array.from({ length: 15 }, (_, index) => competitionByWeek.get(index + 1)),
    [
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "NATIONS_CUP",
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "SPECIALTY_CUP",
      "MONDIALE",
    ]
  );
});

test("mantiene gli eventi settimanali fissi negli orari approvati", () => {
  assert.deepEqual(WEEKLY_UPDATE_EVENT, { weekday: 1, hour: 12, minute: 0 });
  assert.deepEqual(ACADEMY_EVENT, { weekday: 2, hour: 21, minute: 0 });
  assert.deepEqual(LEAGUE_EVENT, { weekday: 5, hour: 21, minute: 0 });
});

test("riserva la settimana 7 alla Coppa Nazioni e la 14 alla Coppa Specialità", () => {
  const roundDates = seasonRoundDates();
  const nations = buildNationsCupCalendar(roundDates);
  const specialty = buildSpecialtyCupCalendar(roundDates);

  assert.equal(nations.leagueRound, 7);
  assert.deepEqual(
    nations.stages.map((stage) => [stage.key, getRomeParts(stage.scheduledAt).hour]),
    [
      ["DRAW", 9],
      ["GROUP_1", 10],
      ["GROUP_2", 14],
      ["GROUP_3", 18],
      ["QUARTER_FINAL", 10],
      ["SEMI_FINAL", 14],
      ["FINAL", 18],
    ]
  );

  assert.equal(specialty.seasonWeek, 14);
  assert.equal(getRomeParts(specialty.drawAt).hour, 10);
});

test("lascia fuori dagli individuali le settimane 7 e 14 e usa la 15 solo per il Mondiale", () => {
  const weeks = INDIVIDUAL_TOURNAMENT_DEFINITIONS.map((item) => item.leagueRound);
  assert.equal(weeks.includes(7), false);
  assert.equal(weeks.includes(14), false);
  assert.equal(weeks.filter((week) => week === 15).length, 1);
  assert.equal(INDIVIDUAL_TOURNAMENT_DEFINITIONS.at(-1)?.type, "MONDIALE");
});
