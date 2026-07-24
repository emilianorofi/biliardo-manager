import type { Club } from "../app/types/club";
import type { Match, Matchday } from "../app/types/match";

/**
 * Genera un calendario completo di andata e ritorno
 * utilizzando il metodo Round Robin.
 */
export function generateSchedule(clubs: Club[]): Matchday[] {
  if (clubs.length < 2) {
    throw new Error("Servono almeno due club per generare il calendario.");
  }

  if (clubs.length % 2 !== 0) {
    throw new Error("Il numero di club deve essere pari.");
  }

  const rotatingClubs = [...clubs];
  const totalFirstLegRounds = rotatingClubs.length - 1;
  const matchesPerRound = rotatingClubs.length / 2;

  const firstLeg: Matchday[] = [];

  for (let roundIndex = 0; roundIndex < totalFirstLegRounds; roundIndex++) {
    const round = roundIndex + 1;
    const matches: Match[] = [];

    for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex++) {
      const firstClub = rotatingClubs[matchIndex];
      const secondClub =
        rotatingClubs[rotatingClubs.length - 1 - matchIndex];

      if (!firstClub || !secondClub) {
        throw new Error(
          `Impossibile creare la partita ${matchIndex + 1} della giornata ${round}.`
        );
      }

      const homeClub =
        roundIndex % 2 === 0 ? firstClub : secondClub;

      const awayClub =
        roundIndex % 2 === 0 ? secondClub : firstClub;

      matches.push(
        createMatch({
          id: roundIndex * matchesPerRound + matchIndex + 1,
          round,
          homeClub,
          awayClub,
        })
      );
    }

    firstLeg.push({
      round,
      matches,
    });

    rotateClubs(rotatingClubs);
  }

  const secondLeg = firstLeg.map((matchday, matchdayIndex) => {
    const round = matchday.round + totalFirstLegRounds;

    return {
      round,
      matches: matchday.matches.map((match, matchIndex) =>
        createMatch({
          id:
            totalFirstLegRounds * matchesPerRound +
            matchdayIndex * matchesPerRound +
            matchIndex +
            1,
          round,
          homeClub: match.awayClub,
          awayClub: match.homeClub,
        })
      ),
    };
  });

  return [...firstLeg, ...secondLeg];
}

function createMatch({
  id,
  round,
  homeClub,
  awayClub,
}: {
  id: number;
  round: number;
  homeClub: Club;
  awayClub: Club;
}): Match {
  return {
    id,
    competition: "Campionato",
    round,
    date: `Giornata ${round}`,
    time: "21:00",
    homeClub,
    awayClub,
    venue: homeClub.city,
    preparation: 0,
    morale: "Normale",
    form: 5,
    fitness: 100,
    absences: 0,
  };
}

function rotateClubs(clubs: Club[]) {
  const fixedClub = clubs[0];
  const movableClubs = clubs.slice(1);
  const lastClub = movableClubs.pop();

  if (!fixedClub || !lastClub) {
    return;
  }

  movableClubs.unshift(lastClub);

  clubs.splice(
    0,
    clubs.length,
    fixedClub,
    ...movableClubs
  );
}