import { NextResponse } from "next/server";

import { synchronizePlayerSurnamesBatch } from "@/lib/player-name-synchronization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONFIRMATION = "refresh-surnames-20260915-v1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== CONFIRMATION) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await synchronizePlayerSurnamesBatch();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Errore durante l'aggiornamento dei cognomi:", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare i cognomi dei giocatori." },
      { status: 500 }
    );
  }
}
