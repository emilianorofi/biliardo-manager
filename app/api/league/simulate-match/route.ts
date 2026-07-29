import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  simulateMatchWinner,
} from "@/lib/match-simulator";

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

    const randomValue =
      searchParams.get("random");

    if (
      homeValue === null ||
      awayValue === null
    ) {
      return NextResponse.json(
        {
          error:
            "Devi indicare i parametri home e away.",

          example:
            "/api/league/simulate-match?home=80&away=70&random=0.42",
        },
        {
          status: 400,
        }
      );
    }

    const homePerformanceRating =
      Number(homeValue);

    const awayPerformanceRating =
      Number(awayValue);

    const selectedRandomValue =
      randomValue === null
        ? undefined
        : Number(randomValue);

    if (
      !Number.isFinite(
        homePerformanceRating
      ) ||
      !Number.isFinite(
        awayPerformanceRating
      )
    ) {
      return NextResponse.json(
        {
          error:
            "I valori home e away devono essere numeri validi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      selectedRandomValue !==
        undefined &&
      !Number.isFinite(
        selectedRandomValue
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Il valore random deve essere un numero valido compreso tra 0 e 1.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      simulateMatchWinner(
        homePerformanceRating,
        awayPerformanceRating,
        selectedRandomValue
      );

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error(
      "Errore durante la simulazione della prova:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile simulare la prova.",
      },
      {
        status: 400,
      }
    );
  }
}