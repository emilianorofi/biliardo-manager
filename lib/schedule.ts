import { Club } from "../app/types/club";

export interface Match {
  home: Club;
  away: Club;
}

export interface Matchday {
  round: number;
  matches: Match[];
}

/**
 * Genera un calendario completo (andata + ritorno)
 * con il metodo Round Robin.
 */
export function generateSchedule(clubs: Club[]): Matchday[] {
  if (clubs.length % 2 !== 0) {
    throw new Error("Il numero di squadre deve essere pari.");
  }

  const teams = [...clubs];
  const totalRounds = teams.length - 1;
  const matchesPerRound = teams.length / 2;

  const firstLeg: Matchday[] = [];

  for (let round = 0; round < totalRounds; round++) {
    const matches: Match[] = [];

    for (let i = 0; i < matchesPerRound; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];

      matches.push({
        home: round % 2 === 0 ? home : away,
        away: round % 2 === 0 ? away : home,
      });
    }

    firstLeg.push({
      round: round + 1,
      matches,
    });

    const fixed = teams[0];
    const rotating = teams.slice(1);

    rotating.unshift(rotating.pop()!);

    teams.splice(0, teams.length, fixed, ...rotating);
  }

  const secondLeg: Matchday[] = firstLeg.map((day) => ({
    round: day.round + totalRounds,
    matches: day.matches.map((match) => ({
      home: match.away,
      away: match.home,
    })),
  }));

  return [...firstLeg, ...secondLeg];
}