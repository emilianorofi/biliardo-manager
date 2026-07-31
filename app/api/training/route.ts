import { NextResponse } from "next/server";

import {
  USER_CLUB_ID,
} from "@/lib/game-config";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const VALID_FOCUSES = [
  "precisione",
  "diretto",
  "sponde",
  "tattica",
  "mentalita",
  "difesa",
  "realizzazione",
  "creativita",
  "misura",
] as const;

type TrainingFocus =
  (typeof VALID_FOCUSES)[number];

function isTrainingFocus(
  value: unknown
): value is TrainingFocus {
  return (
    typeof value === "string" &&
    VALID_FOCUSES.includes(
      value as TrainingFocus
    )
  );
}

function getTrainerEfficiency(
  trainerLevel: number
) {
  const efficiencies: Record<
    number,
    number
  > = {
    1: 60,
    2: 70,
    3: 80,
    4: 90,
    5: 100,
  };

  return (
    efficiencies[
      trainerLevel
    ] ?? 60
  );
}

function calculateOverall(player: {
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
}) {
  const total =
    player.precisione +
    player.diretto +
    player.sponde +
    player.tattica +
    player.mentalita +
    player.difesa +
    player.realizzazione +
    player.creativita +
    player.misura;

  return Math.round(
    total / 9
  );
}

export async function GET() {
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

          trainingPlan:
            true,

          formation:
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

    const selectedPlayerIds =
      new Set(
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

    const players =
      club.players.map(
        (player) => {
          const isSelected =
            selectedPlayerIds.has(
              player.id
            );

          return {
            id:
              player.id,

            firstName:
              player.firstName,

            lastName:
              player.lastName,

            nationality:
              player.nationality,

            age:
              player.age,

            overall:
              calculateOverall(
                player
              ),

            form:
              player.form,

            morale:
              player.morale,

            usage:
              isSelected
                ? "Singolo + 2 coppie"
                : "Panchina",

            intensity:
              isSelected
                ? 100
                : 15,

            formationSlot:
              club.formation
                ?.slotAPlayerId ===
              player.id
                ? "A"
                : club.formation
                      ?.slotBPlayerId ===
                    player.id
                  ? "B"
                  : club.formation
                        ?.slotCPlayerId ===
                      player.id
                    ? "C"
                    : null,
          };
        }
      );

    const trainingPlan = {
      primaryFocus:
        club.trainingPlan
          ?.primaryFocus ??
        "precisione",

      secondaryFocus:
        club.trainingPlan
          ?.secondaryFocus ??
        "tattica",

      savedAt:
        club.trainingPlan
          ?.savedAt
          ?.toISOString() ??
        null,

      lastProcessedAt:
        club.trainingPlan
          ?.lastProcessedAt
          ?.toISOString() ??
        null,
    };

    return NextResponse.json({
      players,

      trainer: {
        level:
          club.trainerLevel,

        efficiency:
          getTrainerEfficiency(
            club.trainerLevel
          ),
      },

      trainingPlan,

      formation: {
        slotAPlayerId:
          club.formation
            ?.slotAPlayerId ??
          null,

        slotBPlayerId:
          club.formation
            ?.slotBPlayerId ??
          null,

        slotCPlayerId:
          club.formation
            ?.slotCPlayerId ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento dell'allenamento:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare il programma di allenamento.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body: unknown =
      await request.json();

    if (
      typeof body !==
        "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error:
            "Dati dell'allenamento non validi.",
        },
        {
          status: 400,
        }
      );
    }

    const trainingData =
      body as {
        primaryFocus?: unknown;
        secondaryFocus?: unknown;
      };

    const primaryFocus =
      trainingData.primaryFocus;

    const secondaryFocus =
      trainingData.secondaryFocus;

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
            "Una delle caratteristiche selezionate non è valida.",
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

    const savedAt =
      new Date();

    const trainingPlan =
      await prisma.trainingPlan.upsert({
        where: {
          clubId:
            USER_CLUB_ID,
        },

        update: {
          primaryFocus,
          secondaryFocus,
          savedAt,
        },

        create: {
          clubId:
            USER_CLUB_ID,

          primaryFocus,
          secondaryFocus,
          savedAt,
        },
      });

    return NextResponse.json({
      message:
        "Programma di allenamento salvato correttamente.",

      trainingPlan: {
        primaryFocus:
          trainingPlan
            .primaryFocus,

        secondaryFocus:
          trainingPlan
            .secondaryFocus,

        savedAt:
          trainingPlan
            .savedAt
            ?.toISOString() ??
          null,

        lastProcessedAt:
          trainingPlan
            .lastProcessedAt
            ?.toISOString() ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Errore durante il salvataggio dell'allenamento:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile salvare il programma di allenamento.",
      },
      {
        status: 500,
      }
    );
  }
}