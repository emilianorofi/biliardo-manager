-- Estende lo storico dell'allenamento all'aggiornamento completo del giocatore.
ALTER TABLE "TrainingResult"
ADD COLUMN "experienceBefore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "experienceGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "experienceAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "formBefore" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "formChange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "formAfter" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "moraleBefore" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "moraleChange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "moraleAfter" INTEGER NOT NULL DEFAULT 5;

-- Registra il prossimo aggiornamento automatico di ogni club.
ALTER TABLE "Club"
ADD COLUMN "nextWeeklyUpdateAt" TIMESTAMP(3);

-- Conserva il riepilogo economico e impedisce doppi aggiornamenti settimanali.
CREATE TABLE "ClubWeeklyUpdate" (
  "id" SERIAL NOT NULL,
  "clubId" INTEGER NOT NULL,
  "weekKey" TEXT NOT NULL,
  "income" INTEGER NOT NULL,
  "expenses" INTEGER NOT NULL,
  "netResult" INTEGER NOT NULL,
  "balanceBefore" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL,
  "newsScheduledAt" TIMESTAMP(3) NOT NULL,
  "newsPublishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClubWeeklyUpdate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClubWeeklyUpdate_clubId_weekKey_key"
ON "ClubWeeklyUpdate"("clubId", "weekKey");

CREATE INDEX "ClubWeeklyUpdate_clubId_idx"
ON "ClubWeeklyUpdate"("clubId");

CREATE INDEX "ClubWeeklyUpdate_scheduledAt_idx"
ON "ClubWeeklyUpdate"("scheduledAt");

CREATE INDEX "ClubWeeklyUpdate_newsScheduledAt_idx"
ON "ClubWeeklyUpdate"("newsScheduledAt");

ALTER TABLE "ClubWeeklyUpdate"
ADD CONSTRAINT "ClubWeeklyUpdate_clubId_fkey"
FOREIGN KEY ("clubId") REFERENCES "Club"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Calcola i prossimi appuntamenti nel fuso Europe/Rome e li salva in UTC.
WITH "LocalClock" AS (
  SELECT
    CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Rome' AS "localNow"
),
"LocalEvents" AS (
  SELECT
    "localNow",
    DATE_TRUNC('week', "localNow") + INTERVAL '12 hours' AS "mondayUpdate",
    DATE_TRUNC('week', "localNow") + INTERVAL '1 day 21 hours' AS "tuesdayAcademy",
    DATE_TRUNC('week', "localNow") + INTERVAL '4 days 21 hours' AS "fridayLeague"
  FROM "LocalClock"
),
"NextEvents" AS (
  SELECT
    (
      CASE
        WHEN "mondayUpdate" <= "localNow" THEN "mondayUpdate" + INTERVAL '7 days'
        ELSE "mondayUpdate"
      END AT TIME ZONE 'Europe/Rome'
    ) AT TIME ZONE 'UTC' AS "weeklyUpdateAt",
    (
      CASE
        WHEN "tuesdayAcademy" <= "localNow" THEN "tuesdayAcademy" + INTERVAL '7 days'
        ELSE "tuesdayAcademy"
      END AT TIME ZONE 'Europe/Rome'
    ) AT TIME ZONE 'UTC' AS "academyAt",
    (
      CASE
        WHEN "fridayLeague" <= "localNow" THEN "fridayLeague" + INTERVAL '7 days'
        ELSE "fridayLeague"
      END AT TIME ZONE 'Europe/Rome'
    ) AT TIME ZONE 'UTC' AS "leagueAt"
  FROM "LocalEvents"
)
UPDATE "Club"
SET
  "nextWeeklyUpdateAt" = "NextEvents"."weeklyUpdateAt",
  "nextAcademyCandidateAt" = CASE
    WHEN "Club"."academyInitialized" = TRUE
      OR "Club"."nextAcademyCandidateAt" IS NOT NULL
    THEN "NextEvents"."academyAt"
    ELSE NULL
  END
FROM "NextEvents";

WITH "LocalClock" AS (
  SELECT
    CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Rome' AS "localNow"
),
"AcademyEvent" AS (
  SELECT
    (
      CASE
        WHEN DATE_TRUNC('week', "localNow") + INTERVAL '1 day 21 hours' <= "localNow"
        THEN DATE_TRUNC('week', "localNow") + INTERVAL '8 days 21 hours'
        ELSE DATE_TRUNC('week', "localNow") + INTERVAL '1 day 21 hours'
      END AT TIME ZONE 'Europe/Rome'
    ) AT TIME ZONE 'UTC' AS "academyAt"
  FROM "LocalClock"
)
UPDATE "AcademyPlayer"
SET "nextScoutingAt" = "AcademyEvent"."academyAt"
FROM "AcademyEvent"
WHERE "AcademyPlayer"."nextScoutingAt" IS NOT NULL;

-- Riparte dalla prossima giornata del venerdì e mantiene una cadenza di sette giorni.
WITH "LocalClock" AS (
  SELECT
    CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Rome' AS "localNow"
),
"LeagueEvent" AS (
  SELECT
    (
      CASE
        WHEN DATE_TRUNC('week', "localNow") + INTERVAL '4 days 21 hours' <= "localNow"
        THEN DATE_TRUNC('week', "localNow") + INTERVAL '11 days 21 hours'
        ELSE DATE_TRUNC('week', "localNow") + INTERVAL '4 days 21 hours'
      END AT TIME ZONE 'Europe/Rome'
    ) AT TIME ZONE 'UTC' AS "firstLeagueAt"
  FROM "LocalClock"
),
"ScheduledRounds" AS (
  SELECT DISTINCT
    "leagueId",
    "round"
  FROM "LeagueFixture"
  WHERE "status" = 'SCHEDULED'
),
"RankedRounds" AS (
  SELECT
    "leagueId",
    "round",
    DENSE_RANK() OVER (
      PARTITION BY "leagueId"
      ORDER BY "round"
    ) - 1 AS "weekOffset"
  FROM "ScheduledRounds"
)
UPDATE "LeagueFixture" AS "fixture"
SET "scheduledAt" =
  "LeagueEvent"."firstLeagueAt" +
  "RankedRounds"."weekOffset" * INTERVAL '7 days'
FROM "RankedRounds", "LeagueEvent"
WHERE "fixture"."leagueId" = "RankedRounds"."leagueId"
  AND "fixture"."round" = "RankedRounds"."round"
  AND "fixture"."status" = 'SCHEDULED';

WITH "SeasonEnds" AS (
  SELECT
    "league"."seasonId",
    MAX("fixture"."scheduledAt") AS "endsAt"
  FROM "League" AS "league"
  INNER JOIN "LeagueFixture" AS "fixture"
    ON "fixture"."leagueId" = "league"."id"
  GROUP BY "league"."seasonId"
)
UPDATE "Season" AS "season"
SET "endsAt" = "SeasonEnds"."endsAt"
FROM "SeasonEnds"
WHERE "season"."id" = "SeasonEnds"."seasonId"
  AND "season"."status" <> 'COMPLETED';
