import {
  calculatePlayerPerformance,
  calculateTeamPerformanceRating,
  getLeagueMatchDefinitions,
  type FormationSlot,
  type MatchPerformancePlayerValues,
  type MatchSpecialty,
  type PlayerPerformanceBreakdown,
} from "@/lib/match-engine";
import {
  simulateMatchWinner,
  type SimulatedMatchResult,
} from "@/lib/match-simulator";

export type FixtureCareerPlayer =
  MatchPerformancePlayerValues & {
    id: number;
    clubId: number | null;
    firstName: string;
    lastName: string;
    nationality: string;
    age: number;
    talent: number;
    tattica: number;
    mentalita: number;
    difesa: number;
    realizzazione: number;
    creativita: number;
    misura: number;
  };

export type FixtureCareerFormation = Record<
  FormationSlot,
  FixtureCareerPlayer
>;

export type FixturePlayerSide = "HOME" | "AWAY";
export type FixturePlayerResult = "WIN" | "LOSS";

export type SimulatedFixtureParticipant = {
  side: FixturePlayerSide;
  slot: FormationSlot;
  player: FixtureCareerPlayer;
  result: FixturePlayerResult;
  performance: PlayerPerformanceBreakdown;
};

export type SimulatedPlayerFixtureGame = {
  order: number;
  specialty: MatchSpecialty;
  gameType: "SINGLES" | "DOUBLES";
  targetPoints: number;
  homeSlots: FormationSlot[];
  awaySlots: FormationSlot[];
  homePerformanceRating: number;
  awayPerformanceRating: number;
  result: SimulatedMatchResult;
  participants: SimulatedFixtureParticipant[];
};

export type SimulatedPlayerFixture = {
  homeScore: number;
  awayScore: number;
  winner: FixturePlayerSide | "DRAW";
  games: SimulatedPlayerFixtureGame[];
};

export function simulateFixtureWithPlayers(
  homeFormation: FixtureCareerFormation,
  awayFormation: FixtureCareerFormation,
  randomValues?: number[]
): SimulatedPlayerFixture {
  const definitions = getLeagueMatchDefinitions();

  if (
    randomValues !== undefined &&
    randomValues.length !== definitions.length
  ) {
    throw new Error(
      "Devono essere indicati esattamente 6 valori casuali."
    );
  }

  validateFormation(homeFormation, "casa");
  validateFormation(awayFormation, "trasferta");

  const games = definitions.map((definition, index) => {
    const homePlayers = definition.homeSlots.map(
      (slot) => homeFormation[slot]
    );
    const awayPlayers = definition.awaySlots.map(
      (slot) => awayFormation[slot]
    );
    const homePerformanceRating =
      calculateTeamPerformanceRating(
        homePlayers,
        definition.specialty
      );
    const awayPerformanceRating =
      calculateTeamPerformanceRating(
        awayPlayers,
        definition.specialty
      );
    const result = simulateMatchWinner(
      homePerformanceRating,
      awayPerformanceRating,
      randomValues?.[index]
    );

    return {
      order: definition.order,
      specialty: definition.specialty,
      gameType:
        definition.homeSlots.length === 1
          ? ("SINGLES" as const)
          : ("DOUBLES" as const),
      targetPoints: definition.targetPoints,
      homeSlots: [...definition.homeSlots],
      awaySlots: [...definition.awaySlots],
      homePerformanceRating,
      awayPerformanceRating,
      result,
      participants: [
        ...createParticipants(
          "HOME",
          definition.homeSlots,
          homeFormation,
          definition.specialty,
          result.winner
        ),
        ...createParticipants(
          "AWAY",
          definition.awaySlots,
          awayFormation,
          definition.specialty,
          result.winner
        ),
      ],
    };
  });

  const homeScore = games.filter(
    (game) => game.result.winner === "HOME"
  ).length;
  const awayScore = games.length - homeScore;

  return {
    homeScore,
    awayScore,
    winner:
      homeScore > awayScore
        ? "HOME"
        : awayScore > homeScore
          ? "AWAY"
          : "DRAW",
    games,
  };
}

function createParticipants(
  side: FixturePlayerSide,
  slots: FormationSlot[],
  formation: FixtureCareerFormation,
  specialty: MatchSpecialty,
  winner: FixturePlayerSide
) {
  return slots.map((slot) => ({
    side,
    slot,
    player: formation[slot],
    result:
      side === winner
        ? ("WIN" as const)
        : ("LOSS" as const),
    performance: calculatePlayerPerformance(
      formation[slot],
      specialty
    ),
  }));
}

function validateFormation(
  formation: FixtureCareerFormation,
  label: string
) {
  const players = [
    formation.A,
    formation.B,
    formation.C,
  ];
  const ids = new Set(players.map((player) => player.id));

  if (ids.size !== 3) {
    throw new Error(
      `La formazione di ${label} deve contenere tre giocatori differenti.`
    );
  }
}
