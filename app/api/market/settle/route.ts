import { NextResponse } from "next/server";

import { expireUnavailableFreeAgents } from "@/lib/free-agent-expiration";
import { settlePendingLiveEconomy } from "@/lib/live-economy";
import { settleExpiredAuctions } from "@/lib/market-settlement";

export async function POST() {
  try {
    const checkedAt = new Date();
    const [outcomes, expiredFreeAgents] = await Promise.all([
      settleExpiredAuctions(checkedAt),
      expireUnavailableFreeAgents(checkedAt),
    ]);
    const economy = await settlePendingLiveEconomy(checkedAt);
    const pendingCount = outcomes.filter(
      (outcome) => outcome.status === "PENDING_TRANSFER"
    ).length;
    const settledCount = outcomes.length - pendingCount;

    return NextResponse.json({
      settledCount,
      pendingCount,
      expiredFreeAgentsCount: expiredFreeAgents.length,
      outcomes,
      expiredFreeAgents,
      economy,
    });
  } catch (error: unknown) {
    console.error("Errore durante l'aggiornamento del mercato:", error);
    return NextResponse.json(
      { error: "Impossibile completare l'aggiornamento del mercato." },
      { status: 500 }
    );
  }
}
