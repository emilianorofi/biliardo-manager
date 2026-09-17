import "server-only";

import { processGameClock as processBaseGameClock } from "@/lib/game-clock";
import {
  prepareLiveEconomy,
  settlePendingLiveEconomy,
} from "@/lib/live-economy";
import { prisma } from "@/lib/prisma";

const GAME_CLOCK_ADVISORY_LOCK = 7302026;
const GAME_CLOCK_LOCK_TIMEOUT = 120000;

type AdvisoryLockRow = {
  acquired: boolean;
};

export async function processGameClock(now = new Date()) {
  return prisma.$transaction(
    async (transaction) => {
      const rows = await transaction.$queryRaw<AdvisoryLockRow[]>`
        SELECT pg_try_advisory_xact_lock(${GAME_CLOCK_ADVISORY_LOCK}) AS acquired
      `;
      const acquired = rows[0]?.acquired === true;

      if (!acquired) {
        return {
          checkedAt: now,
          processedEvents: 0,
          reachedLimit: false,
          events: [],
          economy: null,
          skippedBecauseClockBusy: true,
        };
      }

      await prepareLiveEconomy(now);
      const result = await processBaseGameClock(now);
      const economy = await settlePendingLiveEconomy(now);

      return {
        ...result,
        economy,
        skippedBecauseClockBusy: false,
      };
    },
    {
      timeout: GAME_CLOCK_LOCK_TIMEOUT,
    }
  );
}
