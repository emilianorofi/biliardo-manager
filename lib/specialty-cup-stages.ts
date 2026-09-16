import { addRomeDaysAtTime } from "@/lib/rome-calendar";

export const SPECIALTY_CUP_GROWTH_BY_STAGE: Record<string, number> = {
  "64ESIMI": 0.02,
  "32ESIMI": 0.05,
  "16ESIMI": 0.08,
  "OTTAVI": 0.11,
  "QUARTI": 0.14,
  "SEMIFINALE": 0.17,
  "FINALE": 0.20,
  "VINCITORE": 0.23,
};

const STANDARD_STAGE_SLOTS = [
  { dayOffset: 0, hour: 11, minute: 0 },
  { dayOffset: 0, hour: 14, minute: 0 },
  { dayOffset: 0, hour: 17, minute: 0 },
  { dayOffset: 1, hour: 10, minute: 0 },
  { dayOffset: 1, hour: 12, minute: 0 },
  { dayOffset: 1, hour: 14, minute: 0 },
  { dayOffset: 1, hour: 16, minute: 0 },
] as const;

const EXTENDED_STAGE_SLOTS = [
  { dayOffset: 0, hour: 10, minute: 15 },
  { dayOffset: 0, hour: 11, minute: 0 },
  { dayOffset: 0, hour: 12, minute: 0 },
  { dayOffset: 0, hour: 14, minute: 0 },
  { dayOffset: 0, hour: 17, minute: 0 },
  { dayOffset: 1, hour: 9, minute: 0 },
  { dayOffset: 1, hour: 10, minute: 30 },
  { dayOffset: 1, hour: 12, minute: 0 },
  { dayOffset: 1, hour: 14, minute: 0 },
  { dayOffset: 1, hour: 16, minute: 0 },
] as const;

export type SpecialtyCupStage = {
  order: number;
  key: string;
  label: string;
  playersAtStart: number;
  scheduledAt: Date;
};

export function buildSpecialtyCupStages(
  drawAt: Date,
  bracketSize: number
): SpecialtyCupStage[] {
  const rounds = Math.log2(bracketSize);

  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 10) {
    throw new Error("Tabellone Coppa Specialità non supportato.");
  }

  const slots =
    rounds <= STANDARD_STAGE_SLOTS.length
      ? STANDARD_STAGE_SLOTS.slice(STANDARD_STAGE_SLOTS.length - rounds)
      : EXTENDED_STAGE_SLOTS.slice(EXTENDED_STAGE_SLOTS.length - rounds);

  return slots.map((slot, index) => {
    const playersAtStart = bracketSize / 2 ** index;
    return {
      order: index + 1,
      key: stageKey(playersAtStart),
      label: stageLabel(playersAtStart),
      playersAtStart,
      scheduledAt: addRomeDaysAtTime(
        drawAt,
        slot.dayOffset,
        slot.hour,
        slot.minute
      ),
    };
  });
}

export function specialtyCupGrowthForElimination(playersAtStart: number) {
  return SPECIALTY_CUP_GROWTH_BY_STAGE[stageKey(playersAtStart)] ?? 0;
}

export function specialtyCupWinnerGrowth() {
  return SPECIALTY_CUP_GROWTH_BY_STAGE.VINCITORE;
}

function stageKey(playersAtStart: number) {
  if (playersAtStart === 2) return "FINALE";
  if (playersAtStart === 4) return "SEMIFINALE";
  if (playersAtStart === 8) return "QUARTI";
  if (playersAtStart === 16) return "OTTAVI";
  if (playersAtStart === 32) return "16ESIMI";
  if (playersAtStart === 64) return "32ESIMI";
  if (playersAtStart === 128) return "64ESIMI";
  return `TURNO_${playersAtStart}`;
}

function stageLabel(playersAtStart: number) {
  const labels: Record<string, string> = {
    FINALE: "Finale",
    SEMIFINALE: "Semifinale",
    QUARTI: "Quarti di finale",
    OTTAVI: "Ottavi di finale",
    "16ESIMI": "Sedicesimi",
    "32ESIMI": "Trentaduesimi",
    "64ESIMI": "Sessantaquattresimi",
  };
  const key = stageKey(playersAtStart);
  return labels[key] ?? `Turno da ${playersAtStart}`;
}
