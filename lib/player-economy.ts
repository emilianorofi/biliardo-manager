import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  calculatePlayerMarketValue,
  calculatePlayerWeeklySalary,
} from "@/lib/economy-rules";
import { calculateOverall } from "@/lib/training-engine";

export async function refreshClubPlayerEconomy(
  transaction: Prisma.TransactionClient,
  clubId: number
) {
  const players = await transaction.player.findMany({
    where: {
      clubId,
      careerStatus: "ACTIVE",
    },
    select: {
      id: true,
      age: true,
      talent: true,
      salary: true,
      value: true,
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
  });

  let salaryTotal = 0;
  let updatedPlayers = 0;

  for (const player of players) {
    const overall = calculateOverall(player);
    const salary = calculatePlayerWeeklySalary(overall);
    const value = calculatePlayerMarketValue({
      overall,
      age: player.age,
      talent: player.talent,
    });

    salaryTotal += salary;

    if (salary !== player.salary || value !== player.value) {
      await transaction.player.update({
        where: { id: player.id },
        data: { salary, value },
      });
      updatedPlayers += 1;
    }
  }

  return {
    players: players.length,
    updatedPlayers,
    salaryTotal,
  };
}
