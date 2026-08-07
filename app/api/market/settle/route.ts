import { NextResponse } from "next/server";

import { settleExpiredAuctions } from "@/lib/market-settlement";

export async function POST() {
  try {
    const outcomes = await settleExpiredAuctions();
    const pendingCount = outcomes.filter(
      (outcome) =>
        outcome.status === "PENDING_TRANSFER"
    ).length;
    const settledCount =
      outcomes.length - pendingCount;

    return NextResponse.json({
      settledCount,
      pendingCount,
      outcomes,
    });
  } catch (error: unknown) {
    console.error(
      "Errore durante la chiusura delle aste:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile completare la chiusura delle aste scadute.",
      },
      {
        status: 500,
      }
    );
  }
}
