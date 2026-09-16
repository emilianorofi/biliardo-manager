import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createEmptyFormationStrategy,
  type FormationStrategy,
} from "@/lib/formation-strategy";

const FORMATION_STRATEGY_SCHEMA_LOCK = 2026091602;
let schemaReady = false;

type StrategyRow = {
  reserves: unknown;
  substitutions: unknown;
};

type StrategyClient = Prisma.TransactionClient | typeof prisma;

export async function ensureFormationStrategySchema() {
  if (schemaReady) return;

  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe(
      `SELECT pg_advisory_xact_lock(${FORMATION_STRATEGY_SCHEMA_LOCK})`
    );

    await transaction.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FormationStrategy" (
        "clubId" INTEGER PRIMARY KEY REFERENCES "Club"("id") ON DELETE CASCADE,
        "reserves" JSONB NOT NULL DEFAULT '{"R1":null,"R2":null,"R3":null}'::jsonb,
        "substitutions" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "savedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  schemaReady = true;
}

export async function loadFormationStrategy(
  clubId: number,
  client: StrategyClient = prisma
): Promise<FormationStrategy> {
  await ensureFormationStrategySchema();

  const rows = await client.$queryRawUnsafe<StrategyRow[]>(
    `SELECT "reserves", "substitutions"
     FROM "FormationStrategy"
     WHERE "clubId" = $1
     LIMIT 1`,
    clubId
  );

  const row = rows[0];
  if (!row) return createEmptyFormationStrategy();

  const empty = createEmptyFormationStrategy();
  const reserves =
    typeof row.reserves === "object" && row.reserves !== null
      ? (row.reserves as Record<string, unknown>)
      : {};

  return {
    reserves: {
      R1: parseStoredPlayerId(reserves.R1),
      R2: parseStoredPlayerId(reserves.R2),
      R3: parseStoredPlayerId(reserves.R3),
    },
    substitutions: Array.isArray(row.substitutions)
      ? row.substitutions
          .filter(
            (item): item is {
              afterGame: number;
              slot: "A" | "B" | "C";
              reserveSlot: "R1" | "R2" | "R3";
            } =>
              typeof item === "object" &&
              item !== null &&
              Number.isInteger((item as { afterGame?: unknown }).afterGame) &&
              ["A", "B", "C"].includes(
                String((item as { slot?: unknown }).slot)
              ) &&
              ["R1", "R2", "R3"].includes(
                String((item as { reserveSlot?: unknown }).reserveSlot)
              )
          )
          .map((item) => ({
            afterGame: Number(item.afterGame),
            slot: item.slot,
            reserveSlot: item.reserveSlot,
          }))
      : empty.substitutions,
  };
}

export async function saveFormationStrategy(
  clubId: number,
  strategy: FormationStrategy,
  savedAt: Date,
  client: StrategyClient = prisma
) {
  await ensureFormationStrategySchema();

  await client.$executeRawUnsafe(
    `INSERT INTO "FormationStrategy"
      ("clubId", "reserves", "substitutions", "savedAt", "updatedAt")
     VALUES ($1, $2::jsonb, $3::jsonb, $4, $4)
     ON CONFLICT ("clubId") DO UPDATE SET
       "reserves" = EXCLUDED."reserves",
       "substitutions" = EXCLUDED."substitutions",
       "savedAt" = EXCLUDED."savedAt",
       "updatedAt" = EXCLUDED."updatedAt"`,
    clubId,
    JSON.stringify(strategy.reserves),
    JSON.stringify(strategy.substitutions),
    savedAt
  );
}

function parseStoredPlayerId(value: unknown) {
  const playerId = Number(value);
  return Number.isInteger(playerId) && playerId > 0 ? playerId : null;
}
