import type { Prisma } from "@/generated/prisma/client";
import { calculateAcademyWeeklyDevelopment } from "@/lib/academy-development";
import type { TrainingPlayerValues } from "@/lib/training-engine";

export async function advanceAcademyDevelopment(
  transaction: Prisma.TransactionClient,
  clubId: number
) {
  const [club, players] = await Promise.all([
    transaction.club.findUnique({
      where: { id: clubId },
      select: { academyLevel: true },
    }),
    transaction.academyPlayer.findMany({
      where: { clubId },
      select: {
        id: true,
        age: true,
        talent: true,
        precisione: true,
        diretto: true,
        sponde: true,
        tattica: true,
        mentalita: true,
        difesa: true,
        realizzazione: true,
        creativita: true,
        misura: true,
      },
    }),
  ]);

  const academyLevel = club?.academyLevel ?? 1;

  for (const player of players) {
    const currentValues: TrainingPlayerValues = {
      precisione: player.precisione ?? 0,
      diretto: player.diretto ?? 0,
      sponde: player.sponde ?? 0,
      tattica: player.tattica ?? 0,
      mentalita: player.mentalita ?? 0,
      difesa: player.difesa ?? 0,
      realizzazione: player.realizzazione ?? 0,
      creativita: player.creativita ?? 0,
      misura: player.misura ?? 0,
    };

    const development = calculateAcademyWeeklyDevelopment({
      age: player.age,
      talent: player.talent,
      academyLevel,
      currentValues,
    });

    await transaction.academyPlayer.update({
      where: { id: player.id },
      data: development.values,
    });
  }

  return { developedPlayers: players.length };
}
