import { NextResponse } from "next/server";

import {
  getLeagueMatchDefinitions,
} from "@/lib/match-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches =
      getLeagueMatchDefinitions();

    return NextResponse.json({
      summary: {
        totalMatches:
          matches.length,

        totalSingles:
          matches.filter(
            (match) =>
              match.homeSlots
                .length === 1
          ).length,

        totalPairs:
          matches.filter(
            (match) =>
              match.homeSlots
                .length === 2
          ).length,
      },

      matches,
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento delle prove dell'incontro:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare le prove dell'incontro.",
      },
      {
        status: 500,
      }
    );
  }
}