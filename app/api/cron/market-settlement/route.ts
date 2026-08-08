import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { expireUnavailableFreeAgents } from "@/lib/free-agent-expiration";
import { settleExpiredAuctions } from "@/lib/market-settlement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  return (
    Boolean(cronSecret) &&
    request.headers.get("authorization") ===
      `Bearer ${cronSecret}`
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Accesso non autorizzato.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const checkedAt = new Date();
    const [outcomes, expiredFreeAgents] =
      await Promise.all([
        settleExpiredAuctions(checkedAt),
        expireUnavailableFreeAgents(checkedAt),
      ]);
    const pendingCount = outcomes.filter(
      (outcome) =>
        outcome.status === "PENDING_TRANSFER"
    ).length;
    const settledCount =
      outcomes.length - pendingCount;

    return NextResponse.json({
      success: true,
      checkedAt: checkedAt.toISOString(),
      settledCount,
      pendingCount,
      expiredFreeAgentsCount:
        expiredFreeAgents.length,
      outcomes,
      expiredFreeAgents,
    });
  } catch (error: unknown) {
    console.error(
      "Errore durante l'aggiornamento automatico del mercato:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile completare l'aggiornamento automatico del mercato.",
      },
      {
        status: 500,
      }
    );
  }
}
