import {
  NextResponse,
} from "next/server";

import {
  createLeagueTable,
} from "@/lib/league-table";

import { getCurrentClubId } from "@/lib/current-club";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const clubId = await getCurrentClubId();
    const league =
      await prisma.league.findFirst({
        where: {
          status: {
            in: [
              "PREPARATION",
              "ACTIVE",
              "COMPLETED",
            ],
          },
          entries: {
            some: {
              clubId,
            },
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

          season: {
            select: {
              id: true,
              number: true,
              name: true,
              status: true,
            },
          },

          entries: {
            select: {
              clubId: true,

              played: true,
              won: true,
              drawn: true,
              lost: true,

              pointsFor: true,
              pointsAgainst: true,
              points: true,

              club: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!league) {
      return NextResponse.json(
        {
          error:
            "Non esiste un campionato da mostrare.",
        },
        {
          status: 404,
        }
      );
    }

    const table =
      createLeagueTable(
        league.entries.map(
          (entry) => ({
            clubId:
              entry.clubId,

            clubName:
              entry.club.name,

            played:
              entry.played,

            won:
              entry.won,

            drawn:
              entry.drawn,

            lost:
              entry.lost,

            pointsFor:
              entry.pointsFor,

            pointsAgainst:
              entry.pointsAgainst,

            points:
              entry.points,
          })
        )
      );

    return NextResponse.json({
      season:
        league.season,

      league: {
        id:
          league.id,

        name:
          league.name,

        status:
          league.status,

        currentRound:
          league.currentRound,
      },

      table,
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento della classifica:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare la classifica.",
      },
      {
        status: 500,
      }
    );
  }
}
