import type { Prisma } from "@/generated/prisma/client";

export type TournamentGrowthTier = "INDIVIDUAL" | "SPECIALTY_CUP" | "WORLD";

export type TournamentPlacement =
  | "WINNER"
  | "FINALIST"
  | "SEMI_FINAL"
  | "QUARTER_FINAL"
  | "ROUND_OF_16"
  | "ROUND_OF_32"
  | "ROUND_OF_64"
  | "ROUND_OF_128";

const TOURNAMENT_GROWTH: Record<
  TournamentGrowthTier,
  Record<TournamentPlacement, number>
> = {
  INDIVIDUAL: {
    WINNER: 0.30,
    FINALIST: 0.24,
    SEMI_FINAL: 0.20,
    QUARTER_FINAL: 0.17,
    ROUND_OF_16: 0.12,
    ROUND_OF_32: 0.08,
    ROUND_OF_64: 0.05,
    ROUND_OF_128: 0.03,
  },
  SPECIALTY_CUP: {
    WINNER: 0.40,
    FINALIST: 0.32,
    SEMI_FINAL: 0.28,
    QUARTER_FINAL: 0.24,
    ROUND_OF_16: 0.16,
    ROUND_OF_32: 0.11,
    ROUND_OF_64: 0.07,
    ROUND_OF_128: 0.04,
  },
  WORLD: {
    WINNER: 0.50,
    FINALIST: 0.40,
    SEMI_FINAL: 0.35,
    QUARTER_FINAL: 0.30,
    ROUND_OF_16: 0.20,
    ROUND_OF_32: 0.15,
    ROUND_OF_64: 0.10,
    ROUND_OF_128: 0.05,
  },
};

export function tournamentGrowthValue(
  tier: TournamentGrowthTier,
  placement: TournamentPlacement
) {
  return TOURNAMENT_GROWTH[tier][placement];
}

export async function applyTournamentGrowth(
  transaction: Prisma.TransactionClient,
  playerIds: number[],
  growth: number
) {
  if (growth <= 0 || playerIds.length === 0) return;

  await transaction.player.updateMany({
    where: { id: { in: playerIds } },
    data: {
      precisione: { increment: growth },
      diretto: { increment: growth },
      sponde: { increment: growth },
      tattica: { increment: growth },
      mentalita: { increment: growth },
      difesa: { increment: growth },
      realizzazione: { increment: growth },
      creativita: { increment: growth },
      misura: { increment: growth },
    },
  });
}

export function individualPlacementForElimination(stage: string) {
  switch (stage) {
    case "ROUND_OF_128":
      return "ROUND_OF_128" as const;
    case "ROUND_OF_64":
      return "ROUND_OF_64" as const;
    case "ROUND_OF_32":
      return "ROUND_OF_32" as const;
    case "ROUND_OF_16":
      return "ROUND_OF_16" as const;
    case "QUARTER_FINAL":
      return "QUARTER_FINAL" as const;
    case "SEMI_FINAL":
      return "SEMI_FINAL" as const;
    case "FINAL":
      return "FINALIST" as const;
    default:
      return null;
  }
}

export function specialtyCupPlacementForElimination(playersAtStart: number) {
  if (playersAtStart <= 2) return "FINALIST" as const;
  if (playersAtStart <= 4) return "SEMI_FINAL" as const;
  if (playersAtStart <= 8) return "QUARTER_FINAL" as const;
  if (playersAtStart <= 16) return "ROUND_OF_16" as const;
  if (playersAtStart <= 32) return "ROUND_OF_32" as const;
  if (playersAtStart <= 64) return "ROUND_OF_64" as const;
  if (playersAtStart <= 128) return "ROUND_OF_128" as const;
  return null;
}

export function nationsCupGrowthShare(
  placement: TournamentPlacement,
  usedPlayerCount: number
) {
  if (usedPlayerCount <= 0) return 0;
  return tournamentGrowthValue("WORLD", placement) / usedPlayerCount;
}
