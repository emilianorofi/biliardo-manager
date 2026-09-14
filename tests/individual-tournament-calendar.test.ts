import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIndividualTournamentCalendar,
  INDIVIDUAL_TOURNAMENT_DEFINITIONS,
} from "../lib/individual-tournament-calendar";
import { addRomeWeeks, getRomeParts } from "../lib/rome-calendar";

test("rimuove l'Europeo e sposta il Mondiale alla giornata quindici", () => {
  assert.deepEqual(
    INDIVIDUAL_TOURNAMENT_DEFINITIONS.map(
      (tournament) => tournament.type
    ),
    [
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "ITALIANA",
      "GORIZIANA",
      "TUTTI_DOPPI",
      "MONDIALE",
    ]
  );
  assert.equal(INDIVIDUAL_TOURNAMENT_DEFINITIONS.at(-1)?.leagueRound, 15);
});

test("programma sorteggio e turni nel fine settimana anche al cambio dell'ora", () => {
  const fridayAtNineInRome = new Date("2026-10-23T19:00:00.000Z");
  const calendar = buildIndividualTournamentCalendar(
    new Map(
      Array.from({ length: 15 }, (_, index) => [
        index + 1,
        new Date(
          fridayAtNineInRome.getTime() +
            index * 7 * 24 * 60 * 60 * 1000
        ),
      ])
    )
  );
  const firstTournament = calendar[0];

  assert.deepEqual(
    firstTournament.stages.map((stage) => ({
      label: stage.label,
      day: getRomeParts(stage.scheduledAt).day,
      hour: getRomeParts(stage.scheduledAt).hour,
    })),
    [
      { label: "Sorteggio", day: 24, hour: 10 },
      { label: "128esimi", day: 24, hour: 14 },
      { label: "64esimi", day: 24, hour: 16 },
      { label: "32esimi", day: 24, hour: 18 },
      { label: "16esimi", day: 24, hour: 20 },
      { label: "Ottavi", day: 25, hour: 10 },
      { label: "Quarti", day: 25, hour: 12 },
      { label: "Semifinali", day: 25, hour: 14 },
      { label: "Finale", day: 25, hour: 16 },
    ]
  );
});

test("calcola la settimana quindici dopo le quattordici giornate di campionato", () => {
  const firstLeagueFriday = new Date("2026-09-18T19:00:00.000Z");
  const roundDates = new Map(
    Array.from({ length: 14 }, (_, index) => [
      index + 1,
      addRomeWeeks(firstLeagueFriday, index),
    ])
  );
  const calendar = buildIndividualTournamentCalendar(roundDates);
  const worldChampionship = calendar.at(-1)!;

  assert.equal(worldChampionship.leagueRound, 15);
  assert.deepEqual(getRomeParts(worldChampionship.leagueDate), {
    year: 2026,
    month: 12,
    day: 25,
    hour: 21,
    minute: 0,
    second: 0,
  });
});
