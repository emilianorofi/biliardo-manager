import "server-only";

import { processGameClock as processBaseGameClock } from "@/lib/game-clock";
import {
  prepareLiveEconomy,
  settlePendingLiveEconomy,
} from "@/lib/live-economy";

export async function processGameClock(now = new Date()) {
  await prepareLiveEconomy(now);
  const result = await processBaseGameClock(now);
  const economy = await settlePendingLiveEconomy(now);

  return {
    ...result,
    economy,
  };
}
