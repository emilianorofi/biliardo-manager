import assert from "node:assert/strict";
import test from "node:test";

import { limitClubRetirements } from "../lib/roster-integrity";

test("non porta un club sotto tre giocatori attivi", () => {
  const players = [
    { id: 1, clubId: 10 },
    { id: 2, clubId: 10 },
    { id: 3, clubId: 10 },
    { id: 4, clubId: 10 },
    { id: 5, clubId: 10 },
    { id: 6, clubId: 10 },
  ];

  const accepted = limitClubRetirements(players, players.slice(0, 5));

  assert.deepEqual(
    accepted.map((player) => player.id),
    [1, 2, 3]
  );
});

test("non autorizza ritiri in un club gia fermo a tre giocatori", () => {
  const players = [
    { id: 1, clubId: 10 },
    { id: 2, clubId: 10 },
    { id: 3, clubId: 10 },
  ];

  assert.equal(limitClubRetirements(players, players).length, 0);
});

test("gli svincolati non sono soggetti al minimo rosa del club", () => {
  const players = [
    { id: 1, clubId: null },
    { id: 2, clubId: null },
  ];

  assert.equal(limitClubRetirements(players, players).length, 2);
});
