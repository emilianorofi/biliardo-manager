import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculatePlayerWeeklySalary } from "@/lib/economy-rules";
import { calculateOverall } from "@/lib/training-engine";
import {
  CLUBS_PER_LEAGUE,
  TOTAL_WORLD_LEAGUES,
} from "@/lib/world-structure";

export const dynamic = "force-dynamic";

const REQUIRED_FIXTURES =
  CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1);

export async function POST() {
  try {
    const season = await prisma.season.findFirst({
      where: {
        status: "PREPARATION",
      },
      orderBy: {
        number: "desc",
      },
      include: {
        leagues: {
          orderBy: [
            { level: "asc" },
            { groupCode: "asc" },
          ],
          include: {
            _count: {
              select: {
                entries: true,
                fixtures: true,
              },
            },
          },
        },
      },
    });

    if (!season) {
      const activeSeason = await prisma.season.findFirst({
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          number: "desc",
        },
        select: {
          id: true,
        },
      });

      return NextResponse.json(
        {
          error: activeSeason
            ? "La stagione è già attiva."
            : "Non esiste una stagione in preparazione.",
        },
        {
          status: activeSeason ? 409 : 404,
        }
      );
    }

    if (season.leagues.length !== TOTAL_WORLD_LEAGUES) {
      return NextResponse.json(
        {
          error: `La piramide deve contenere ${TOTAL_WORLD_LEAGUES} campionati.`,
          leaguesFound: season.leagues.length,
        },
        { status: 400 }
      );
    }

    const incompleteLeague = season.leagues.find(
      (league) =>
        league._count.entries !== CLUBS_PER_LEAGUE ||
        league._count.fixtures !== REQUIRED_FIXTURES
    );

    if (incompleteLeague) {
      return NextResponse.json(
        {
          error: `${incompleteLeague.name} non è completo.`,
          clubsFound: incompleteLeague._count.entries,
          fixturesFound: incompleteLeague._count.fixtures,
        },
        { status: 400 }
      );
    }

    const salaryRefresh = await prisma.$transaction(async (transaction) => {
      const players = await transaction.player.findMany({
        where: {
          careerStatus: "ACTIVE",
          clubId: { not: null },
        },
        select: {
          id: true,
          salary: true,
          precisione: true,
          diretto: true,
          sponde: true,
          tattica: true,
          mentalita: true,
          difesa: true,
          realizzazione: true,
          creativita: true,
          misura: true,
        },
      });

      let updatedPlayers = 0;

      for (const player of players) {
        const salary = calculatePlayerWeeklySalary(calculateOverall(player));

        if (salary === player.salary) {
          continue;
        }

        await transaction.player.update({
          where: { id: player.id },
          data: { salary },
        });
        updatedPlayers += 1;
      }

      await transaction.season.update({
        where: {
          id: season.id,
        },
        data: {
          status: "ACTIVE",
        },
      });
      await transaction.league.updateMany({
        where: {
          seasonId: season.id,
        },
        data: {
          status: "ACTIVE",
          currentRound: 0,
        },
      });

      return {
        players: players.length,
        updatedPlayers,
      };
    });

    return NextResponse.json({
      message: "Piramide e stagione avviate correttamente.",
      season: {
        id: season.id,
        number: season.number,
        name: season.name,
        status: "ACTIVE",
        startsAt: season.startsAt?.toISOString() ?? null,
        endsAt: season.endsAt?.toISOString() ?? null,
      },
      summary: {
        leagues: season.leagues.length,
        clubs: season.leagues.length * CLUBS_PER_LEAGUE,
        fixtures: season.leagues.length * REQUIRED_FIXTURES,
        salariesChecked: salaryRefresh.players,
        salariesUpdated: salaryRefresh.updatedPlayers,
      },
    });
  } catch (error) {
    console.error("Errore durante l'avvio della stagione:", error);

    return NextResponse.json(
      {
        error: "Impossibile avviare la stagione.",
      },
      {
        status: 500,
      }
    );
  }
}
