export type GeneratedLeagueFixture = {
  round: number;
  homeClubId: number;
  awayClubId: number;
};

export function generateDoubleRoundRobin(
  clubIds: number[]
): GeneratedLeagueFixture[] {
  validateClubIds(clubIds);

  const firstLeg =
    generateSingleRoundRobin(clubIds);

  const returnLeg = firstLeg.map(
    (fixture) => ({
      round:
        fixture.round +
        (clubIds.length - 1),

      homeClubId:
        fixture.awayClubId,

      awayClubId:
        fixture.homeClubId,
    })
  );

  return [
    ...firstLeg,
    ...returnLeg,
  ];
}

function generateSingleRoundRobin(
  clubIds: number[]
): GeneratedLeagueFixture[] {
  const rotatingClubIds = [
    ...clubIds,
  ];

  const numberOfClubs =
    rotatingClubIds.length;

  const rounds =
    numberOfClubs - 1;

  const matchesPerRound =
    numberOfClubs / 2;

  const fixtures: GeneratedLeagueFixture[] =
    [];

  for (
    let roundIndex = 0;
    roundIndex < rounds;
    roundIndex += 1
  ) {
    const round =
      roundIndex + 1;

    for (
      let matchIndex = 0;
      matchIndex <
      matchesPerRound;
      matchIndex += 1
    ) {
      const firstClubId =
        rotatingClubIds[
          matchIndex
        ];

      const secondClubId =
        rotatingClubIds[
          numberOfClubs -
            1 -
            matchIndex
        ];

      const shouldReverse =
        (roundIndex +
          matchIndex) %
          2 ===
        1;

      fixtures.push({
        round,

        homeClubId:
          shouldReverse
            ? secondClubId
            : firstClubId,

        awayClubId:
          shouldReverse
            ? firstClubId
            : secondClubId,
      });
    }

    rotateClubs(
      rotatingClubIds
    );
  }

  return fixtures;
}

function rotateClubs(
  clubIds: number[]
) {
  const fixedClubId =
    clubIds[0];

  const rotatingPart =
    clubIds.slice(1);

  const lastClubId =
    rotatingPart.pop();

  if (
    lastClubId === undefined
  ) {
    return;
  }

  rotatingPart.unshift(
    lastClubId
  );

  clubIds.splice(
    0,
    clubIds.length,
    fixedClubId,
    ...rotatingPart
  );
}

function validateClubIds(
  clubIds: number[]
) {
  if (clubIds.length < 2) {
    throw new Error(
      "Servono almeno due club per creare il calendario."
    );
  }

  if (
    clubIds.length % 2 !== 0
  ) {
    throw new Error(
      "Il numero dei club deve essere pari."
    );
  }

  const uniqueClubIds =
    new Set(clubIds);

  if (
    uniqueClubIds.size !==
    clubIds.length
  ) {
    throw new Error(
      "Il calendario contiene club duplicati."
    );
  }

  const containsInvalidId =
    clubIds.some(
      (clubId) =>
        !Number.isInteger(
          clubId
        ) || clubId <= 0
    );

  if (containsInvalidId) {
    throw new Error(
      "Uno degli identificativi dei club non è valido."
    );
  }
}