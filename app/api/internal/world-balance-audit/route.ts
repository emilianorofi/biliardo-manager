import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [players, clubs] = await Promise.all([
    prisma.player.findMany({
      where: { careerStatus: "ACTIVE" },
      select: {
        id: true,
        clubId: true,
        age: true,
        ageDays: true,
        talent: true,
        experience: true,
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
    }),
    prisma.club.findMany({
      select: {
        id: true,
        trainerLevel: true,
        youthCoachLevel: true,
        trainingPlan: {
          select: {
            primaryFocus: true,
            secondaryFocus: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    players,
    clubs,
  });
}
