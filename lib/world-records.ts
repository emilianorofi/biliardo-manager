import "server-only";

import { prisma } from "@/lib/prisma";

export type WorldRecordPlayer = {
  playerId: number;
  firstName: string;
  lastName: string;
  nationality: string;
  value: number;
  detail?: string;
};

export type WorldRecords = {
  totalTitles: WorldRecordPlayer[];
  worldTitles: WorldRecordPlayer[];
  individualTitles: WorldRecordPlayer[];
  specialtyCupTitles: WorldRecordPlayer[];
  nationsCupTitles: WorldRecordPlayer[];
  appearances: WorldRecordPlayer[];
  matchWins: WorldRecordPlayer[];
  winRate: WorldRecordPlayer[];
};

type CountRow = {
  playerId: number;
  firstName: string;
  lastName: string;
  nationality: string;
  value: number;
};

type PerformanceRow = CountRow & {
  played: number;
  wins: number;
};

type SpecialtyCupRow = {
  payload: unknown;
};

export async function getWorldRecords(): Promise<WorldRecords> {
  const [
    worldTitles,
    individualTitles,
    nationsCupTitles,
    appearances,
    performances,
    specialtyRows,
  ] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT
        p."id" AS "playerId",
        p."firstName",
        p."lastName",
        p."nationality",
        COUNT(*)::int AS "value"
      FROM "IndividualTournamentEntry" e
      JOIN "IndividualTournament" t ON t."id" = e."tournamentId"
      JOIN "Player" p ON p."id" = e."playerId"
      WHERE e."status" = 'WINNER'
        AND t."type" = 'MONDIALE'
      GROUP BY p."id", p."firstName", p."lastName", p."nationality"
      ORDER BY "value" DESC, p."id" ASC
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT
        p."id" AS "playerId",
        p."firstName",
        p."lastName",
        p."nationality",
        COUNT(*)::int AS "value"
      FROM "IndividualTournamentEntry" e
      JOIN "IndividualTournament" t ON t."id" = e."tournamentId"
      JOIN "Player" p ON p."id" = e."playerId"
      WHERE e."status" = 'WINNER'
        AND t."type" <> 'MONDIALE'
      GROUP BY p."id", p."firstName", p."lastName", p."nationality"
      ORDER BY "value" DESC, p."id" ASC
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT
        p."id" AS "playerId",
        p."firstName",
        p."lastName",
        p."nationality",
        COUNT(*)::int AS "value"
      FROM "NationsCupEntry" e
      JOIN "NationsCupTournament" t ON t."id" = e."tournamentId"
      CROSS JOIN LATERAL (
        VALUES (e."firstPlayerId"), (e."secondPlayerId"), (e."thirdPlayerId")
      ) AS member("playerId")
      JOIN "Player" p ON p."id" = member."playerId"
      WHERE t."championCode" IS NOT NULL
        AND t."championCode" = e."nationCode"
      GROUP BY p."id", p."firstName", p."lastName", p."nationality"
      ORDER BY "value" DESC, p."id" ASC
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT
        p."id" AS "playerId",
        p."firstName",
        p."lastName",
        p."nationality",
        COUNT(a."id")::int AS "value"
      FROM "PlayerFixtureAppearance" a
      JOIN "Player" p ON p."id" = a."playerId"
      GROUP BY p."id", p."firstName", p."lastName", p."nationality"
      ORDER BY "value" DESC, p."id" ASC
    `,
    prisma.$queryRaw<PerformanceRow[]>`
      SELECT
        p."id" AS "playerId",
        p."firstName",
        p."lastName",
        p."nationality",
        COUNT(gp."id")::int AS "played",
        COUNT(gp."id") FILTER (WHERE gp."result" = 'WIN')::int AS "wins",
        COUNT(gp."id") FILTER (WHERE gp."result" = 'WIN')::int AS "value"
      FROM "PlayerGamePerformance" gp
      JOIN "PlayerFixtureAppearance" a ON a."id" = gp."appearanceId"
      JOIN "Player" p ON p."id" = a."playerId"
      GROUP BY p."id", p."firstName", p."lastName", p."nationality"
      ORDER BY "wins" DESC, p."id" ASC
    `,
    prisma.$queryRaw<SpecialtyCupRow[]>`
      SELECT "payload"
      FROM "SpecialtyCupTournament"
      WHERE "payload" IS NOT NULL
    `,
  ]);

  const specialtyTitleCounts = collectSpecialtyCupChampions(specialtyRows);
  const specialtyIds = [...specialtyTitleCounts.keys()];
  const specialtyPlayers =
    specialtyIds.length === 0
      ? []
      : await prisma.player.findMany({
          where: { id: { in: specialtyIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nationality: true,
          },
        });

  const specialtyCupTitles = specialtyPlayers
    .map((player) => ({
      playerId: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      nationality: player.nationality,
      value: specialtyTitleCounts.get(player.id) ?? 0,
    }))
    .sort((a, b) => b.value - a.value || a.playerId - b.playerId);

  const titleMap = new Map<number, WorldRecordPlayer>();
  for (const row of [
    ...worldTitles,
    ...individualTitles,
    ...specialtyCupTitles,
    ...nationsCupTitles,
  ]) {
    const current = titleMap.get(row.playerId);
    if (current) {
      current.value += row.value;
    } else {
      titleMap.set(row.playerId, { ...row });
    }
  }

  const totalTitles = [...titleMap.values()].sort(
    (a, b) => b.value - a.value || a.playerId - b.playerId
  );

  const matchWins: WorldRecordPlayer[] = performances
    .map((row) => ({
      playerId: row.playerId,
      firstName: row.firstName,
      lastName: row.lastName,
      nationality: row.nationality,
      value: row.wins,
      detail: `${row.played} prove`,
    }))
    .sort((a, b) => b.value - a.value || a.playerId - b.playerId);

  const winRate: WorldRecordPlayer[] = performances
    .filter((row) => row.played >= 20)
    .map((row) => ({
      playerId: row.playerId,
      firstName: row.firstName,
      lastName: row.lastName,
      nationality: row.nationality,
      value: Math.round((row.wins / row.played) * 1000) / 10,
      detail: `${row.wins}/${row.played} prove`,
    }))
    .sort((a, b) => b.value - a.value || a.playerId - b.playerId);

  return {
    totalTitles: totalTitles.slice(0, 10),
    worldTitles: worldTitles.slice(0, 10),
    individualTitles: individualTitles.slice(0, 10),
    specialtyCupTitles: specialtyCupTitles.slice(0, 10),
    nationsCupTitles: nationsCupTitles.slice(0, 10),
    appearances: appearances.slice(0, 10),
    matchWins: matchWins.slice(0, 10),
    winRate: winRate.slice(0, 10),
  };
}

function collectSpecialtyCupChampions(rows: SpecialtyCupRow[]) {
  const counts = new Map<number, number>();

  for (const row of rows) {
    if (!row.payload || typeof row.payload !== "object") continue;
    const payload = row.payload as {
      cups?: Record<string, { championPlayerId?: number | null }>;
    };

    for (const cup of Object.values(payload.cups ?? {})) {
      const playerId = cup.championPlayerId;
      if (!Number.isInteger(playerId)) continue;
      counts.set(playerId!, (counts.get(playerId!) ?? 0) + 1);
    }
  }

  return counts;
}
