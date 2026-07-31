import { NextResponse } from "next/server";

import {
  USER_CLUB_ID,
} from "@/lib/game-config";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const MAX_SESSIONS = 10;

export async function GET() {
  try {
    const clubExists =
      await prisma.club.findUnique({
        where: {
          id:
            USER_CLUB_ID,
        },

        select: {
          id:
            true,
        },
      });

    if (!clubExists) {
      return NextResponse.json(
        {
          error:
            "Club non trovato.",
        },
        {
          status: 404,
        }
      );
    }

    const sessions =
      await prisma.trainingSession.findMany({
        where: {
          clubId:
            USER_CLUB_ID,
        },

        orderBy: {
          processedAt:
            "desc",
        },

        take:
          MAX_SESSIONS,

        include: {
          results: {
            orderBy: [
              {
                playerLastName:
                  "asc",
              },
              {
                playerFirstName:
                  "asc",
              },
            ],
          },
        },
      });

    return NextResponse.json({
      sessions:
        sessions.map(
          (session) => ({
            id:
              session.id,

            weekKey:
              session.weekKey,

            primaryFocus:
              session.primaryFocus,

            secondaryFocus:
              session.secondaryFocus,

            trainerLevel:
              session.trainerLevel,

            trainerEfficiency:
              session.trainerEfficiency,

            processedAt:
              session.processedAt
                .toISOString(),

            results:
              session.results.map(
                (result) => ({
                  id:
                    result.id,

                  playerId:
                    result.playerId,

                  firstName:
                    result.playerFirstName,

                  lastName:
                    result.playerLastName,

                  age:
                    result.playerAge,

                  usage:
                    result.usage,

                  intensity:
                    result.intensity,

                  primaryBefore:
                    result.primaryBefore,

                  primaryGain:
                    result.primaryGain,

                  primaryAfter:
                    result.primaryAfter,

                  secondaryBefore:
                    result.secondaryBefore,

                  secondaryGain:
                    result.secondaryGain,

                  secondaryAfter:
                    result.secondaryAfter,

                  overallBefore:
                    result.overallBefore,

                  overallAfter:
                    result.overallAfter,
                })
              ),
          })
        ),
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento dello storico allenamenti:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare lo storico degli allenamenti.",
      },
      {
        status: 500,
      }
    );
  }
}