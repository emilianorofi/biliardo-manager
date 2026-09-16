ALTER TABLE "Club"
  ADD COLUMN IF NOT EXISTS "trainingCenterLevel" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "trainingCenterUpgradeLevel" INTEGER,
  ADD COLUMN IF NOT EXISTS "trainingCenterUpgradeCompletesAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "academyLevel" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "academyUpgradeLevel" INTEGER,
  ADD COLUMN IF NOT EXISTS "academyUpgradeCompletesAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "venueLevel" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "venueUpgradeLevel" INTEGER,
  ADD COLUMN IF NOT EXISTS "venueUpgradeCompletesAt" TIMESTAMP(3);

ALTER TABLE "Season" ADD COLUMN IF NOT EXISTS "economySettledAt" TIMESTAMP(3);
ALTER TABLE "IndividualTournament" ADD COLUMN IF NOT EXISTS "prizesPaidAt" TIMESTAMP(3);
ALTER TABLE "ClubWeeklyUpdate" ADD COLUMN IF NOT EXISTS "economyAppliedAt" TIMESTAMP(3);
ALTER TABLE "TransferListing" ADD COLUMN IF NOT EXISTS "economyAdjustedAt" TIMESTAMP(3);

UPDATE "Club"
SET "fans" = CASE
  WHEN "fans" < 10 THEN 90
  WHEN "fans" > 300 THEN GREATEST(10, LEAST(300, ROUND("fans" / 10.0)::INTEGER))
  ELSE "fans"
END;

WITH calculated AS (
  SELECT "id", LEAST(100.0, GREATEST(0.0,
    ("precisione" + "diretto" + "sponde" + "tattica" + "mentalita" +
     "difesa" + "realizzazione" + "creativita" + "misura") / 9.0
  )) AS overall
  FROM "Player"
)
UPDATE "Player" AS player
SET
  "salary" = GREATEST(250, ROUND(250 * POWER(1.105, calculated.overall - 50))::INTEGER),
  "value" = (ROUND((
    30000 * POWER(1.075, calculated.overall - 60) *
    CASE
      WHEN player."age" <= 20 THEN 2.30 WHEN player."age" <= 25 THEN 2.10
      WHEN player."age" <= 30 THEN 1.80 WHEN player."age" <= 35 THEN 1.55
      WHEN player."age" <= 40 THEN 1.30 WHEN player."age" <= 45 THEN 1.15
      WHEN player."age" <= 50 THEN 0.95 WHEN player."age" <= 55 THEN 0.75
      WHEN player."age" <= 60 THEN 0.55 WHEN player."age" <= 65 THEN 0.40
      WHEN player."age" <= 70 THEN 0.28 WHEN player."age" <= 75 THEN 0.18
      ELSE 0.10
    END * (0.70 + LEAST(100.0, GREATEST(0.0, player."talent")) / 180.0)
  ) / 100.0) * 100)::INTEGER
FROM calculated
WHERE player."id" = calculated."id";
