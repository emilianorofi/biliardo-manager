import { NextResponse } from "next/server";

import { synchronizePlayerSurnamesBatch } from "@/lib/player-name-synchronization";
import { bootstrapWorld } from "@/lib/world-bootstrap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONFIRMATION = "realism-20260915-v1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== CONFIRMATION) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const world = await bootstrapWorld();
    const names = await synchronizePlayerSurnamesBatch();

    return NextResponse.json({ success: true, world, names });
  } catch (error) {
    console.error("Errore durante il riallineamento realistico:", error);
    return NextResponse.json(
      { error: "Impossibile completare il riallineamento realistico." },
      { status: 500 }
    );
  }
}
