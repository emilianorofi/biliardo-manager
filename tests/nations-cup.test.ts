import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNationsCupGroupFixtures,
  buildNationsCupQuarterFinals,
  calculateNationsCupStandings,
  resolveNationsCupKnockoutTie,
  selectNationsCupTeams,
} from "../lib/nations-cup";
import { buildNationsCupCalendar } from "../lib/nations-cup-calendar";
import { getRomeParts } from "../lib/rome-calendar";
import { WORLD_NATIONALITY_ALLOCATION } from "../lib/world-structure";

const attributeNames = [
  "precisione", "diretto", "sponde", "tattica", "mentalita",
  "difesa", "realizzazione", "creativita", "misura",
] as const;

type TestPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  form: number;
  morale: number;
  experience: number;
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
};

function player(id: number, nationality: string, strength: number): TestPlayer {
  return {
    id, firstName: `Nome${id}`, lastName: `Cognome${id}`, nationality,
    form: 5, morale: 5, experience: 50,
    ...Object.fromEntries(attributeNames.map((name) => [name, strength])),
  } as TestPlayer;
}

test("garantisce almeno sedici nazioni con tre giocatori iniziali", () => {
  assert.ok(
    WORLD_NATIONALITY_ALLOCATION.filter((nation) => nation.count >= 3).length >= 16
  );
  assert.equal(
    WORLD_NATIONALITY_ALLOCATION.reduce((sum, nation) => sum + nation.count, 0),
    600
  );
});

test("convoca i migliori tre giocatori delle migliori sedici nazioni", () => {
  const eligibleNations = WORLD_NATIONALITY_ALLOCATION.slice(0, 16);
  const players = eligibleNations.flatMap((nation, nationIndex) =>
    Array.from({ length: 4 }, (_, playerIndex) =>
      player(nationIndex * 10 + playerIndex + 1, nation.flag, 90 - nationIndex - playerIndex)
    )
  );
  const teams = selectNationsCupTeams(players);

  assert.equal(teams.length, 16);
  assert.ok(teams.every((team) => team.players.length === 3));
  assert.deepEqual(teams.map((team) => team.group), [
    "A", "B", "C", "D", "A", "B", "C", "D",
    "A", "B", "C", "D", "A", "B", "C", "D",
  ]);
});

test("crea quattro gironi con sei incontri e tre giornate ciascuno", () => {
  const teams = Array.from({ length: 16 }, (_, index) => ({
    seed: index + 1,
    group: (["A", "B", "C", "D"] as const)[index % 4],
  }));
  const fixtures = buildNationsCupGroupFixtures(teams);

  assert.equal(fixtures.length, 24);
  for (const group of ["A", "B", "C", "D"] as const) {
    const groupFixtures = fixtures.filter((fixture) => fixture.group === group);
    assert.equal(groupFixtures.length, 6);
    assert.deepEqual(new Set(groupFixtures.map((fixture) => fixture.matchday)), new Set([1, 2, 3]));
  }
});

test("il 3-3 assegna tre punti nel girone come in campionato", () => {
  const standings = calculateNationsCupStandings(
    [{ seed: 1 }, { seed: 2 }, { seed: 3 }, { seed: 4 }],
    [
      { homeSeed: 1, awaySeed: 2, homeScore: 3, awayScore: 3 },
      { homeSeed: 3, awaySeed: 4, homeScore: 4, awayScore: 2 },
    ]
  );
  assert.equal(standings.find((entry) => entry.seed === 1)?.points, 3);
  assert.equal(standings[0].seed, 3);

  assert.deepEqual(
    buildNationsCupQuarterFinals({ A: [1, 5], B: [2, 6], C: [3, 7], D: [4, 8] }),
    [
      { position: 1, homeSeed: 1, awaySeed: 6 },
      { position: 2, homeSeed: 2, awaySeed: 5 },
      { position: 3, homeSeed: 3, awaySeed: 8 },
      { position: 4, homeSeed: 4, awaySeed: 7 },
    ]
  );
});

test("dal quarto in poi il 3-3 viene deciso dai migliori giocatori", () => {
  const teams = selectNationsCupTeams(
    WORLD_NATIONALITY_ALLOCATION.slice(0, 16).flatMap((nation, nationIndex) =>
      Array.from({ length: 3 }, (_, playerIndex) =>
        player(nationIndex * 10 + playerIndex + 1, nation.flag, 90 - nationIndex - playerIndex)
      )
    )
  );
  const tieBreak = resolveNationsCupKnockoutTie(teams[0], teams[1], 0.99, 0);

  assert.equal(tieBreak.specialty, "TUTTI_DOPPI");
  assert.equal(tieBreak.homePlayerId, teams[0].players[0].player.id);
  assert.equal(tieBreak.awayPlayerId, teams[1].players[0].player.id);
  assert.ok([teams[0].seed, teams[1].seed].includes(tieBreak.winnerSeed));
});

test("concentra gironi al sabato ed eliminazione diretta alla domenica", () => {
  const friday = new Date("2026-10-23T19:00:00.000Z");
  const calendar = buildNationsCupCalendar(new Map([[7, friday]]));
  assert.deepEqual(
    calendar.stages.map((stage) => ({ label: stage.label, day: getRomeParts(stage.scheduledAt).day, hour: getRomeParts(stage.scheduledAt).hour })),
    [
      { label: "Sorteggio", day: 24, hour: 9 },
      { label: "1ª giornata gironi", day: 24, hour: 10 },
      { label: "2ª giornata gironi", day: 24, hour: 14 },
      { label: "3ª giornata gironi", day: 24, hour: 18 },
      { label: "Quarti", day: 25, hour: 10 },
      { label: "Semifinali", day: 25, hour: 14 },
      { label: "Finale", day: 25, hour: 18 },
    ]
  );
});
