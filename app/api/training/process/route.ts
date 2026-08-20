import { NextResponse } from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";

import { prisma } from "@/lib/prisma";

import {
  calculateTrainingGain,
  getTrainerEfficiency,
  getTrainingWeekKey,
  isTrainingFocus,
  type TrainingPlayerValues,
} from "@/lib/training-engine";
import {
  applyWeeklyDevelopment,
} from "@/lib/player-development";
import {
  calculateLeagueTrainingUsage,
} from "@/lib/training-usage";
import {
  loadWeeklyLeagueTrainingUsage,
} from "@/lib/weekly-league-training";

export const dynamic =
  "force-dynamic";

export async function POST() {
  try {
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
    const club =
      await prisma.club.findUnique({
        where: {
          id:
            clubId,
        },

        include: {
          players: {
            orderBy: [
              {
                lastName:
                  "asc",
              },
              {
                firstName:
                  "asc",
              },
            ],
          },

          trainingPlan:
            true,
        },
      });

    if (!club) {
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

    if (!club.trainingPlan) {
      return NextResponse.json(
        {
          error:
            "Devi prima salvare il programma di allenamento.",
        },
        {
          status: 400,
        }
      );
    }

    const primaryFocus =
      club.trainingPlan.primaryFocus;

    const secondaryFocus =
      club.trainingPlan.secondaryFocus;

    if (
      !isTrainingFocus(
        primaryFocus
      ) ||
      !isTrainingFocus(
        secondaryFocus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Il programma contiene una caratteristica non valida.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      primaryFocus ===
      secondaryFocus
    ) {
      return NextResponse.json(
        {
          error:
            "Il focus primario e quello secondario devono essere diversi.",
        },
        {
          status: 400,
        }
      );
    }

    const processedAt =
      new Date();

    const weekKey =
      getTrainingWeekKey(
        processedAt
      );

    const existingSession =
      await prisma.trainingSession.findUnique({
        where: {
          clubId_weekKey: {
            clubId:
              clubId,

            weekKey,
          },
        },
      });

    if (existingSession) {
      return NextResponse.json(
        {
          error:
            "L'allenamento di questa settimana è già stato elaborato.",

          weekKey,

          processedAt:
            existingSession
              .processedAt
              .toISOString(),
        },
        {
          status: 409,
        }
      );
    }

    const usageByPlayer =
      await loadWeeklyLeagueTrainingUsage(
        clubId,
        processedAt
      );
    const benchUsage =
      calculateLeagueTrainingUsage([]);

    const trainerEfficiency =
      getTrainerEfficiency(
        club.trainerLevel
      );

    const sessionResult =
      await prisma.$transaction(
        async (
          transaction
        ) => {
          const session =
            await transaction.trainingSession.create({
              data: {
                clubId:
                  clubId,

                weekKey,

                primaryFocus,
                secondaryFocus,

                trainerLevel:
                  club.trainerLevel,

                trainerEfficiency,
                processedAt,
              },
            });

          const results = [];

          for (
            const player of
              club.players
          ) {
            const playerUsage =
              usageByPlayer.get(
                player.id
              ) ?? benchUsage;
            const usage =
              playerUsage.label;
            const intensity =
              playerUsage.intensity;

            const currentValues: TrainingPlayerValues =
              {
                precisione:
                  player.precisione,

                diretto:
                  player.diretto,

                sponde:
                  player.sponde,

                tattica:
                  player.tattica,

                mentalita:
                  player.mentalita,

                difesa:
                  player.difesa,

                realizzazione:
                  player.realizzazione,

                creativita:
                  player.creativita,

                misura:
                  player.misura,
              };

            const primaryBefore =
              currentValues[
                primaryFocus
              ];

            const secondaryBefore =
              currentValues[
                secondaryFocus
              ];

            const primaryGain =
              calculateTrainingGain({
                age:
                  player.age,

                talent:
                  player.talent,

                currentValue:
                  primaryBefore,

                intensity,
                trainerEfficiency,

                focusWeight:
                  1,
              });

            const secondaryGain =
              calculateTrainingGain({
                age:
                  player.age,

                talent:
                  player.talent,

                currentValue:
                  secondaryBefore,

                intensity,
                trainerEfficiency,

                focusWeight:
                  0.5,
              });

            const development =
              applyWeeklyDevelopment({
                age:
                  player.age,

                talent:
                  player.talent,

                currentValues,

                gains: {
                  [primaryFocus]:
                    primaryGain,

                  [secondaryFocus]:
                    secondaryGain,
                },
              });
            const primaryDecline =
              development.declines[
                primaryFocus
              ];
            const secondaryDecline =
              development.declines[
                secondaryFocus
              ];
            const primaryAfter =
              development.values[
                primaryFocus
              ];
            const secondaryAfter =
              development.values[
                secondaryFocus
              ];
            const overallBefore =
              development.overallBefore;
            const overallDecline =
              development.overallDecline;
            const overallAfter =
              development.overallAfter;

            await transaction.player.update({
              where: {
                id:
                  player.id,
              },

              data:
                development.values,
            });

            const savedResult =
              await transaction.trainingResult.create({
                data: {
                  sessionId:
                    session.id,

                  playerId:
                    player.id,

                  playerFirstName:
                    player.firstName,

                  playerLastName:
                    player.lastName,

                  playerAge:
                    player.age,

                  usage,
                  intensity,

                  primaryBefore,
                  primaryGain,
                  primaryDecline,
                  primaryAfter,

                  secondaryBefore,
                  secondaryGain,
                  secondaryDecline,
                  secondaryAfter,

                  overallBefore,
                  overallDecline,
                  overallAfter,
                },
              });

            results.push({
              id:
                savedResult.id,

              playerId:
                player.id,

              firstName:
                player.firstName,

              lastName:
                player.lastName,

              usage,
              intensity,

              primaryBefore,
              primaryGain,
              primaryDecline,
              primaryAfter,

              secondaryBefore,
              secondaryGain,
              secondaryDecline,
              secondaryAfter,

              overallBefore,
              overallDecline,
              overallAfter,
            });
          }

          await transaction.trainingPlan.update({
            where: {
              clubId:
                clubId,
            },

            data: {
              lastProcessedAt:
                processedAt,
            },
          });

          await transaction.gameEvent.create({
            data: {
              clubId:
                clubId,

              type:
                "Allenamento",

              title:
                "Allenamento settimanale completato",

              description:
                `Focus primario: ${primaryFocus}. ` +
                `Focus secondario: ${secondaryFocus}. ` +
                `${results.length} giocatori aggiornati con crescita e calo settimanali.`,

              createdAt:
                processedAt,
            },
          });

          return {
            session,
            results,
          };
        }
      );

    return NextResponse.json({
      message:
        "Allenamento elaborato correttamente.",

      session: {
        id:
          sessionResult
            .session.id,

        weekKey,

        primaryFocus,
        secondaryFocus,

        trainerLevel:
          club.trainerLevel,

        trainerEfficiency,

        processedAt:
          processedAt
            .toISOString(),
      },

      results:
        sessionResult.results,
    });
  } catch (error) {
    console.error(
      "Errore durante l'elaborazione dell'allenamento:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile elaborare l'allenamento.",
      },
      {
        status: 500,
      }
    );
  }
}
