import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  calculateFixtureStandingsDeltas,
} from "@/lib/league-standings";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const homeValue =
      searchParams.get("home");

    const awayValue =
      searchParams.get("away");

    if (
      homeValue === null ||
      awayValue === null
    ) {
      return NextResponse.json(
        {
          error:
            "Devi indicare i parametri home e away.",

          example:
            "/api/league/standings-deltas?home=5&away=1",
        },
        {
          status: 400,
        }
      );
    }

    const homeScore =
      Number(homeValue);

    const awayScore =
      Number(awayValue);

    const deltas =
      calculateFixtureStandingsDeltas(
        homeScore,
        awayScore
      );

    return NextResponse.json({
      result: {
        homeScore,
        awayScore,
        deltas,
      },
    });
  } catch (error) {
    console.error(
      "Errore durante il calcolo della classifica:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile calcolare gli aggiornamenti della classifica.",
      },
      {
        status: 400,
      }
    );
  }
}