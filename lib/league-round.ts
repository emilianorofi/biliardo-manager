const DEFAULT_TOTAL_ROUNDS = 14;

export function getNextPlayableRound(
  currentRound: number,
  totalRounds: number =
    DEFAULT_TOTAL_ROUNDS
): number | null {
  validateRoundValues(
    currentRound,
    totalRounds
  );

  if (
    currentRound >=
    totalRounds
  ) {
    return null;
  }

  return currentRound + 1;
}

export function validateFixtureRound(
  currentRound: number,
  fixtureRound: number,
  totalRounds: number =
    DEFAULT_TOTAL_ROUNDS
): void {
  if (
    !Number.isInteger(
      fixtureRound
    ) ||
    fixtureRound <= 0
  ) {
    throw new Error(
      "La giornata dell'incontro non è valida."
    );
  }

  const nextPlayableRound =
    getNextPlayableRound(
      currentRound,
      totalRounds
    );

  if (
    nextPlayableRound ===
    null
  ) {
    throw new Error(
      "Il campionato è già terminato."
    );
  }

  if (
    fixtureRound !==
    nextPlayableRound
  ) {
    throw new Error(
      `Puoi registrare soltanto gli incontri della giornata ${nextPlayableRound}.`
    );
  }
}

function validateRoundValues(
  currentRound: number,
  totalRounds: number
): void {
  if (
    !Number.isInteger(
      currentRound
    ) ||
    currentRound < 0
  ) {
    throw new Error(
      "La giornata corrente non è valida."
    );
  }

  if (
    !Number.isInteger(
      totalRounds
    ) ||
    totalRounds <= 0
  ) {
    throw new Error(
      "Il numero totale delle giornate non è valido."
    );
  }

  if (
    currentRound >
    totalRounds
  ) {
    throw new Error(
      "La giornata corrente supera il numero totale delle giornate."
    );
  }
}