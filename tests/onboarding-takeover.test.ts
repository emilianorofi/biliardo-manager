import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

test("elimina la vecchia rosa quando un utente prende un club IA", () => {
  const source = readFileSync(
    path.join(process.cwd(), "app", "onboarding", "actions.ts"),
    "utf8"
  );
  const takeover = source.slice(
    source.indexOf("async function replaceAiClub"),
    source.indexOf("function validateClubIdentity")
  );

  assert.match(takeover, /transferListing\.deleteMany/);
  assert.match(takeover, /individualTournamentEntry\.deleteMany/);
  assert.match(takeover, /player\.deleteMany/);
  assert.doesNotMatch(takeover, /player\.updateMany/);
  assert.doesNotMatch(takeover, /listingType:\s*"FREE_AGENT"/);
});
