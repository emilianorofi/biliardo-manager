ALTER TABLE "Player"
  DROP CONSTRAINT IF EXISTS "Player_retirement_state_check",
  DROP CONSTRAINT IF EXISTS "Player_careerStatus_check";

ALTER TABLE "Player"
  ADD CONSTRAINT "Player_careerStatus_check"
  CHECK ("careerStatus" IN ('ACTIVE', 'RETIRED', 'REMOVED')),
  ADD CONSTRAINT "Player_retirement_state_check"
  CHECK (
    (
      "careerStatus" = 'ACTIVE'
      AND "retiredAt" IS NULL
      AND "retirementSeasonId" IS NULL
    )
    OR
    (
      "careerStatus" = 'RETIRED'
      AND "retiredAt" IS NOT NULL
      AND "retirementSeasonId" IS NOT NULL
      AND "clubId" IS NULL
    )
    OR
    (
      "careerStatus" = 'REMOVED'
      AND "retiredAt" IS NULL
      AND "retirementSeasonId" IS NULL
      AND "clubId" IS NULL
    )
  );
