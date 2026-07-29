import { NextRequest, NextResponse } from "next/server";

import {
  calculateMatchWinProbabilities,
} from "@/lib/match-engine";

export const dynamic = "force-dynamic";

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
            "/api/league/win-probabilities?home=80&away=70",
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

    const probabilities =
      calculateMatchWinProbabilities(
        homePerformanceRating,
        awayPerformanceRating
      );

    return NextResponse.json({
      probabilities,
    });
  } catch (error) {
    console.error(
      "Errore durante il calcolo delle probabilità:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile calcolare le probabilità di vittoria.",
      },
      {
        status: 500,
      }
    );
  }
}