import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

test("rimuove la vecchia rosa conservandone lo storico", () => {
  const source = readFileSync(
    path.join(process.cwd(), "app", "onboarding", "actions.ts"),
    "utf8"
  );
  const takeover = source.slice(
    source.indexOf("async function replaceAiClub"),
    source.indexOf("function validateClubIdentity")
  );

  assert.match(takeover, /transferListing\.deleteMany/);
  assert.match(takeover, /player\.updateMany/);
  assert.match(takeover, /careerStatus:\s*"REMOVED"/);
  assert.match(takeover, /status:\s*"WITHDRAWN"/);
  assert.match(takeover, /planIndividualTournamentRosterReplacements/);
  assert.doesNotMatch(takeover, /individualTournamentEntry\.deleteMany/);
  assert.doesNotMatch(takeover, /player\.deleteMany/);
  assert.doesNotMatch(takeover, /listingType:\s*"FREE_AGENT"/);
});
