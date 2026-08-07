import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
    const outcomes = await settleExpiredAuctions();
    const pendingCount = outcomes.filter(
      (outcome) =>
        outcome.status === "PENDING_TRANSFER"
    ).length;
    const settledCount =
      outcomes.length - pendingCount;

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      settledCount,
      pendingCount,
      outcomes,
    });
  } catch (error: unknown) {
    console.error(
      "Errore durante la chiusura automatica delle aste:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile completare la chiusura automatica delle aste.",
      },
      {
        status: 500,
      }
    );
  }
}
