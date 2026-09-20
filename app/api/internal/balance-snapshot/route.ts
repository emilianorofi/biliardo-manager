import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateOverall } from "@/lib/training-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const [players, clubs] = await Promise.all([
    prisma.player.findMany({
      where: { careerStatus: "ACTIVE" },
      select: {
        id: true, clubId: true, nationality: true, age: true, ageDays: true,
        talent: true, experience: true, precisione: true, diretto: true,
        sponde: true, tattica: true, mentalita: true, difesa: true,
        realizzazione: true, creativita: true, misura: true,
      },
    }),
    prisma.club.findMany({
      select: {
        id: true, trainerLevel: true, trainingCenterLevel: true,
        academyLevel: true,
        trainingPlan: { select: { primaryFocus: true, secondaryFocus: true } },
      },
    }),
  ]);

  const ranked = [...players].sort((a, b) => calculateOverall(b) - calculateOverall(a));
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    players,
    clubs,
    summary: {
      players: players.length,
      clubs: clubs.length,
      averageOverall: players.reduce((sum, p) => sum + calculateOverall(p), 0) / players.length,
      maxOverall: ranked.length ? calculateOverall(ranked[0]) : 0,
    },
  });
}
