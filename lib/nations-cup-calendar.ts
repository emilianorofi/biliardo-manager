import { addRomeDaysAtTime } from "@/lib/rome-calendar";
import { NATIONS_CUP_LEAGUE_ROUND } from "@/lib/nations-cup";

export const NATIONS_CUP_STAGES = [
  { key: "DRAW", label: "Sorteggio", day: "Sabato", dayOffset: 1, hour: 9 },
  { key: "GROUP_1", label: "1ª giornata gironi", day: "Sabato", dayOffset: 1, hour: 10 },
  { key: "GROUP_2", label: "2ª giornata gironi", day: "Sabato", dayOffset: 1, hour: 14 },
  { key: "GROUP_3", label: "3ª giornata gironi", day: "Sabato", dayOffset: 1, hour: 18 },
  { key: "QUARTER_FINAL", label: "Quarti", day: "Domenica", dayOffset: 2, hour: 10 },
  { key: "SEMI_FINAL", label: "Semifinali", day: "Domenica", dayOffset: 2, hour: 14 },
  { key: "FINAL", label: "Finale", day: "Domenica", dayOffset: 2, hour: 18 },
] as const;

export function buildNationsCupCalendar(roundDates: ReadonlyMap<number, Date>) {
  const leagueDate = roundDates.get(NATIONS_CUP_LEAGUE_ROUND);
  if (!leagueDate) {
    throw new Error(`Data mancante per la giornata ${NATIONS_CUP_LEAGUE_ROUND}.`);
  }

  const stages = NATIONS_CUP_STAGES.map((stage, index) => ({
    ...stage,
    order: index,
    scheduledAt: addRomeDaysAtTime(
      leagueDate,
      stage.dayOffset,
      stage.hour,
      0
    ),
  }));

  return {
    leagueRound: NATIONS_CUP_LEAGUE_ROUND,
    name: "Coppa delle Nazioni",
    leagueDate,
    drawAt: stages[0].scheduledAt,
    finalAt: stages[stages.length - 1].scheduledAt,
    stages,
  };
}
