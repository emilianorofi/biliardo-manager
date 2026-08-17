import type { Prisma } from "@/generated/prisma/client";
import { createInitialAcademy } from "@/lib/onboarding/initial-academy";

type ClubAcademyState = {
  academyInitialized: boolean;
};

export async function ensureInitialAcademy(
  transaction: Prisma.TransactionClient,
  clubId: number
) {
  const states = await transaction.$queryRaw<ClubAcademyState[]>`
    SELECT "academyInitialized"
    FROM "Club"
    WHERE "id" = ${clubId}
    FOR UPDATE
  `;
  const state = states[0];

  if (!state || state.academyInitialized) {
    return;
  }

  const existingPlayers = await transaction.academyPlayer.count({
    where: {
      clubId,
    },
  });

  if (existingPlayers === 0) {
    await transaction.academyPlayer.createMany({
      data: createInitialAcademy().map((player) => ({
        ...player,
        clubId,
      })),
    });
  }

  await transaction.club.update({
    where: {
      id: clubId,
    },
    data: {
      academyInitialized: true,
    },
  });
}
