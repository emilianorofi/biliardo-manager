import { NextResponse } from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const MAX_SESSIONS = 10;

export async function GET() {
  try {
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
    const clubExists =
      await prisma.club.findUnique({
        where: {
          id:
            clubId,
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
            clubId,
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
