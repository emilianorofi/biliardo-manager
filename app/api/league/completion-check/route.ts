import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  calculateLeagueCompletion,
} from "@/lib/league-completion";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const completedValue =
      searchParams.get(
        "completed"
      );

    const totalValue =
      searchParams.get(
        "total"
      );

    if (
      completedValue === null
    ) {
      return NextResponse.json(
        {
          error:
            "Devi indicare il parametro completed.",

          example:
            "/api/league/completion-check?completed=14",
        },
        {
          status: 400,
        }
      );
    }

    const completedRound =
      Number(
        completedValue
      );

    const totalRounds =
      totalValue === null
        ? 14
        : Number(
            totalValue
          );

    const result =
      calculateLeagueCompletion(
        completedRound,
        totalRounds
      );

    return NextResponse.json({
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile controllare la conclusione del campionato.",
      },
      {
        status: 400,
      }
    );
  }
}