import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  processGameClock,
} from "@/lib/game-clock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;
  const isAuthorized =
    Boolean(cronSecret) &&
    request.headers.get(
      "authorization"
    ) === `Bearer ${cronSecret}`;

  if (!isAuthorized) {
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
    const result =
      await processGameClock();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Errore nel cronometro automatico:",
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
