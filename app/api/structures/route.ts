import { NextResponse } from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";
import {
  getClubStructures,
  startClubStructureUpgrade,
  type ClubStructureKind,
} from "@/lib/club-structures";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STRUCTURE_KINDS: ClubStructureKind[] = [
  "TRAINING_CENTER",
  "ACADEMY",
  "VENUE",
];

export async function GET() {
  const access = await getApiClubAccess();
  if (!access.granted) return access.response;

  try {
    const structures = await getClubStructures(access.clubId);
    return NextResponse.json({ structures });
  } catch (error) {
    console.error("Errore durante il caricamento delle strutture:", error);
    return NextResponse.json(
      { error: "Impossibile caricare le strutture." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const access = await getApiClubAccess();
  if (!access.granted) return access.response;

  try {
    const body = (await request.json()) as { kind?: unknown };
    if (
      typeof body.kind !== "string" ||
      !STRUCTURE_KINDS.includes(body.kind as ClubStructureKind)
    ) {
      return NextResponse.json(
        { error: "Struttura non valida." },
        { status: 400 }
      );
    }

    const upgrade = await startClubStructureUpgrade(
      access.clubId,
      body.kind as ClubStructureKind
    );
    const structures = await getClubStructures(access.clubId);

    return NextResponse.json({ upgrade, structures });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Impossibile avviare l'upgrade.";
    const status =
      message.includes("insufficiente") ||
      message.includes("saldo negativo") ||
      message.includes("già")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
