CREATE TABLE "NationsCupTournament" (
  "id" SERIAL NOT NULL,
  "seasonId" INTEGER NOT NULL,
  "leagueRound" INTEGER NOT NULL DEFAULT 7,
  "name" TEXT NOT NULL DEFAULT 'Coppa delle Nazioni',
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "currentStage" TEXT,
  "drawAt" TIMESTAMP(3) NOT NULL,
  "finalAt" TIMESTAMP(3) NOT NULL,
  "championCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NationsCupTournament_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "NationsCupEntry" (
  "id" SERIAL NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "nationCode" TEXT NOT NULL,
  "nationName" TEXT NOT NULL,
  "nationFlag" TEXT NOT NULL,
  "seed" INTEGER NOT NULL,
  "groupCode" TEXT NOT NULL,
  "rankingTotal" INTEGER NOT NULL,
  "firstPlayerId" INTEGER NOT NULL,
  "secondPlayerId" INTEGER NOT NULL,
  "thirdPlayerId" INTEGER NOT NULL,
  "played" INTEGER NOT NULL DEFAULT 0,
  "won" INTEGER NOT NULL DEFAULT 0,
  "drawn" INTEGER NOT NULL DEFAULT 0,
  "lost" INTEGER NOT NULL DEFAULT 0,
  "pointsFor" INTEGER NOT NULL DEFAULT 0,
  "pointsAgainst" INTEGER NOT NULL DEFAULT 0,
  "points" INTEGER NOT NULL DEFAULT 0,
  "eliminatedStage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NationsCupEntry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "NationsCupMatch" (
  "id" SERIAL NOT NULL,
  "tournamentId" INTEGER NOT NULL,
  "stage" TEXT NOT NULL,
  "stageOrder" INTEGER NOT NULL,
  "groupCode" TEXT,
  "position" INTEGER NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "homeEntryId" INTEGER NOT NULL,
  "awayEntryId" INTEGER NOT NULL,
  "winnerEntryId" INTEGER,
  "homeScore" INTEGER,
  "awayScore" INTEGER,
  "tieBreakSpecialty" TEXT,
  "tieBreakHomePlayerId" INTEGER,
  "tieBreakAwayPlayerId" INTEGER,
  "tieBreakWinnerPlayerId" INTEGER,
  "games" JSONB,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "playedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NationsCupMatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NationsCupTournament_seasonId_key" ON "NationsCupTournament"("seasonId");
CREATE INDEX "NationsCupTournament_status_idx" ON "NationsCupTournament"("status");
CREATE INDEX "NationsCupTournament_drawAt_idx" ON "NationsCupTournament"("drawAt");
CREATE INDEX "NationsCupTournament_finalAt_idx" ON "NationsCupTournament"("finalAt");
CREATE UNIQUE INDEX "NationsCupEntry_tournamentId_nationCode_key" ON "NationsCupEntry"("tournamentId", "nationCode");
CREATE UNIQUE INDEX "NationsCupEntry_tournamentId_seed_key" ON "NationsCupEntry"("tournamentId", "seed");
CREATE INDEX "NationsCupEntry_tournamentId_groupCode_idx" ON "NationsCupEntry"("tournamentId", "groupCode");
CREATE UNIQUE INDEX "NationsCupMatch_tournamentId_stageOrder_position_key" ON "NationsCupMatch"("tournamentId", "stageOrder", "position");
CREATE INDEX "NationsCupMatch_tournamentId_idx" ON "NationsCupMatch"("tournamentId");
CREATE INDEX "NationsCupMatch_stageOrder_idx" ON "NationsCupMatch"("stageOrder");
CREATE INDEX "NationsCupMatch_scheduledAt_idx" ON "NationsCupMatch"("scheduledAt");
CREATE INDEX "NationsCupMatch_status_idx" ON "NationsCupMatch"("status");
ALTER TABLE "NationsCupTournament" ADD CONSTRAINT "NationsCupTournament_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NationsCupEntry" ADD CONSTRAINT "NationsCupEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "NationsCupTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NationsCupEntry" ADD CONSTRAINT "NationsCupEntry_firstPlayerId_fkey" FOREIGN KEY ("firstPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NationsCupEntry" ADD CONSTRAINT "NationsCupEntry_secondPlayerId_fkey" FOREIGN KEY ("secondPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NationsCupEntry" ADD CONSTRAINT "NationsCupEntry_thirdPlayerId_fkey" FOREIGN KEY ("thirdPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "NationsCupTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_homeEntryId_fkey" FOREIGN KEY ("homeEntryId") REFERENCES "NationsCupEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_awayEntryId_fkey" FOREIGN KEY ("awayEntryId") REFERENCES "NationsCupEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_winnerEntryId_fkey" FOREIGN KEY ("winnerEntryId") REFERENCES "NationsCupEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_tieBreakHomePlayerId_fkey" FOREIGN KEY ("tieBreakHomePlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_tieBreakAwayPlayerId_fkey" FOREIGN KEY ("tieBreakAwayPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NationsCupMatch" ADD CONSTRAINT "NationsCupMatch_tieBreakWinnerPlayerId_fkey" FOREIGN KEY ("tieBreakWinnerPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
