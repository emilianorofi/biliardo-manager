import {
  calculatePlayerPerformance,
  type MatchPerformancePlayerValues,
  type MatchSpecialty,
} from "@/lib/match-engine";
import { simulateMatchWinner } from "@/lib/match-simulator";
import { calculateOverall } from "@/lib/training-engine";
import type { IndividualTournamentType } from "@/lib/individual-tournament-calendar";

export const INDIVIDUAL_TOURNAMENT_SIZE = 256;

export type IndividualMatchPlayer = MatchPerformancePlayerValues & {
  id: number;
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
};

export function rankIndividualTournamentPlayers(
  players: IndividualMatchPlayer[]
) {
  return players
    .map((player) => ({
      player,
      overall: calculateOverall(player),
    }))
    .sort(
      (first, second) =>
        second.overall - first.overall ||
        first.player.id - second.player.id
    )
    .slice(0, INDIVIDUAL_TOURNAMENT_SIZE)
    .map((qualified, index) => ({
      ...qualified,
      ranking: index + 1,
    }));
}

export function shuffleIndividualDraw<T>(
  values: T[],
  random: () => number = Math.random
) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [
      shuffled[targetIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function simulateIndividualBestOfThree(
  playerOne: IndividualMatchPlayer,
  playerTwo: IndividualMatchPlayer,
  tournamentType: IndividualTournamentType,
  random: () => number = Math.random
) {
  const specialties = getMatchSpecialties(tournamentType, random);
  let playerOneWins = 0;
  let playerTwoWins = 0;

  for (const specialty of specialties) {
    if (playerOneWins === 2 || playerTwoWins === 2) {
      break;
    }

    const playerOnePerformance = calculatePlayerPerformance(
      playerOne,
      specialty
    );
    const playerTwoPerformance = calculatePlayerPerformance(
      playerTwo,
      specialty
    );
    const result = simulateMatchWinner(
      playerOnePerformance.performanceRating,
      playerTwoPerformance.performanceRating,
      random()
    );

    if (result.winner === "HOME") {
      playerOneWins += 1;
    } else {
      playerTwoWins += 1;
    }
  }

  return {
    winnerPlayerId:
      playerOneWins === 2 ? playerOne.id : playerTwo.id,
    loserPlayerId:
      playerOneWins === 2 ? playerTwo.id : playerOne.id,
    playerOneWins,
    playerTwoWins,
  };
}

function getMatchSpecialties(
  tournamentType: IndividualTournamentType,
  random: () => number
): MatchSpecialty[] {
  if (tournamentType === "ITALIANA") {
    return ["ITALIANA", "ITALIANA", "ITALIANA"];
  }

  if (tournamentType === "GORIZIANA") {
    return ["GORIZIANA", "GORIZIANA", "GORIZIANA"];
  }

  if (tournamentType === "TUTTI_DOPPI") {
    return ["TUTTI_DOPPI", "TUTTI_DOPPI", "TUTTI_DOPPI"];
  }

  return shuffleIndividualDraw<MatchSpecialty>(
    ["ITALIANA", "GORIZIANA", "TUTTI_DOPPI"],
    random
  );
}
