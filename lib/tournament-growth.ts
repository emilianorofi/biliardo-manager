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

export type TournamentGrowthSpecialty =
  | "ITALIANA"
  | "GORIZIANA"
  | "TUTTI_DOPPI"
  | null;

type GrowthSkill =
  | "precisione"
  | "diretto"
  | "sponde"
  | "tattica"
  | "mentalita"
  | "difesa"
  | "realizzazione"
  | "creativita"
  | "misura";

const GROWTH_SKILLS: GrowthSkill[] = [
  "precisione",
  "diretto",
  "sponde",
  "tattica",
  "mentalita",
  "difesa",
  "realizzazione",
  "creativita",
  "misura",
];

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

const SPECIALTY_CORE_SKILLS: Record<
  Exclude<TournamentGrowthSpecialty, null>,
  readonly [GrowthSkill, GrowthSkill]
> = {
  ITALIANA: ["precisione", "diretto"],
  GORIZIANA: ["precisione", "sponde"],
  TUTTI_DOPPI: ["diretto", "sponde"],
};

const COMPLEMENTARY_SKILLS: readonly GrowthSkill[] = [
  "tattica",
  "realizzazione",
  "misura",
];

/**
 * Moltiplicatore anti-inflazione applicato alla singola caratteristica.
 *
 * Le skill basse recuperano piu velocemente; da 90 in poi la crescita
 * rallenta progressivamente. Sopra 100 resta possibile crescere, ma
 * soltanto in modo marginale.
 */
export function getTournamentSkillGrowthMultiplier(currentValue: number) {
  if (currentValue < 60) return 1.2;
  if (currentValue < 70) return 1.1;
  if (currentValue < 80) return 1;
  if (currentValue < 90) return 0.8;
  if (currentValue < 95) return 0.55;
  if (currentValue < 100) return 0.3;
  if (currentValue < 105) return 0.12;
  return 0.05;
}

/**
 * Distribuisce il premio mantenendo invariato il budget complessivo
 * equivalente al vecchio +growth su tutte le 9 skill.
 *
 * Specialita:
 * - 50% alle 2 skill principali;
 * - 30% a Tattica, Realizzazione e Misura;
 * - 20% alle 4 skill rimanenti.
 *
 * Mondiale/Coppa Nazioni (specialty=null): distribuzione uniforme.
 */
export function getTournamentSkillBaseGrowth(
  growth: number,
  specialty: TournamentGrowthSpecialty
): Record<GrowthSkill, number> {
  if (!specialty) {
    return Object.fromEntries(
      GROWTH_SKILLS.map((skill) => [skill, growth])
    ) as Record<GrowthSkill, number>;
  }

  const totalBudget = growth * GROWTH_SKILLS.length;
  const core = new Set<GrowthSkill>(SPECIALTY_CORE_SKILLS[specialty]);
  const complementary = new Set<GrowthSkill>(COMPLEMENTARY_SKILLS);
  const remainder = GROWTH_SKILLS.filter(
    (skill) => !core.has(skill) && !complementary.has(skill)
  );

  const coreGain = (totalBudget * 0.5) / core.size;
  const complementaryGain =
    (totalBudget * 0.3) / complementary.size;
  const remainderGain = (totalBudget * 0.2) / remainder.length;

  return Object.fromEntries(
    GROWTH_SKILLS.map((skill) => [
      skill,
      core.has(skill)
        ? coreGain
        : complementary.has(skill)
          ? complementaryGain
          : remainderGain,
    ])
  ) as Record<GrowthSkill, number>;
}

export function calculateTournamentSkillGrowth({
  currentValue,
  growth,
  specialty,
  skill,
}: {
  currentValue: number;
  growth: number;
  specialty: TournamentGrowthSpecialty;
  skill: GrowthSkill;
}) {
  const baseGrowth = getTournamentSkillBaseGrowth(growth, specialty)[skill];
  return roundToFourDecimals(
    baseGrowth * getTournamentSkillGrowthMultiplier(currentValue)
  );
}

export function tournamentGrowthValue(
  tier: TournamentGrowthTier,
  placement: TournamentPlacement
) {
  return TOURNAMENT_GROWTH[tier][placement];
}

export async function applyTournamentGrowth(
  transaction: Prisma.TransactionClient,
  playerIds: number[],
  growth: number,
  specialty: TournamentGrowthSpecialty = null
) {
  if (growth <= 0 || playerIds.length === 0) return;

  const uniqueIds = [...new Set(playerIds)].filter(Number.isInteger);
  if (uniqueIds.length === 0) return;

  const players = await transaction.player.findMany({
    where: {
      id: {
        in: uniqueIds,
      },
    },
    select: {
      id: true,
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

  for (const player of players) {
    const updates = Object.fromEntries(
      GROWTH_SKILLS.map((skill) => [
        skill,
        roundToThreeDecimals(
          player[skill] +
            calculateTournamentSkillGrowth({
              currentValue: player[skill],
              growth,
              specialty,
              skill,
            })
        ),
      ])
    );

    await transaction.player.update({
      where: {
        id: player.id,
      },
      data: updates,
    });
  }
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

function roundToThreeDecimals(value: number) {
  return Math.round(value * 1000) / 1000;
}

function roundToFourDecimals(value: number) {
  return Math.round(value * 10000) / 10000;
}
