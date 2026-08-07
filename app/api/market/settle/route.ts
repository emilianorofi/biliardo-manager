import { NextResponse } from "next/server";

import { settleExpiredAuctions } from "@/lib/market-settlement";

export async function POST() {
  try {
    const outcomes = await settleExpiredAuctions();

    return NextResponse.json({
      settledCount: outcomes.length,
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
