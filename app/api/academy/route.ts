import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const databasePlayers =
      await prisma.academyPlayer.findMany({
        where: {
          clubId: 1,
        },
        orderBy: [
          {
            age: "desc",
          },
          {
            lastName: "asc",
          },
        ],
      });

    const players = databasePlayers.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      nationality: player.nationality,
      age: player.age,

      revealedAttributes: player.revealedAttributes,
      totalAttributes: player.totalAttributes,

      attributes: {
        precisione:
          player.precisione === null
            ? null
            : Math.round(player.precisione),

        diretto:
          player.diretto === null
            ? null
            : Math.round(player.diretto),

        sponde:
          player.sponde === null
            ? null
            : Math.round(player.sponde),

        tattica:
          player.tattica === null
            ? null
            : Math.round(player.tattica),

        mentalita:
          player.mentalita === null
            ? null
            : Math.round(player.mentalita),

        difesa:
          player.difesa === null
            ? null
            : Math.round(player.difesa),

        realizzazione:
          player.realizzazione === null
            ? null
            : Math.round(player.realizzazione),

        creativita:
          player.creativita === null
            ? null
            : Math.round(player.creativita),

        misura:
          player.misura === null
            ? null
            : Math.round(player.misura),
      },
    }));

    return NextResponse.json({
      players,
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento dell'Accademia:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare i giocatori dell'Accademia.",
      },
      {
        status: 500,
      }
    );
  }
}