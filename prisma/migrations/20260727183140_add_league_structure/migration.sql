-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREPARATION',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "groupCode" TEXT NOT NULL DEFAULT 'A',
    "status" TEXT NOT NULL DEFAULT 'PREPARATION',
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueEntry" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "pointsFor" INTEGER NOT NULL DEFAULT 0,
    "pointsAgainst" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueFixture" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "homeClubId" INTEGER NOT NULL,
    "awayClubId" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "playedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueFixture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_number_key" ON "Season"("number");

-- CreateIndex
CREATE INDEX "League_seasonId_idx" ON "League"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "League_seasonId_level_groupCode_key" ON "League"("seasonId", "level", "groupCode");

-- CreateIndex
CREATE INDEX "LeagueEntry_leagueId_idx" ON "LeagueEntry"("leagueId");

-- CreateIndex
CREATE INDEX "LeagueEntry_clubId_idx" ON "LeagueEntry"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueEntry_leagueId_clubId_key" ON "LeagueEntry"("leagueId", "clubId");

-- CreateIndex
CREATE INDEX "LeagueFixture_leagueId_idx" ON "LeagueFixture"("leagueId");

-- CreateIndex
CREATE INDEX "LeagueFixture_round_idx" ON "LeagueFixture"("round");

-- CreateIndex
CREATE INDEX "LeagueFixture_homeClubId_idx" ON "LeagueFixture"("homeClubId");

-- CreateIndex
CREATE INDEX "LeagueFixture_awayClubId_idx" ON "LeagueFixture"("awayClubId");

-- CreateIndex
CREATE INDEX "LeagueFixture_scheduledAt_idx" ON "LeagueFixture"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueFixture_leagueId_round_homeClubId_awayClubId_key" ON "LeagueFixture"("leagueId", "round", "homeClubId", "awayClubId");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueEntry" ADD CONSTRAINT "LeagueEntry_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueEntry" ADD CONSTRAINT "LeagueEntry_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueFixture" ADD CONSTRAINT "LeagueFixture_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueFixture" ADD CONSTRAINT "LeagueFixture_homeClubId_fkey" FOREIGN KEY ("homeClubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueFixture" ADD CONSTRAINT "LeagueFixture_awayClubId_fkey" FOREIGN KEY ("awayClubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
