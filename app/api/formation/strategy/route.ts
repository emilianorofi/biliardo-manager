import { NextResponse } from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";
import { processGameClock } from "@/lib/game-clock";
import {
  parseFormationStrategy,
  sanitizeFormationStrategy,
} from "@/lib/formation-strategy";
import {
  loadFormationStrategy,
  saveFormationStrategy,
} from "@/lib/formation-strategy-store";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const access = await getApiClubAccess();
    if (!access.granted) return access.response;

    const { clubId } = access;
    const [players, formation, storedStrategy] = await Promise.all([
      prisma.player.findMany({
        where: {
          clubId,
          careerStatus: "ACTIVE",
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nationality: true,
          age: true,
        },
      }),
      prisma.formation.findUnique({
        where: { clubId },
        select: {
          slotAPlayerId: true,
          slotBPlayerId: true,
          slotCPlayerId: true,
        },
      }),
      loadFormationStrategy(clubId),
    ]);

    const starterPlayerIds = [
      formation?.slotAPlayerId,
      formation?.slotBPlayerId,
      formation?.slotCPlayerId,
    ].filter((playerId): playerId is number => playerId !== null && playerId !== undefined);
    const validPlayerIds = new Set(players.map((player) => player.id));
    const strategy = sanitizeFormationStrategy(
      storedStrategy,
      starterPlayerIds,
      validPlayerIds
    );

    return NextResponse.json({
      players,
      starters: {
        A: formation?.slotAPlayerId ?? null,
        B: formation?.slotBPlayerId ?? null,
        C: formation?.slotCPlayerId ?? null,
      },
      strategy,
    });
  } catch (error) {
    console.error("Errore durante il caricamento di riserve e cambi:", error);
    return NextResponse.json(
      { error: "Impossibile caricare riserve e cambi programmati." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const access = await getApiClubAccess();
    if (!access.granted) return access.response;

    const { clubId } = access;
    const now = new Date();
    await processGameClock(now);

    const nextFixture = await prisma.leagueFixture.findFirst({
      where: {
        status: "SCHEDULED",
        league: {
          status: "ACTIVE",
          entries: { some: { clubId } },
        },
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
      },
      select: { scheduledAt: true },
      orderBy: { scheduledAt: "asc" },
    });
    const millisecondsToFixture = nextFixture
      ? nextFixture.scheduledAt.getTime() - now.getTime()
      : Number.POSITIVE_INFINITY;

    if (millisecondsToFixture <= 60 * 1000) {
      return NextResponse.json(
        {
          error:
            "Riserve e cambi sono bloccati insieme alla formazione nell'ultimo minuto prima della partita.",
        },
        { status: 409 }
      );
    }

    const [formation, activePlayers] = await Promise.all([
      prisma.formation.findUnique({
        where: { clubId },
        select: {
          slotAPlayerId: true,
          slotBPlayerId: true,
          slotCPlayerId: true,
        },
      }),
      prisma.player.findMany({
        where: {
          clubId,
          careerStatus: "ACTIVE",
        },
        select: { id: true },
      }),
    ]);

    if (
      !formation?.slotAPlayerId ||
      !formation.slotBPlayerId ||
      !formation.slotCPlayerId
    ) {
      return NextResponse.json(
        {
          error:
            "Salva prima i titolari A, B e C; poi puoi impostare riserve e cambi.",
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Dati di riserve e cambi non validi." },
        { status: 400 }
      );
    }

    const data = body as {
      reserves?: unknown;
      substitutions?: unknown;
    };
    const validPlayerIds = new Set(activePlayers.map((player) => player.id));
    const parsed = parseFormationStrategy({
      starterPlayerIds: [
        formation.slotAPlayerId,
        formation.slotBPlayerId,
        formation.slotCPlayerId,
      ],
      reservesInput: data.reserves,
      substitutionsInput: data.substitutions,
      validPlayerIds,
    });

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    await saveFormationStrategy(clubId, parsed.strategy, now);

    return NextResponse.json({
      message: "Riserve e cambi programmati salvati.",
      strategy: parsed.strategy,
      savedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Errore durante il salvataggio di riserve e cambi:", error);
    return NextResponse.json(
      { error: "Impossibile salvare riserve e cambi programmati." },
      { status: 500 }
    );
  }
}
