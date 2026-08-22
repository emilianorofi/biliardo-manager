import { NextResponse } from "next/server";

import { bootstrapWorld } from "@/lib/world-bootstrap";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await bootstrapWorld();

    return NextResponse.json(
      {
        message: "Piramide iniziale creata correttamente.",
        season: {
          id: result.seasonId,
          number: result.seasonNumber,
          status: result.seasonStatus,
        },
        summary: {
          clubs: result.totalClubs,
          players: result.totalClubPlayers,
          leagues: result.totalLeagues,
          createdClubs: result.createdClubs,
          createdPlayers: result.createdPlayers,
          createdLeagues: result.createdLeagues,
          createdFixtures: result.createdFixtures,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Errore durante la creazione della piramide:", error);

    return NextResponse.json(
      {
        error: "Impossibile creare la piramide iniziale.",
      },
      {
        status: 500,
      }
    );
  }
}
