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
  const lockRows = await transaction.$queryRaw<Array<{ acquired: boolean }>>`
    SELECT pg_try_advisory_xact_lock(${AGE_CLOCK_ADVISORY_LOCK}) AS acquired
  `;

  if (lockRows[0]?.acquired !== true) {
    return {
      advancedDays: 0,
      previousKey: null,
      currentKey: formatRomeDateKey(now),
      expiredAcademyPlayers: 0,
    };
  }

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
      expiredAcademyPlayers: 0,
    };
  }

  const advancedDays = differenceInCalendarDays(previousKey, todayKey);
  if (advancedDays <= 0) {
    return {
      advancedDays: 0,
      previousKey,
      currentKey: todayKey,
      expiredAcademyPlayers: 0,
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

  // Sviluppo tecnico giovanile continuo.
  // A 14 anni la crescita e maggiore; talento e livello Accademia
  // amplificano il guadagno. Il calcolo e proporzionale ai giorni
  // realmente trascorsi, quindi resta coerente anche dopo periodi offline.
  await transaction.$executeRawUnsafe(
    `UPDATE "AcademyPlayer" ap
     SET
       "precisione" = COALESCE(ap."precisione", 0) + dev.gain,
       "diretto" = COALESCE(ap."diretto", 0) + dev.gain,
       "sponde" = COALESCE(ap."sponde", 0) + dev.gain,
       "tattica" = COALESCE(ap."tattica", 0) + dev.gain,
       "mentalita" = COALESCE(ap."mentalita", 0) + dev.gain,
       "difesa" = COALESCE(ap."difesa", 0) + dev.gain,
       "realizzazione" = COALESCE(ap."realizzazione", 0) + dev.gain,
       "creativita" = COALESCE(ap."creativita", 0) + dev.gain,
       "misura" = COALESCE(ap."misura", 0) + dev.gain
     FROM (
       SELECT
         a."id",
         (
           0.26 * (${advancedDays}::double precision / 7.0) *
           (0.8 + ((LEAST(95.0, GREATEST(45.0, a."talent")) - 45.0) / 50.0) * 0.7) *
           CASE
             WHEN a."age" <= 14 THEN 1.35
             WHEN a."age" = 15 THEN 1.15
             WHEN a."age" = 16 THEN 1.00
             ELSE 0.85
           END *
           CASE LEAST(5, GREATEST(1, c."academyLevel"))
             WHEN 1 THEN 0.85
             WHEN 2 THEN 0.925
             WHEN 3 THEN 1.00
             WHEN 4 THEN 1.075
             ELSE 1.15
           END
         ) AS gain
       FROM "AcademyPlayer" a
       JOIN "Club" c ON c."id" = a."clubId"
     ) dev
     WHERE ap."id" = dev."id"`
  );

  const expiredAcademyPlayers = await transaction.academyPlayer.findMany({
    where: {
      age: { gte: 18 },
    },
    select: {
      id: true,
      clubId: true,
      firstName: true,
      lastName: true,
    },
  });

  if (expiredAcademyPlayers.length > 0) {
    await transaction.academyPlayer.deleteMany({
      where: {
        id: {
          in: expiredAcademyPlayers.map((player) => player.id),
        },
      },
    });

    await transaction.gameEvent.createMany({
      data: expiredAcademyPlayers.map((player) => ({
        clubId: player.clubId,
        type: "ACADEMY_AGE_LIMIT",
        title: `Uscita dall'Accademia: ${player.firstName} ${player.lastName}`,
        description:
          `${player.firstName} ${player.lastName} ha raggiunto 18e0 senza essere promosso ed è stato automaticamente allontanato dall'Accademia.`,
        createdAt: now,
      })),
    });
  }

  await transaction.$executeRaw`
    UPDATE "GameClockState"
    SET "value" = ${todayKey}, "updatedAt" = ${now}
    WHERE "key" = ${AGE_CLOCK_KEY}
  `;

  return {
    advancedDays,
    previousKey,
    currentKey: todayKey,
    expiredAcademyPlayers: expiredAcademyPlayers.length,
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
