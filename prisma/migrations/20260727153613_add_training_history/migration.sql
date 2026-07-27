-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "weekKey" TEXT NOT NULL,
    "primaryFocus" TEXT NOT NULL,
    "secondaryFocus" TEXT NOT NULL,
    "trainerLevel" INTEGER NOT NULL,
    "trainerEfficiency" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "playerId" INTEGER,
    "playerFirstName" TEXT NOT NULL,
    "playerLastName" TEXT NOT NULL,
    "playerAge" INTEGER NOT NULL,
    "usage" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "primaryBefore" DOUBLE PRECISION NOT NULL,
    "primaryGain" DOUBLE PRECISION NOT NULL,
    "primaryAfter" DOUBLE PRECISION NOT NULL,
    "secondaryBefore" DOUBLE PRECISION NOT NULL,
    "secondaryGain" DOUBLE PRECISION NOT NULL,
    "secondaryAfter" DOUBLE PRECISION NOT NULL,
    "overallBefore" DOUBLE PRECISION NOT NULL,
    "overallAfter" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSession_clubId_idx" ON "TrainingSession"("clubId");

-- CreateIndex
CREATE INDEX "TrainingSession_processedAt_idx" ON "TrainingSession"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSession_clubId_weekKey_key" ON "TrainingSession"("clubId", "weekKey");

-- CreateIndex
CREATE INDEX "TrainingResult_sessionId_idx" ON "TrainingResult"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingResult_playerId_idx" ON "TrainingResult"("playerId");

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingResult" ADD CONSTRAINT "TrainingResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingResult" ADD CONSTRAINT "TrainingResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
