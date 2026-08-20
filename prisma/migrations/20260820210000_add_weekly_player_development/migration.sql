-- Registra separatamente il calo tecnico nelle sessioni settimanali.
ALTER TABLE "TrainingResult"
ADD COLUMN "primaryDecline" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "secondaryDecline" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "overallDecline" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Distribuisce su una settimana ciascuna giornata non ancora disputata.
WITH "ScheduledRounds" AS (
  SELECT
    "leagueId",
    "round",
    MIN("scheduledAt") AS "originalDate"
  FROM "LeagueFixture"
  WHERE "status" = 'SCHEDULED'
  GROUP BY "leagueId", "round"
),
"RankedRounds" AS (
  SELECT
    "leagueId",
    "round",
    MIN("originalDate") OVER (
      PARTITION BY "leagueId"
    ) + (
      DENSE_RANK() OVER (
        PARTITION BY "leagueId"
        ORDER BY "round"
      ) - 1
    ) * INTERVAL '7 days' AS "weeklyDate"
  FROM "ScheduledRounds"
)
UPDATE "LeagueFixture" AS "fixture"
SET "scheduledAt" = "ranked"."weeklyDate"
FROM "RankedRounds" AS "ranked"
WHERE "fixture"."leagueId" = "ranked"."leagueId"
  AND "fixture"."round" = "ranked"."round"
  AND "fixture"."status" = 'SCHEDULED';

-- Allinea la fine delle stagioni ancora aperte al nuovo calendario.
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
SET "endsAt" = "seasonEnds"."endsAt"
FROM "SeasonEnds" AS "seasonEnds"
WHERE "season"."id" = "seasonEnds"."seasonId"
  AND "season"."status" <> 'COMPLETED';
