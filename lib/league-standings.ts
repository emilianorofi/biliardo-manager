export type LeagueEntryDelta = {
  played: number;

  won: number;
  drawn: number;
  lost: number;

  pointsFor: number;
  pointsAgainst: number;
  points: number;
};

export type FixtureStandingsDeltas = {
  home:
    LeagueEntryDelta;

  away:
    LeagueEntryDelta;
};

export function calculateFixtureStandingsDeltas(
  homeScore: number,
  awayScore: number
): FixtureStandingsDeltas {
  validateFixtureScore(
    homeScore,
    awayScore
  );

  const isHomeWin =
    homeScore > awayScore;

  const isAwayWin =
    awayScore > homeScore;

  const isDraw =
    homeScore === awayScore;

  return {
    home: {
      played: 1,

      won:
        isHomeWin ? 1 : 0,

      drawn:
        isDraw ? 1 : 0,

      lost:
        isAwayWin ? 1 : 0,

      pointsFor:
        homeScore,

      pointsAgainst:
        awayScore,

      points:
        homeScore,
    },

    away: {
      played: 1,

      won:
        isAwayWin ? 1 : 0,

      drawn:
        isDraw ? 1 : 0,

      lost:
        isHomeWin ? 1 : 0,

      pointsFor:
        awayScore,

      pointsAgainst:
        homeScore,

      points:
        awayScore,
    },
  };
}

function validateFixtureScore(
  homeScore: number,
  awayScore: number
) {
  const scoresAreValid =
    Number.isInteger(
      homeScore
    ) &&
    Number.isInteger(
      awayScore
    ) &&
    homeScore >= 0 &&
    awayScore >= 0;

  if (!scoresAreValid) {
    throw new Error(
      "I punteggi dell'incontro devono essere numeri interi non negativi."
    );
  }

  if (
    homeScore +
      awayScore !==
    6
  ) {
    throw new Error(
      "Il risultato dell'incontro deve comprendere esattamente 6 prove."
    );
  }
}