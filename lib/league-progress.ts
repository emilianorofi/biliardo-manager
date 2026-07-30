export type LeagueProgressFixture = {
  round: number;
  status: string;
};

export function calculateCompletedRound(
  fixtures: LeagueProgressFixture[]
): number {
  if (fixtures.length === 0) {
    return 0;
  }

  const fixturesByRound =
    new Map<number, LeagueProgressFixture[]>();

  for (const fixture of fixtures) {
    const roundFixtures =
      fixturesByRound.get(
        fixture.round
      ) ?? [];

    roundFixtures.push(
      fixture
    );

    fixturesByRound.set(
      fixture.round,
      roundFixtures
    );
  }

  const rounds =
    Array.from(
      fixturesByRound.keys()
    ).sort(
      (
        firstRound,
        secondRound
      ) =>
        firstRound -
        secondRound
    );

  let completedRound = 0;

  for (const round of rounds) {
    if (
      round !==
      completedRound + 1
    ) {
      break;
    }

    const roundFixtures =
      fixturesByRound.get(
        round
      );

    if (
      !roundFixtures ||
      roundFixtures.length === 0
    ) {
      break;
    }

    const roundIsCompleted =
      roundFixtures.every(
        (fixture) =>
          fixture.status ===
          "PLAYED"
      );

    if (!roundIsCompleted) {
      break;
    }

    completedRound =
      round;
  }

  return completedRound;
}