import { NextResponse } from "next/server";

import {
  USER_CLUB_ID,
} from "@/lib/game-config";

import { prisma } from "@/lib/prisma";

import {
  applyTrainingGain,
  calculateOverall,
  calculateTrainingGain,
  getTrainerEfficiency,
  getTrainingWeekKey,
  isTrainingFocus,
  type TrainingPlayerValues,
} from "@/lib/training-engine";

export const dynamic =
  "force-dynamic";

export async function POST() {
  try {
    const club =
      await prisma.club.findUnique({
        where: {
          id:
            USER_CLUB_ID,
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

          formation:
            true,

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
              USER_CLUB_ID,

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

    const selectedPlayerIds =
      new Set<number>(
        [
          club.formation
            ?.slotAPlayerId,

          club.formation
            ?.slotBPlayerId,

          club.formation
            ?.slotCPlayerId,
        ].filter(
          (
            playerId
          ): playerId is number =>
            playerId !== null &&
            playerId !== undefined
        )
      );

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
                  USER_CLUB_ID,

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
            const isSelected =
              selectedPlayerIds.has(
                player.id
              );

            const usage =
              isSelected
                ? "Singolo + 2 coppie"
                : "Panchina";

            const intensity =
              isSelected
                ? 100
                : 15;

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

            const overallBefore =
              calculateOverall(
                currentValues
              );

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

                potential:
                  player.potential,

                currentOverall:
                  overallBefore,

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

                potential:
                  player.potential,

                currentOverall:
                  overallBefore,

                intensity,
                trainerEfficiency,

                focusWeight:
                  0.5,
              });

            const primaryAfter =
              applyTrainingGain(
                primaryBefore,
                primaryGain
              );

            const secondaryAfter =
              applyTrainingGain(
                secondaryBefore,
                secondaryGain
              );

            const trainedValues: TrainingPlayerValues =
              {
                ...currentValues,
              };

            trainedValues[
              primaryFocus
            ] = primaryAfter;

            trainedValues[
              secondaryFocus
            ] = secondaryAfter;

            const overallAfter =
              calculateOverall(
                trainedValues
              );

            const playerUpdate: Partial<TrainingPlayerValues> =
              {};

            playerUpdate[
              primaryFocus
            ] = primaryAfter;

            playerUpdate[
              secondaryFocus
            ] = secondaryAfter;

            await transaction.player.update({
              where: {
                id:
                  player.id,
              },

              data:
                playerUpdate,
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
                  primaryAfter,

                  secondaryBefore,
                  secondaryGain,
                  secondaryAfter,

                  overallBefore,
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
              primaryAfter,

              secondaryBefore,
              secondaryGain,
              secondaryAfter,

              overallBefore,
              overallAfter,
            });
          }

          await transaction.trainingPlan.update({
            where: {
              clubId:
                USER_CLUB_ID,
            },

            data: {
              lastProcessedAt:
                processedAt,
            },
          });

          await transaction.gameEvent.create({
            data: {
              clubId:
                USER_CLUB_ID,

              type:
                "Allenamento",

              title:
                "Allenamento settimanale completato",

              description:
                `Focus primario: ${primaryFocus}. ` +
                `Focus secondario: ${secondaryFocus}. ` +
                `${results.length} giocatori allenati.`,

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