import "server-only";

import { prisma } from "@/lib/prisma";
import {
  calculateLeagueTrainingUsage,
  type LeagueGameType,
  type LeagueTrainingUsage,
} from "@/lib/training-usage";
import {
  getCurrentRomeWeeklyWindow,
} from "@/lib/rome-calendar";

export async function loadWeeklyLeagueTrainingUsage(
  clubId: number,
  date = new Date()
) {
  const { start, end } =
    getCurrentRomeWeeklyWindow(
      date
    );
  const appearances =
    await prisma.playerFixtureAppearance.findMany({
      where: {
        clubId,
        playerId: {
          not: null,
        },
        playedAt: {
          gte: start,
          lt: end,
        },
      },
      select: {
        playerId: true,
        gamePerformances: {
          select: {
            fixtureGame: {
              select: {
                gameType: true,
              },
            },
          },
        },
      },
    });
  const gameTypesByPlayer =
    new Map<number, LeagueGameType[]>();

  for (const appearance of appearances) {
    if (appearance.playerId === null) {
      continue;
    }

    const gameTypes =
      gameTypesByPlayer.get(
        appearance.playerId
      ) ?? [];

    for (
      const performance of
        appearance.gamePerformances
    ) {
      const gameType =
        performance.fixtureGame
          .gameType;

      if (
        gameType === "SINGLES" ||
        gameType === "DOUBLES"
      ) {
        gameTypes.push(gameType);
      }
    }

    gameTypesByPlayer.set(
      appearance.playerId,
      gameTypes
    );
  }

  const usageByPlayer =
    new Map<number, LeagueTrainingUsage>();

  for (
    const [playerId, gameTypes] of
      gameTypesByPlayer
  ) {
    usageByPlayer.set(
      playerId,
      calculateLeagueTrainingUsage(
        gameTypes
      )
    );
  }

  return usageByPlayer;
}
