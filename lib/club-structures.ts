import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  getAcademyLevel,
  getTrainingCenterLevel,
  getVenueLevel,
} from "@/lib/economy-rules";
import { ensureEconomySchema } from "@/lib/economy-schema";
import { prisma } from "@/lib/prisma";

export type ClubStructureKind =
  | "TRAINING_CENTER"
  | "ACADEMY"
  | "VENUE";

export type ClubStructureState = {
  clubId: number;
  balance: number;
  trainingCenterLevel: number;
  trainingCenterUpgradeLevel: number | null;
  trainingCenterUpgradeCompletesAt: Date | null;
  academyLevel: number;
  academyUpgradeLevel: number | null;
  academyUpgradeCompletesAt: Date | null;
  venueLevel: number;
  venueUpgradeLevel: number | null;
  venueUpgradeCompletesAt: Date | null;
};

type RawClubStructureState = {
  id: number;
  balance: number;
  trainingCenterLevel: number;
  trainingCenterUpgradeLevel: number | null;
  trainingCenterUpgradeCompletesAt: Date | null;
  academyLevel: number;
  academyUpgradeLevel: number | null;
  academyUpgradeCompletesAt: Date | null;
  venueLevel: number;
  venueUpgradeLevel: number | null;
  venueUpgradeCompletesAt: Date | null;
};

export async function getClubStructures(
  clubId: number,
  now = new Date()
) {
  await ensureEconomySchema();

  return prisma.$transaction(async (transaction) => {
    await processCompletedClubStructureUpgrades(
      transaction,
      clubId,
      now
    );

    return getClubStructureStateInTransaction(transaction, clubId);
  });
}

export async function getClubStructureStateInTransaction(
  transaction: Prisma.TransactionClient,
  clubId: number
): Promise<ClubStructureState> {
  const rows = await transaction.$queryRaw<RawClubStructureState[]>`
    SELECT
      "id",
      "balance",
      "trainingCenterLevel",
      "trainingCenterUpgradeLevel",
      "trainingCenterUpgradeCompletesAt",
      "academyLevel",
      "academyUpgradeLevel",
      "academyUpgradeCompletesAt",
      "venueLevel",
      "venueUpgradeLevel",
      "venueUpgradeCompletesAt"
    FROM "Club"
    WHERE "id" = ${clubId}
  `;

  const row = rows[0];

  if (!row) {
    throw new Error("CLUB_NOT_FOUND");
  }

  return {
    clubId: row.id,
    balance: row.balance,
    trainingCenterLevel: row.trainingCenterLevel,
    trainingCenterUpgradeLevel: row.trainingCenterUpgradeLevel,
    trainingCenterUpgradeCompletesAt:
      row.trainingCenterUpgradeCompletesAt,
    academyLevel: row.academyLevel,
    academyUpgradeLevel: row.academyUpgradeLevel,
    academyUpgradeCompletesAt: row.academyUpgradeCompletesAt,
    venueLevel: row.venueLevel,
    venueUpgradeLevel: row.venueUpgradeLevel,
    venueUpgradeCompletesAt: row.venueUpgradeCompletesAt,
  };
}

export async function startClubStructureUpgrade(
  clubId: number,
  kind: ClubStructureKind,
  now = new Date()
) {
  await ensureEconomySchema();

  return prisma.$transaction(async (transaction) => {
    await lockClub(transaction, clubId);
    await processCompletedClubStructureUpgrades(
      transaction,
      clubId,
      now
    );

    const state = await getClubStructureStateInTransaction(
      transaction,
      clubId
    );
    const currentLevel = getCurrentLevel(state, kind);
    const pendingLevel = getPendingLevel(state, kind);

    if (pendingLevel !== null) {
      throw new Error("È già in corso un upgrade di questa struttura.");
    }

    if (currentLevel >= 5) {
      throw new Error("La struttura è già al livello massimo.");
    }

    const nextLevel = currentLevel + 1;
    const rules = getRules(kind, nextLevel);

    if (state.balance < 0) {
      throw new Error("Con saldo negativo non è possibile avviare nuovi lavori.");
    }

    if (state.balance < rules.upgradeCost) {
      throw new Error("Liquidità insufficiente per avviare questo upgrade.");
    }

    const completesAt = new Date(
      now.getTime() + rules.upgradeDays * 24 * 60 * 60 * 1000
    );

    if (kind === "TRAINING_CENTER") {
      await transaction.$executeRaw`
        UPDATE "Club"
        SET
          "balance" = "balance" - ${rules.upgradeCost},
          "trainingCenterUpgradeLevel" = ${nextLevel},
          "trainingCenterUpgradeCompletesAt" = ${completesAt}
        WHERE "id" = ${clubId}
      `;
    } else if (kind === "ACADEMY") {
      await transaction.$executeRaw`
        UPDATE "Club"
        SET
          "balance" = "balance" - ${rules.upgradeCost},
          "academyUpgradeLevel" = ${nextLevel},
          "academyUpgradeCompletesAt" = ${completesAt}
        WHERE "id" = ${clubId}
      `;
    } else {
      await transaction.$executeRaw`
        UPDATE "Club"
        SET
          "balance" = "balance" - ${rules.upgradeCost},
          "venueUpgradeLevel" = ${nextLevel},
          "venueUpgradeCompletesAt" = ${completesAt}
        WHERE "id" = ${clubId}
      `;
    }

    await transaction.gameEvent.create({
      data: {
        clubId,
        type: "STRUTTURA_UPGRADE_STARTED",
        title: `Lavori avviati: ${getLabel(kind)} livello ${nextLevel}`,
        description:
          `Investimento ${formatCurrency(rules.upgradeCost)}. ` +
          `Il livello ${currentLevel} resta attivo fino al completamento dei lavori.`,
        createdAt: now,
      },
    });

    return {
      kind,
      previousLevel: currentLevel,
      targetLevel: nextLevel,
      cost: rules.upgradeCost,
      completesAt,
      balanceAfter: state.balance - rules.upgradeCost,
    };
  });
}

export async function processAllCompletedStructureUpgrades(
  now = new Date()
) {
  await ensureEconomySchema();

  const clubs = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "Club"
    WHERE
      ("trainingCenterUpgradeCompletesAt" IS NOT NULL AND "trainingCenterUpgradeCompletesAt" <= ${now}) OR
      ("academyUpgradeCompletesAt" IS NOT NULL AND "academyUpgradeCompletesAt" <= ${now}) OR
      ("venueUpgradeCompletesAt" IS NOT NULL AND "venueUpgradeCompletesAt" <= ${now})
    ORDER BY "id"
  `;

  let completed = 0;

  for (const club of clubs) {
    const result = await prisma.$transaction(async (transaction) => {
      await lockClub(transaction, club.id);
      return processCompletedClubStructureUpgrades(
        transaction,
        club.id,
        now
      );
    });

    completed += result.length;
  }

  return completed;
}

export async function processCompletedClubStructureUpgrades(
  transaction: Prisma.TransactionClient,
  clubId: number,
  now = new Date()
) {
  const state = await getClubStructureStateInTransaction(
    transaction,
    clubId
  );
  const completed: Array<{
    kind: ClubStructureKind;
    level: number;
  }> = [];

  if (
    state.trainingCenterUpgradeLevel !== null &&
    state.trainingCenterUpgradeCompletesAt &&
    state.trainingCenterUpgradeCompletesAt.getTime() <= now.getTime()
  ) {
    await transaction.$executeRaw`
      UPDATE "Club"
      SET
        "trainingCenterLevel" = ${state.trainingCenterUpgradeLevel},
        "trainingCenterUpgradeLevel" = NULL,
        "trainingCenterUpgradeCompletesAt" = NULL
      WHERE "id" = ${clubId}
    `;
    completed.push({
      kind: "TRAINING_CENTER",
      level: state.trainingCenterUpgradeLevel,
    });
  }

  if (
    state.academyUpgradeLevel !== null &&
    state.academyUpgradeCompletesAt &&
    state.academyUpgradeCompletesAt.getTime() <= now.getTime()
  ) {
    await transaction.$executeRaw`
      UPDATE "Club"
      SET
        "academyLevel" = ${state.academyUpgradeLevel},
        "academyUpgradeLevel" = NULL,
        "academyUpgradeCompletesAt" = NULL
      WHERE "id" = ${clubId}
    `;
    completed.push({
      kind: "ACADEMY",
      level: state.academyUpgradeLevel,
    });
  }

  if (
    state.venueUpgradeLevel !== null &&
    state.venueUpgradeCompletesAt &&
    state.venueUpgradeCompletesAt.getTime() <= now.getTime()
  ) {
    await transaction.$executeRaw`
      UPDATE "Club"
      SET
        "venueLevel" = ${state.venueUpgradeLevel},
        "venueUpgradeLevel" = NULL,
        "venueUpgradeCompletesAt" = NULL
      WHERE "id" = ${clubId}
    `;
    completed.push({
      kind: "VENUE",
      level: state.venueUpgradeLevel,
    });
  }

  if (completed.length > 0) {
    await transaction.gameEvent.createMany({
      data: completed.map((upgrade) => ({
        clubId,
        type: "STRUTTURA_UPGRADE_COMPLETED",
        title: `${getLabel(upgrade.kind)} al livello ${upgrade.level}`,
        description: "I lavori sono terminati e il nuovo livello è ora attivo.",
        createdAt: now,
      })),
    });
  }

  return completed;
}

function getCurrentLevel(
  state: ClubStructureState,
  kind: ClubStructureKind
) {
  if (kind === "TRAINING_CENTER") return state.trainingCenterLevel;
  if (kind === "ACADEMY") return state.academyLevel;
  return state.venueLevel;
}

function getPendingLevel(
  state: ClubStructureState,
  kind: ClubStructureKind
) {
  if (kind === "TRAINING_CENTER") {
    return state.trainingCenterUpgradeLevel;
  }
  if (kind === "ACADEMY") return state.academyUpgradeLevel;
  return state.venueUpgradeLevel;
}

function getRules(kind: ClubStructureKind, level: number) {
  if (kind === "TRAINING_CENTER") return getTrainingCenterLevel(level);
  if (kind === "ACADEMY") return getAcademyLevel(level);
  return getVenueLevel(level);
}

function getLabel(kind: ClubStructureKind) {
  if (kind === "TRAINING_CENTER") return "Centro Allenamento";
  if (kind === "ACADEMY") return "Accademia";
  return "Impianto di gioco";
}

async function lockClub(
  transaction: Prisma.TransactionClient,
  clubId: number
) {
  const rows = await transaction.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "Club"
    WHERE "id" = ${clubId}
    FOR UPDATE
  `;

  if (rows.length === 0) {
    throw new Error("CLUB_NOT_FOUND");
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
