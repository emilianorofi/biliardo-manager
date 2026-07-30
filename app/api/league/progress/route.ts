import {
  NextResponse,
} from "next/server";

import {
  calculateCompletedRound,
} from "@/lib/league-progress";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const league =
      await prisma.league.findFirst({
        where: {
          status: {
            in: [
              "PREPARATION",
              "ACTIVE",
            ],
          },
        },

        orderBy: {
          id: "desc",
        },

        select: {
          id: true,
          name: true,
          status: true,
          currentRound: true,

          fixtures: {
            select: {
              round: true,
              status: true,
            },

            orderBy: [
              {
                round: "asc",
              },
              {
                id: "asc",
              },
            ],
          },
        },
      });

    if (!league) {
      return NextResponse.json(
        {
          error:
            "Non esiste un campionato attuale.",
        },
        {
          status: 404,
        }
      );
    }

    const completedRound =
      calculateCompletedRound(
        league.fixtures
      );

    return NextResponse.json({
      league: {
        id:
          league.id,

        name:
          league.name,

        status:
          league.status,

        currentRound:
          league.currentRound,

        completedRound,
      },

      summary: {
        totalFixtures:
          league.fixtures.length,

        playedFixtures:
          league.fixtures.filter(
            (fixture) =>
              fixture.status ===
              "PLAYED"
          ).length,
      },
    });
  } catch (error) {
    console.error(
      "Errore durante il controllo dell'avanzamento del campionato:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile controllare l'avanzamento del campionato.",
      },
      {
        status: 500,
      }
    );
  }
}