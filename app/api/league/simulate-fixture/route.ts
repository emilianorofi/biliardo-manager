import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  simulateLeagueFixture,
} from "@/lib/fixture-simulator";

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
            "Devi indicare i parametri home e away con 6 valori separati da virgole.",

          example:
            "/api/league/simulate-fixture?home=80,82,78,85,79,81&away=75,80,77,82,76,79",
        },
        {
          status: 400,
        }
      );
    }

    const homePerformanceRatings =
      parseNumberList(
        homeValue,
        "home"
      );

    const awayPerformanceRatings =
      parseNumberList(
        awayValue,
        "away"
      );

    const randomValues =
      randomValue === null
        ? undefined
        : parseNumberList(
            randomValue,
            "random"
          );

    const result =
      simulateLeagueFixture(
        homePerformanceRatings,
        awayPerformanceRatings,
        randomValues
      );

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error(
      "Errore durante la simulazione dell'incontro:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile simulare l'incontro.",
      },
      {
        status: 400,
      }
    );
  }
}

function parseNumberList(
  value: string,
  parameterName: string
) {
  const numbers =
    value
      .split(",")
      .map(
        (item) =>
          Number(
            item.trim()
          )
      );

  const containsInvalidValue =
    numbers.some(
      (number) =>
        !Number.isFinite(
          number
        )
    );

  if (
    containsInvalidValue
  ) {
    throw new Error(
      `Il parametro ${parameterName} contiene un valore non valido.`
    );
  }

  return numbers;
}