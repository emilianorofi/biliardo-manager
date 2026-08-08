import { NextResponse } from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

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
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
    const [
      databasePlayers,
      databaseFormation,
    ] = await Promise.all([
      prisma.player.findMany({
        where: {
          clubId:
            clubId,
        },

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
      }),

      prisma.formation.findUnique({
        where: {
          clubId:
            clubId,
        },
      }),
    ]);

    const players =
      databasePlayers.map(
        (player) => ({
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

          experience:
            player.experience,

          value:
            player.value,

          salary:
            player.salary,

          image:
            player.image,

          style:
            player.style,

          specialties: {
            italiana:
              Math.round(
                (
                  player.precisione +
                  player.diretto
                ) / 2
              ),

            goriziana:
              Math.round(
                (
                  player.precisione +
                  player.sponde
                ) / 2
              ),

            tuttiDoppi:
              Math.round(
                (
                  player.diretto +
                  player.sponde
                ) / 2
              ),
          },

          attributes: {
            precisione:
              Math.round(
                player.precisione
              ),

            diretto:
              Math.round(
                player.diretto
              ),

            sponde:
              Math.round(
                player.sponde
              ),

            tattica:
              Math.round(
                player.tattica
              ),

            mentalita:
              Math.round(
                player.mentalita
              ),

            difesa:
              Math.round(
                player.difesa
              ),

            realizzazione:
              Math.round(
                player.realizzazione
              ),

            creativita:
              Math.round(
                player.creativita
              ),

            misura:
              Math.round(
                player.misura
              ),
          },
        })
      );

    const formation = {
      slotAPlayerId:
        databaseFormation
          ?.slotAPlayerId ??
        null,

      slotBPlayerId:
        databaseFormation
          ?.slotBPlayerId ??
        null,

      slotCPlayerId:
        databaseFormation
          ?.slotCPlayerId ??
        null,

      savedAt:
        databaseFormation
          ?.savedAt
          ?.toISOString() ??
        null,
    };

    return NextResponse.json({
      players,
      formation,
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento della formazione:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare la formazione.",
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
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
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
            "Dati della formazione non validi.",
        },
        {
          status: 400,
        }
      );
    }

    const formationData =
      body as {
        slotAPlayerId?: unknown;
        slotBPlayerId?: unknown;
        slotCPlayerId?: unknown;
      };

    const slotAPlayerId =
      Number(
        formationData.slotAPlayerId
      );

    const slotBPlayerId =
      Number(
        formationData.slotBPlayerId
      );

    const slotCPlayerId =
      Number(
        formationData.slotCPlayerId
      );

    const selectedPlayerIds =
      [
        slotAPlayerId,
        slotBPlayerId,
        slotCPlayerId,
      ];

    const hasInvalidPlayerId =
      selectedPlayerIds.some(
        (playerId) =>
          !Number.isInteger(
            playerId
          ) ||
          playerId <= 0
      );

    if (
      hasInvalidPlayerId
    ) {
      return NextResponse.json(
        {
          error:
            "Devi selezionare un giocatore valido per gli slot A, B e C.",
        },
        {
          status: 400,
        }
      );
    }

    const uniquePlayerIds =
      new Set(
        selectedPlayerIds
      );

    if (
      uniquePlayerIds.size !==
      3
    ) {
      return NextResponse.json(
        {
          error:
            "Gli slot A, B e C devono contenere tre giocatori diversi.",
        },
        {
          status: 400,
        }
      );
    }

    const validPlayersCount =
      await prisma.player.count({
        where: {
          clubId:
            clubId,

          id: {
            in:
              selectedPlayerIds,
          },
        },
      });

    if (
      validPlayersCount !==
      3
    ) {
      return NextResponse.json(
        {
          error:
            "Uno o più giocatori selezionati non appartengono alla tua squadra.",
        },
        {
          status: 400,
        }
      );
    }

    const savedAt =
      new Date();

    const savedFormation =
      await prisma.formation.upsert({
        where: {
          clubId:
            clubId,
        },

        update: {
          slotAPlayerId,
          slotBPlayerId,
          slotCPlayerId,
          savedAt,
        },

        create: {
          clubId:
            clubId,

          slotAPlayerId,
          slotBPlayerId,
          slotCPlayerId,
          savedAt,
        },
      });

    return NextResponse.json({
      message:
        "Formazione salvata correttamente.",

      formation: {
        slotAPlayerId:
          savedFormation
            .slotAPlayerId,

        slotBPlayerId:
          savedFormation
            .slotBPlayerId,

        slotCPlayerId:
          savedFormation
            .slotCPlayerId,

        savedAt:
          savedFormation
            .savedAt
            ?.toISOString() ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Errore durante il salvataggio della formazione:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile salvare la formazione.",
      },
      {
        status: 500,
      }
    );
  }
}
