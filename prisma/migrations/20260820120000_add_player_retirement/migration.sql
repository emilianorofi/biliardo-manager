ALTER TABLE "Player"
ADD COLUMN "careerStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "retiredAt" TIMESTAMP(3),
ADD COLUMN "retirementSeasonId" INTEGER;

ALTER TABLE "Player"
ADD CONSTRAINT "Player_careerStatus_check"
CHECK ("careerStatus" IN ('ACTIVE', 'RETIRED'));

ALTER TABLE "Player"
ADD CONSTRAINT "Player_retirement_state_check"
CHECK (
  ("careerStatus" = 'ACTIVE' AND "retiredAt" IS NULL AND "retirementSeasonId" IS NULL)
  OR
  (
    "careerStatus" = 'RETIRED'
    AND "retiredAt" IS NOT NULL
    AND "retirementSeasonId" IS NOT NULL
    AND "clubId" IS NULL
  )
);

CREATE INDEX "Player_careerStatus_idx"
ON "Player"("careerStatus");

CREATE INDEX "Player_retirementSeasonId_idx"
ON "Player"("retirementSeasonId");

ALTER TABLE "Player"
ADD CONSTRAINT "Player_retirementSeasonId_fkey"
FOREIGN KEY ("retirementSeasonId") REFERENCES "Season"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
