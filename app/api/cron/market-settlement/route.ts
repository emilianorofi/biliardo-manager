import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { processGameClock } from "@/lib/live-game-clock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  return (
    Boolean(cronSecret) &&
    request.headers.get("authorization") === `Bearer ${cronSecret}`
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Accesso non autorizzato." },
      { status: 401 }
    );
  }

  try {
    const result = await processGameClock();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error(
      "Errore durante l'avanzamento automatico del gioco:",
      error
    );
    return NextResponse.json(
      { error: "Impossibile aggiornare gli eventi automatici." },
      { status: 500 }
    );
  }
}
