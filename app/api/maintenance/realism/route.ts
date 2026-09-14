import { NextResponse } from "next/server";

import { synchronizePlayerSurnamesBatch } from "@/lib/player-name-synchronization";
import { bootstrapWorld } from "@/lib/world-bootstrap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONFIRMATION = "realism-20260915-v1";
const NAME_BATCHES_PER_RUN = 4;
const NAME_BATCH_SIZE = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== CONFIRMATION) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const world = await bootstrapWorld();
    const nameRuns = [];

    for (let index = 0; index < NAME_BATCHES_PER_RUN; index += 1) {
      const result = await synchronizePlayerSurnamesBatch(NAME_BATCH_SIZE);
      nameRuns.push(result);
      if (result.remainingPlayers === 0 && result.remainingAcademyPlayers === 0) {
        break;
      }
    }

    const names = nameRuns[nameRuns.length - 1];
    return NextResponse.json({ success: true, world, names, nameRuns });
  } catch (error) {
    console.error("Errore durante il riallineamento realistico:", error);
    return NextResponse.json(
      { error: "Impossibile completare il riallineamento realistico." },
      { status: 500 }
    );
  }
}
