-- CreateTable
CREATE TABLE "LeagueFixtureGame" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "specialty" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "targetPoints" INTEGER NOT NULL,
    "winnerSide" TEXT NOT NULL,
    "homePerformanceRating" DOUBLE PRECISION NOT NULL,
    "awayPerformanceRating" DOUBLE PRECISION NOT NULL,
    "homeWinProbability" DOUBLE PRECISION NOT NULL,
    "awayWinProbability" DOUBLE PRECISION NOT NULL,
    "randomValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueFixtureGame_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LeagueFixtureGame_order_check" CHECK ("order" BETWEEN 1 AND 6),
    CONSTRAINT "LeagueFixtureGame_specialty_check" CHECK ("specialty" IN ('ITALIANA', 'GORIZIANA', 'TUTTI_DOPPI')),
    CONSTRAINT "LeagueFixtureGame_gameType_check" CHECK ("gameType" IN ('SINGLES', 'DOUBLES')),
    CONSTRAINT "LeagueFixtureGame_winnerSide_check" CHECK ("winnerSide" IN ('HOME', 'AWAY')),
    CONSTRAINT "LeagueFixtureGame_targetPoints_check" CHECK ("targetPoints" > 0),
    CONSTRAINT "LeagueFixtureGame_homePerformanceRating_check" CHECK ("homePerformanceRating" BETWEEN 1 AND 100),
    CONSTRAINT "LeagueFixtureGame_awayPerformanceRating_check" CHECK ("awayPerformanceRating" BETWEEN 1 AND 100),
    CONSTRAINT "LeagueFixtureGame_homeWinProbability_check" CHECK ("homeWinProbability" BETWEEN 0 AND 100),
    CONSTRAINT "LeagueFixtureGame_awayWinProbability_check" CHECK ("awayWinProbability" BETWEEN 0 AND 100),
    CONSTRAINT "LeagueFixtureGame_randomValue_check" CHECK ("randomValue" BETWEEN 0 AND 1)
);

-- CreateTable
CREATE TABLE "PlayerFixtureAppearance" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "playerId" INTEGER,
    "clubId" INTEGER,
    "playerFirstName" TEXT NOT NULL,
    "playerLastName" TEXT NOT NULL,
    "playerNationality" TEXT NOT NULL,
    "playerAge" INTEGER NOT NULL,
    "clubName" TEXT NOT NULL,
    "opponentClubName" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "formationSlot" TEXT NOT NULL,
    "teamScore" INTEGER NOT NULL,
    "opponentScore" INTEGER NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "form" INTEGER NOT NULL,
    "morale" INTEGER NOT NULL,
    "experience" DOUBLE PRECISION NOT NULL,
    "performanceRating" DOUBLE PRECISION NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerFixtureAppearance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlayerFixtureAppearance_side_check" CHECK ("side" IN ('HOME', 'AWAY')),
    CONSTRAINT "PlayerFixtureAppearance_formationSlot_check" CHECK ("formationSlot" IN ('A', 'B', 'C')),
    CONSTRAINT "PlayerFixtureAppearance_score_check" CHECK ("teamScore" BETWEEN 0 AND 6 AND "opponentScore" BETWEEN 0 AND 6 AND "teamScore" + "opponentScore" = 6),
    CONSTRAINT "PlayerFixtureAppearance_overall_check" CHECK ("overall" BETWEEN 0 AND 100),
    CONSTRAINT "PlayerFixtureAppearance_form_check" CHECK ("form" BETWEEN 1 AND 10),
    CONSTRAINT "PlayerFixtureAppearance_morale_check" CHECK ("morale" BETWEEN 1 AND 10),
    CONSTRAINT "PlayerFixtureAppearance_experience_check" CHECK ("experience" BETWEEN 0 AND 100),
    CONSTRAINT "PlayerFixtureAppearance_performanceRating_check" CHECK ("performanceRating" BETWEEN 1 AND 100)
);

-- CreateTable
CREATE TABLE "PlayerGamePerformance" (
    "id" SERIAL NOT NULL,
    "fixtureGameId" INTEGER NOT NULL,
    "appearanceId" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "specialtyRating" DOUBLE PRECISION NOT NULL,
    "performanceRating" DOUBLE PRECISION NOT NULL,
    "formModifier" DOUBLE PRECISION NOT NULL,
    "moraleModifier" DOUBLE PRECISION NOT NULL,
    "experienceModifier" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerGamePerformance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlayerGamePerformance_result_check" CHECK ("result" IN ('WIN', 'LOSS')),
    CONSTRAINT "PlayerGamePerformance_specialtyRating_check" CHECK ("specialtyRating" BETWEEN 0 AND 100),
    CONSTRAINT "PlayerGamePerformance_performanceRating_check" CHECK ("performanceRating" BETWEEN 1 AND 100)
);

-- CreateIndex
CREATE UNIQUE INDEX "LeagueFixtureGame_fixtureId_order_key" ON "LeagueFixtureGame"("fixtureId", "order");

-- CreateIndex
CREATE INDEX "LeagueFixtureGame_fixtureId_idx" ON "LeagueFixtureGame"("fixtureId");

-- CreateIndex
CREATE INDEX "LeagueFixtureGame_specialty_idx" ON "LeagueFixtureGame"("specialty");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerFixtureAppearance_fixtureId_side_formationSlot_key" ON "PlayerFixtureAppearance"("fixtureId", "side", "formationSlot");

-- CreateIndex
CREATE INDEX "PlayerFixtureAppearance_fixtureId_idx" ON "PlayerFixtureAppearance"("fixtureId");

-- CreateIndex
CREATE INDEX "PlayerFixtureAppearance_playerId_idx" ON "PlayerFixtureAppearance"("playerId");

-- CreateIndex
CREATE INDEX "PlayerFixtureAppearance_clubId_idx" ON "PlayerFixtureAppearance"("clubId");

-- CreateIndex
CREATE INDEX "PlayerFixtureAppearance_playedAt_idx" ON "PlayerFixtureAppearance"("playedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGamePerformance_fixtureGameId_appearanceId_key" ON "PlayerGamePerformance"("fixtureGameId", "appearanceId");

-- CreateIndex
CREATE INDEX "PlayerGamePerformance_fixtureGameId_idx" ON "PlayerGamePerformance"("fixtureGameId");

-- CreateIndex
CREATE INDEX "PlayerGamePerformance_appearanceId_idx" ON "PlayerGamePerformance"("appearanceId");

-- CreateIndex
CREATE INDEX "PlayerGamePerformance_result_idx" ON "PlayerGamePerformance"("result");

-- AddForeignKey
ALTER TABLE "LeagueFixtureGame" ADD CONSTRAINT "LeagueFixtureGame_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "LeagueFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerFixtureAppearance" ADD CONSTRAINT "PlayerFixtureAppearance_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "LeagueFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerFixtureAppearance" ADD CONSTRAINT "PlayerFixtureAppearance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerFixtureAppearance" ADD CONSTRAINT "PlayerFixtureAppearance_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGamePerformance" ADD CONSTRAINT "PlayerGamePerformance_fixtureGameId_fkey" FOREIGN KEY ("fixtureGameId") REFERENCES "LeagueFixtureGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGamePerformance" ADD CONSTRAINT "PlayerGamePerformance_appearanceId_fkey" FOREIGN KEY ("appearanceId") REFERENCES "PlayerFixtureAppearance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
