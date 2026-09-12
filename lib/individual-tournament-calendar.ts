import { addRomeDaysAtTime } from "@/lib/rome-calendar";

export type IndividualTournamentType =
  | "ITALIANA"
  | "GORIZIANA"
  | "TUTTI_DOPPI"
  | "MONDIALE";

export type IndividualTournamentStageKey =
  | "DRAW"
  | "ROUND_OF_256"
  | "ROUND_OF_128"
  | "ROUND_OF_64"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "FINAL";

export type IndividualMatchStageKey = Exclude<
  IndividualTournamentStageKey,
  "DRAW"
>;

export type IndividualTournamentDefinition = {
  leagueRound: number;
  type: IndividualTournamentType;
  name: string;
  shortName: string;
  specialty: string;
  international: boolean;
};

export type IndividualTournamentStageDefinition = {
  key: IndividualTournamentStageKey;
  label: string;
  dayLabel: "Sabato" | "Domenica";
  dayOffset: number;
  hour: number;
  minute: number;
};

export const INDIVIDUAL_TOURNAMENT_DEFINITIONS = [
  createSpecialtyTournament(1, "ITALIANA", 1),
  createSpecialtyTournament(2, "GORIZIANA", 1),
  createSpecialtyTournament(3, "TUTTI_DOPPI", 1),
  createSpecialtyTournament(4, "ITALIANA", 2),
  createSpecialtyTournament(5, "GORIZIANA", 2),
  createSpecialtyTournament(6, "TUTTI_DOPPI", 2),
  createSpecialtyTournament(8, "ITALIANA", 3),
  createSpecialtyTournament(9, "GORIZIANA", 3),
  createSpecialtyTournament(10, "TUTTI_DOPPI", 3),
  createSpecialtyTournament(11, "ITALIANA", 4),
  createSpecialtyTournament(12, "GORIZIANA", 4),
  createSpecialtyTournament(13, "TUTTI_DOPPI", 4),
  createInternationalTournament(15, "MONDIALE"),
] satisfies IndividualTournamentDefinition[];

export const INDIVIDUAL_TOURNAMENT_STAGES = [
  createStage("DRAW", "Sorteggio", "Sabato", 1, 10),
  createStage("ROUND_OF_256", "128esimi", "Sabato", 1, 14),
  createStage("ROUND_OF_128", "64esimi", "Sabato", 1, 16),
  createStage("ROUND_OF_64", "32esimi", "Sabato", 1, 18),
  createStage("ROUND_OF_32", "16esimi", "Sabato", 1, 20),
  createStage("ROUND_OF_16", "Ottavi", "Domenica", 2, 10),
  createStage("QUARTER_FINAL", "Quarti", "Domenica", 2, 12),
  createStage("SEMI_FINAL", "Semifinali", "Domenica", 2, 14),
  createStage("FINAL", "Finale", "Domenica", 2, 16),
] satisfies IndividualTournamentStageDefinition[];

export const INDIVIDUAL_MATCH_STAGES =
  INDIVIDUAL_TOURNAMENT_STAGES.filter(
    (stage): stage is IndividualTournamentStageDefinition & {
      key: IndividualMatchStageKey;
    } => stage.key !== "DRAW"
  ).map((stage, index) => ({
    ...stage,
    order: index + 1,
  }));

export function buildIndividualTournamentCalendar(
  roundDates: ReadonlyMap<number, Date>
) {
  return INDIVIDUAL_TOURNAMENT_DEFINITIONS.map((definition) => {
    const leagueDate = roundDates.get(definition.leagueRound);

    if (!leagueDate) {
      throw new Error(
        `Data mancante per la giornata ${definition.leagueRound}.`
      );
    }

    const stages = INDIVIDUAL_TOURNAMENT_STAGES.map((stage) => ({
      ...stage,
      scheduledAt: addRomeDaysAtTime(
        leagueDate,
        stage.dayOffset,
        stage.hour,
        stage.minute
      ),
    }));

    return {
      ...definition,
      leagueDate,
      drawAt: stages[0].scheduledAt,
      finalAt: stages[stages.length - 1].scheduledAt,
      stages,
    };
  });
}

function createSpecialtyTournament(
  leagueRound: number,
  type: Exclude<
    IndividualTournamentType,
    "MONDIALE"
  >,
  edition: number
): IndividualTournamentDefinition {
  const specialty = getSpecialtyLabel(type);

  return {
    leagueRound,
    type,
    name: `Torneo ${specialty} · ${edition}ª prova`,
    shortName: `${specialty} ${edition}`,
    specialty,
    international: false,
  };
}

function createInternationalTournament(
  leagueRound: number,
  type: "MONDIALE"
): IndividualTournamentDefinition {
  const name = "Campionato Mondiale";

  return {
    leagueRound,
    type,
    name,
    shortName: "Mondiale",
    specialty: "Tre specialità",
    international: true,
  };
}

function createStage(
  key: IndividualTournamentStageKey,
  label: string,
  dayLabel: "Sabato" | "Domenica",
  dayOffset: number,
  hour: number
): IndividualTournamentStageDefinition {
  return {
    key,
    label,
    dayLabel,
    dayOffset,
    hour,
    minute: 0,
  };
}

function getSpecialtyLabel(
  type: "ITALIANA" | "GORIZIANA" | "TUTTI_DOPPI"
) {
  if (type === "ITALIANA") {
    return "Italiana";
  }

  if (type === "GORIZIANA") {
    return "Goriziana";
  }

  return "Tutti Doppi";
}
