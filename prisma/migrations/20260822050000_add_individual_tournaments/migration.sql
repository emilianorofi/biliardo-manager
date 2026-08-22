-- Conserva il calendario e lo stato di ogni torneo individuale stagionale.
CREATE TABLE "IndividualTournament" (
  "id" SERIAL NOT NULL,
  "seasonId" INTEGER NOT NULL,
  "leagueRound" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "currentStage" TEXT,
  "drawAt" TIMESTAMP(3) NOT NULL,
  "finalAt" TIMESTAMP(3) NOT NULL,
  "championPlayerId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "IndividualTournament_pkey" PRIMARY KEY ("id")
);

-- Fotografa i 256 qualificati e la loro posizione nel sorteggio.
CREATE TABLE "IndividualTournamentEntry" (
  "id" SERIAL NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "playerId" INTEGER NOT NULL,
  "rankingAtDraw" INTEGER NOT NULL,
  "overallAtDraw" DOUBLE PRECISION NOT NULL,
  "drawPosition" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "eliminatedStage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "IndividualTournamentEntry_pkey" PRIMARY KEY ("id")
);

-- Registra gli incontri del tabellone e il relativo punteggio al meglio delle tre.
CREATE TABLE "IndividualTournamentMatch" (
  "id" SERIAL NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "stage" TEXT NOT NULL,
  "stageOrder" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "playerOneId" INTEGER,
  "playerTwoId" INTEGER,
  "winnerPlayerId" INTEGER,
  "playerOneWins" INTEGER NOT NULL DEFAULT 0,
  "playerTwoWins" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "playedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "IndividualTournamentMatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IndividualTournament_seasonId_leagueRound_key"
ON "IndividualTournament"("seasonId", "leagueRound");

CREATE INDEX "IndividualTournament_seasonId_idx"
ON "IndividualTournament"("seasonId");

CREATE INDEX "IndividualTournament_status_idx"
ON "IndividualTournament"("status");

CREATE INDEX "IndividualTournament_drawAt_idx"
ON "IndividualTournament"("drawAt");

CREATE INDEX "IndividualTournament_finalAt_idx"
ON "IndividualTournament"("finalAt");

CREATE INDEX "IndividualTournament_championPlayerId_idx"
ON "IndividualTournament"("championPlayerId");

CREATE UNIQUE INDEX "IndividualTournamentEntry_tournamentId_playerId_key"
ON "IndividualTournamentEntry"("tournamentId", "playerId");

CREATE UNIQUE INDEX "IndividualTournamentEntry_tournamentId_drawPosition_key"
ON "IndividualTournamentEntry"("tournamentId", "drawPosition");

CREATE INDEX "IndividualTournamentEntry_tournamentId_idx"
ON "IndividualTournamentEntry"("tournamentId");

CREATE INDEX "IndividualTournamentEntry_playerId_idx"
ON "IndividualTournamentEntry"("playerId");

CREATE INDEX "IndividualTournamentEntry_status_idx"
ON "IndividualTournamentEntry"("status");

CREATE UNIQUE INDEX "IndividualTournamentMatch_tournamentId_stageOrder_position_key"
ON "IndividualTournamentMatch"("tournamentId", "stageOrder", "position");

CREATE INDEX "IndividualTournamentMatch_tournamentId_idx"
ON "IndividualTournamentMatch"("tournamentId");

CREATE INDEX "IndividualTournamentMatch_stageOrder_idx"
ON "IndividualTournamentMatch"("stageOrder");

CREATE INDEX "IndividualTournamentMatch_scheduledAt_idx"
ON "IndividualTournamentMatch"("scheduledAt");

CREATE INDEX "IndividualTournamentMatch_status_idx"
ON "IndividualTournamentMatch"("status");

CREATE INDEX "IndividualTournamentMatch_playerOneId_idx"
ON "IndividualTournamentMatch"("playerOneId");

CREATE INDEX "IndividualTournamentMatch_playerTwoId_idx"
ON "IndividualTournamentMatch"("playerTwoId");

CREATE INDEX "IndividualTournamentMatch_winnerPlayerId_idx"
ON "IndividualTournamentMatch"("winnerPlayerId");

ALTER TABLE "IndividualTournament"
ADD CONSTRAINT "IndividualTournament_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IndividualTournament"
ADD CONSTRAINT "IndividualTournament_championPlayerId_fkey"
FOREIGN KEY ("championPlayerId") REFERENCES "Player"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "IndividualTournamentEntry"
ADD CONSTRAINT "IndividualTournamentEntry_tournamentId_fkey"
FOREIGN KEY ("tournamentId") REFERENCES "IndividualTournament"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IndividualTournamentEntry"
ADD CONSTRAINT "IndividualTournamentEntry_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "IndividualTournamentMatch"
ADD CONSTRAINT "IndividualTournamentMatch_tournamentId_fkey"
FOREIGN KEY ("tournamentId") REFERENCES "IndividualTournament"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IndividualTournamentMatch"
ADD CONSTRAINT "IndividualTournamentMatch_playerOneId_fkey"
FOREIGN KEY ("playerOneId") REFERENCES "Player"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "IndividualTournamentMatch"
ADD CONSTRAINT "IndividualTournamentMatch_playerTwoId_fkey"
FOREIGN KEY ("playerTwoId") REFERENCES "Player"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "IndividualTournamentMatch"
ADD CONSTRAINT "IndividualTournamentMatch_winnerPlayerId_fkey"
FOREIGN KEY ("winnerPlayerId") REFERENCES "Player"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
