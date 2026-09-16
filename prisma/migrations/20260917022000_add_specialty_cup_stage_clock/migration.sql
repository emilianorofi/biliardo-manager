ALTER TABLE "SpecialtyCupTournament"
ADD COLUMN "nextStageAt" TIMESTAMP(3),
ADD COLUMN "currentStageOrder" INTEGER;

CREATE INDEX "SpecialtyCupTournament_status_nextStageAt_idx"
ON "SpecialtyCupTournament"("status", "nextStageAt");
