import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ECONOMY_SCHEMA_LOCK = 2026091601;
let economySchemaReady = false;

type ColumnExistsRow = { exists: boolean };
type SchemaClient = Prisma.TransactionClient | typeof prisma;

export async function ensureEconomySchema() {
  if (economySchemaReady) return;

  const structureExists = await hasColumn(
    prisma,
    "Club",
    "trainingCenterLevel"
  );

  if (structureExists) {
    await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT pg_advisory_xact_lock(${ECONOMY_SCHEMA_LOCK})
      `;
      await ensureEconomyMarkers(transaction);
      await ensurePlayerLifecycleState(transaction);
    });
    economySchemaReady = true;
    return;
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`
      SELECT pg_advisory_xact_lock(${ECONOMY_SCHEMA_LOCK})
    `;

    const lockedCheck = await hasColumn(
      transaction,
      "Club",
      "trainingCenterLevel"
    );

    if (!lockedCheck) {
      await applyEconomySchema(transaction);
      await alignExistingEconomyData(transaction);
    }

    await ensureEconomyMarkers(transaction);
    await ensurePlayerLifecycleState(transaction);
  });

  economySchemaReady = true;
}

async function applyEconomySchema(transaction: Prisma.TransactionClient) {
  await transaction.$executeRawUnsafe(`
    ALTER TABLE "Club"
      ADD COLUMN IF NOT EXISTS "trainingCenterLevel" INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "trainingCenterUpgradeLevel" INTEGER,
      ADD COLUMN IF NOT EXISTS "trainingCenterUpgradeCompletesAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "academyLevel" INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "academyUpgradeLevel" INTEGER,
      ADD COLUMN IF NOT EXISTS "academyUpgradeCompletesAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "venueLevel" INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "venueUpgradeLevel" INTEGER,
      ADD COLUMN IF NOT EXISTS "venueUpgradeCompletesAt" TIMESTAMP(3)
  `);
}

async function ensureEconomyMarkers(client: SchemaClient) {
  const weeklyMarkerExists = await hasColumn(
    client,
    "ClubWeeklyUpdate",
    "economyAppliedAt"
  );
  if (!weeklyMarkerExists) {
    await client.$executeRawUnsafe(`
      ALTER TABLE "ClubWeeklyUpdate"
        ADD COLUMN "economyAppliedAt" TIMESTAMP(3)
    `);
    await client.$executeRawUnsafe(`
      UPDATE "ClubWeeklyUpdate"
      SET "economyAppliedAt" = COALESCE("processedAt", "createdAt")
      WHERE "economyAppliedAt" IS NULL
    `);
  }

  const transferMarkerExists = await hasColumn(
    client,
    "TransferListing",
    "economyAdjustedAt"
  );
  if (!transferMarkerExists) {
    await client.$executeRawUnsafe(`
      ALTER TABLE "TransferListing"
        ADD COLUMN "economyAdjustedAt" TIMESTAMP(3)
    `);
    await client.$executeRawUnsafe(`
      UPDATE "TransferListing"
      SET "economyAdjustedAt" = COALESCE("completedAt", "createdAt")
      WHERE "status" = 'COMPLETED'
        AND "economyAdjustedAt" IS NULL
    `);
  }

  const tournamentMarkerExists = await hasColumn(
    client,
    "IndividualTournament",
    "prizesPaidAt"
  );
  if (!tournamentMarkerExists) {
    await client.$executeRawUnsafe(`
      ALTER TABLE "IndividualTournament"
        ADD COLUMN "prizesPaidAt" TIMESTAMP(3)
    `);
    await client.$executeRawUnsafe(`
      UPDATE "IndividualTournament"
      SET "prizesPaidAt" = COALESCE("finalAt", "updatedAt")
      WHERE "status" = 'COMPLETED'
        AND "prizesPaidAt" IS NULL
    `);
  }

  const seasonMarkerExists = await hasColumn(
    client,
    "Season",
    "economySettledAt"
  );
  if (!seasonMarkerExists) {
    await client.$executeRawUnsafe(`
      ALTER TABLE "Season"
        ADD COLUMN "economySettledAt" TIMESTAMP(3)
    `);
    await client.$executeRawUnsafe(`
      UPDATE "Season"
      SET "economySettledAt" = COALESCE("endsAt", "updatedAt")
      WHERE "status" = 'COMPLETED'
        AND "economySettledAt" IS NULL
    `);
  }
}

async function ensurePlayerLifecycleState(client: SchemaClient) {
  const rows = await client.$queryRawUnsafe<Array<{ supportsRemoved: boolean }>>(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = '"Player"'::regclass
        AND conname = 'Player_careerStatus_check'
        AND pg_get_constraintdef(oid) LIKE '%REMOVED%'
    ) AS "supportsRemoved"
  `);

  if (rows[0]?.supportsRemoved) return;

  await client.$executeRawUnsafe(`
    ALTER TABLE "Player"
      DROP CONSTRAINT IF EXISTS "Player_retirement_state_check",
      DROP CONSTRAINT IF EXISTS "Player_careerStatus_check"
  `);

  await client.$executeRawUnsafe(`
    ALTER TABLE "Player"
      ADD CONSTRAINT "Player_careerStatus_check"
      CHECK ("careerStatus" IN ('ACTIVE', 'RETIRED', 'REMOVED')),
      ADD CONSTRAINT "Player_retirement_state_check"
      CHECK (
        (
          "careerStatus" = 'ACTIVE'
          AND "retiredAt" IS NULL
          AND "retirementSeasonId" IS NULL
        )
        OR
        (
          "careerStatus" = 'RETIRED'
          AND "retiredAt" IS NOT NULL
          AND "retirementSeasonId" IS NOT NULL
          AND "clubId" IS NULL
        )
        OR
        (
          "careerStatus" = 'REMOVED'
          AND "retiredAt" IS NULL
          AND "retirementSeasonId" IS NULL
          AND "clubId" IS NULL
        )
      )
  `);
}

async function hasColumn(
  client: SchemaClient,
  tableName: string,
  columnName: string
) {
  const rows = await client.$queryRawUnsafe<ColumnExistsRow[]>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = $1
        AND column_name = $2
    ) AS "exists"`,
    tableName,
    columnName
  );

  return rows[0]?.exists ?? false;
}

async function alignExistingEconomyData(transaction: Prisma.TransactionClient) {
  await transaction.$executeRawUnsafe(`
    UPDATE "Club"
    SET "fans" = CASE
      WHEN "fans" < 10 THEN 90
      WHEN "fans" > 300 THEN GREATEST(10, LEAST(300, ROUND("fans" / 10.0)::INTEGER))
      ELSE "fans"
    END
  `);

  await transaction.$executeRawUnsafe(`
    WITH calculated AS (
      SELECT
        "id",
        LEAST(100.0, GREATEST(0.0,
          ("precisione" + "diretto" + "sponde" + "tattica" +
           "mentalita" + "difesa" + "realizzazione" +
           "creativita" + "misura") / 9.0
        )) AS overall
      FROM "Player"
    )
    UPDATE "Player" AS player
    SET
      "salary" = GREATEST(250, ROUND(250 * POWER(1.105, calculated.overall - 50))::INTEGER),
      "value" = (
        ROUND((
          30000 * POWER(1.075, calculated.overall - 60) *
          CASE
            WHEN player."age" <= 20 THEN 2.30
            WHEN player."age" <= 25 THEN 2.10
            WHEN player."age" <= 30 THEN 1.80
            WHEN player."age" <= 35 THEN 1.55
            WHEN player."age" <= 40 THEN 1.30
            WHEN player."age" <= 45 THEN 1.15
            WHEN player."age" <= 50 THEN 0.95
            WHEN player."age" <= 55 THEN 0.75
            WHEN player."age" <= 60 THEN 0.55
            WHEN player."age" <= 65 THEN 0.40
            WHEN player."age" <= 70 THEN 0.28
            WHEN player."age" <= 75 THEN 0.18
            ELSE 0.10
          END *
          (0.70 + LEAST(100.0, GREATEST(0.0, player."talent")) / 180.0)
        ) / 100.0) * 100
      )::INTEGER
    FROM calculated
    WHERE player."id" = calculated."id"
  `);
}
