import {
  NextResponse,
} from "next/server";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

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
              "ACTIVE",
              "COMPLETED",
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
            orderBy: [
              {
                round: "asc",
              },
              {
                id: "asc",
              },
            ],

            select: {
              id: true,
              round: true,
              status: true,

              scheduledAt: true,
              playedAt: true,

              homeScore: true,
              awayScore: true,

              homeClub: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  city: true,
                },
              },

              awayClub: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  city: true,
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
            "Non esiste un campionato attivo.",
        },
        {
          status: 404,
        }
      );
    }

    const totalRounds =
      league.fixtures.reduce(
        (
          highestRound,
          fixture
        ) =>
          Math.max(
            highestRound,
            fixture.round
          ),
        0
      );

    const nextPlayableRound =
      getNextPlayableRound(
        league.currentRound,
        totalRounds
      );

    const fixtures =
      nextPlayableRound === null
        ? []
        : league.fixtures.filter(
            (fixture) =>
              fixture.round ===
              nextPlayableRound
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

        totalRounds,

        nextPlayableRound,

        isCompleted:
          nextPlayableRound === null,
      },

      fixtures:
        fixtures.map(
          (fixture) => ({
            id:
              fixture.id,

            round:
              fixture.round,

            status:
              fixture.status,

            scheduledAt:
              fixture.scheduledAt
                .toISOString(),

            playedAt:
              fixture.playedAt
                ? fixture.playedAt
                    .toISOString()
                : null,

            homeScore:
              fixture.homeScore,

            awayScore:
              fixture.awayScore,

            homeClub:
              fixture.homeClub,

            awayClub:
              fixture.awayClub,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento della giornata da giocare:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare la giornata da giocare.",
      },
      {
        status: 500,
      }
    );
  }
}