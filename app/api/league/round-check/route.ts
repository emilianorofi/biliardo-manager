import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getNextPlayableRound,
  validateFixtureRound,
} from "@/lib/league-round";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const currentValue =
      searchParams.get(
        "current"
      );

    const fixtureValue =
      searchParams.get(
        "fixture"
      );

    const totalValue =
      searchParams.get(
        "total"
      );

    if (
      currentValue === null ||
      fixtureValue === null
    ) {
      return NextResponse.json(
        {
          error:
            "Devi indicare i parametri current e fixture.",

          example:
            "/api/league/round-check?current=1&fixture=2",
        },
        {
          status: 400,
        }
      );
    }

    const currentRound =
      Number(
        currentValue
      );

    const fixtureRound =
      Number(
        fixtureValue
      );

    const totalRounds =
      totalValue === null
        ? 14
        : Number(
            totalValue
          );

    validateFixtureRound(
      currentRound,
      fixtureRound,
      totalRounds
    );

    const nextPlayableRound =
      getNextPlayableRound(
        currentRound,
        totalRounds
      );

    return NextResponse.json({
      result: {
        currentRound,
        fixtureRound,
        totalRounds,
        nextPlayableRound,
        playable: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile controllare la giornata.",
      },
      {
        status: 400,
      }
    );
  }
}