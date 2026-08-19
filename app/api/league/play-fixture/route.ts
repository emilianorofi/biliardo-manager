import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";
import {
  playLeagueFixture,
  PlayLeagueFixtureError,
} from "@/lib/play-league-fixture";

export const dynamic = "force-dynamic";

type PlayFixtureBody = {
  fixtureId?: unknown;
};

export async function POST(request: NextRequest) {
  const access = await getApiClubAccess();

  if (!access.granted) {
    return access.response;
  }

  try {
    const body = (await request.json()) as PlayFixtureBody;
    const fixtureId = Number(body.fixtureId);

    if (!Number.isInteger(fixtureId) || fixtureId <= 0) {
      return NextResponse.json(
        {
          error:
            "fixtureId deve essere un numero intero positivo.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await playLeagueFixture({
      fixtureId,
      requestingClubId: access.clubId,
    });

    return NextResponse.json({
      message:
        "Partita giocata e percorso dei giocatori aggiornato.",
      ...result,
    });
  } catch (error) {
    if (error instanceof PlayLeagueFixtureError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "Errore durante la simulazione della partita:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile giocare e registrare la partita.",
      },
      {
        status: 500,
      }
    );
  }
}
