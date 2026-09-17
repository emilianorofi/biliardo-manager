import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { formatRomeDateKey } from "@/lib/rome-calendar";

const AGE_DAYS_PER_YEAR = 105;
const AGE_CLOCK_KEY = "PLAYER_AGE_DATE";
const AGE_CLOCK_ADVISORY_LOCK = 7302027;

type ClockStateRow = {
  value: string;
};

export async function advancePlayerAges(
  transaction: Prisma.TransactionClient,
  now = new Date()
) {
  await transaction.$queryRaw`
    SELECT pg_advisory_xact_lock(${AGE_CLOCK_ADVISORY_LOCK})
  `;

  const todayKey = formatRomeDateKey(now);
  const rows = await transaction.$queryRaw<ClockStateRow[]>`
    SELECT "value"
    FROM "GameClockState"
    WHERE "key" = ${AGE_CLOCK_KEY}
    FOR UPDATE
  `;

  const previousKey = rows[0]?.value ?? null;

  if (!previousKey) {
    await transaction.$executeRaw`
      INSERT INTO "GameClockState" ("key", "value", "updatedAt")
      VALUES (${AGE_CLOCK_KEY}, ${todayKey}, ${now})
      ON CONFLICT ("key") DO UPDATE
      SET "value" = EXCLUDED."value", "updatedAt" = EXCLUDED."updatedAt"
    `;

    return {
      advancedDays: 0,
      previousKey: null,
      currentKey: todayKey,
    };
  }

  const advancedDays = differenceInCalendarDays(previousKey, todayKey);
  if (advancedDays <= 0) {
    return {
      advancedDays: 0,
      previousKey,
      currentKey: todayKey,
    };
  }

  await transaction.$executeRaw`
    UPDATE "Player"
    SET
      "age" = "age" + (("ageDays" + ${advancedDays}) / ${AGE_DAYS_PER_YEAR}),
      "ageDays" = MOD("ageDays" + ${advancedDays}, ${AGE_DAYS_PER_YEAR}),
      "updatedAt" = ${now}
    WHERE "careerStatus" = 'ACTIVE'
  `;

  await transaction.$executeRaw`
    UPDATE "AcademyPlayer"
    SET
      "age" = "age" + (("ageDays" + ${advancedDays}) / ${AGE_DAYS_PER_YEAR}),
      "ageDays" = MOD("ageDays" + ${advancedDays}, ${AGE_DAYS_PER_YEAR}),
      "updatedAt" = ${now}
  `;

  await transaction.$executeRaw`
    UPDATE "GameClockState"
    SET "value" = ${todayKey}, "updatedAt" = ${now}
    WHERE "key" = ${AGE_CLOCK_KEY}
  `;

  return {
    advancedDays,
    previousKey,
    currentKey: todayKey,
  };
}

export function advanceAge(
  age: number,
  ageDays: number,
  days = 1
) {
  const safeAge = Math.max(0, Math.trunc(age));
  const safeAgeDays = Math.min(104, Math.max(0, Math.trunc(ageDays)));
  const safeDays = Math.max(0, Math.trunc(days));
  const totalDays = safeAgeDays + safeDays;

  return {
    age: safeAge + Math.floor(totalDays / AGE_DAYS_PER_YEAR),
    ageDays: totalDays % AGE_DAYS_PER_YEAR,
  };
}

function differenceInCalendarDays(fromKey: string, toKey: string) {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);

  if (!from || !to) return 0;

  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month - 1, day));
}
