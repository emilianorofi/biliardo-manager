CREATE TABLE "SpecialtyCupTournament" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "leagueRound" INTEGER NOT NULL DEFAULT 14,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "drawAt" TIMESTAMP(3) NOT NULL,
    "drawnAt" TIMESTAMP(3),
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialtyCupTournament_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpecialtyCupTournament_seasonId_key"
ON "SpecialtyCupTournament"("seasonId");

CREATE INDEX "SpecialtyCupTournament_status_drawAt_idx"
ON "SpecialtyCupTournament"("status", "drawAt");

ALTER TABLE "SpecialtyCupTournament"
ADD CONSTRAINT "SpecialtyCupTournament_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
