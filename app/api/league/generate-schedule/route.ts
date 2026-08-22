import { NextResponse } from "next/server";

import { bootstrapWorld } from "@/lib/world-bootstrap";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await bootstrapWorld();

    return NextResponse.json(
      {
        message: "Calendari della piramide creati correttamente.",
        season: {
          id: result.seasonId,
          number: result.seasonNumber,
          status: result.seasonStatus,
        },
        summary: {
          leagues: result.totalLeagues,
          clubs: result.totalClubs,
          createdFixtures: result.createdFixtures,
        },
      },
      {
        status: result.createdFixtures > 0 ? 201 : 200,
      }
    );
  } catch (error) {
    console.error(
      "Errore durante la creazione dei calendari:",
      error
    );

    return NextResponse.json(
      {
        error: "Impossibile creare i calendari della piramide.",
      },
      {
        status: 500,
      }
    );
  }
}
