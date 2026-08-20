import { NextResponse } from "next/server";

import {
  getApiClubAccess,
} from "@/lib/api-club-access";
import {
  processGameClock,
} from "@/lib/game-clock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const access =
    await getApiClubAccess();

  if (!access.granted) {
    return access.response;
  }

  try {
    const result =
      await processGameClock();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Errore durante l'avanzamento automatico del gioco:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile aggiornare gli eventi automatici.",
      },
      {
        status: 500,
      }
    );
  }
}
