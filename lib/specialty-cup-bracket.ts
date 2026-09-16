export type SpecialtyCupBracketSize = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;

export type SpecialtyCupBracketPlan = {
  entrants: number;
  bracketSize: SpecialtyCupBracketSize;
  byes: number;
  firstRoundMatches: number;
  playersAdvancingByBye: number;
  playersAfterFirstRound: number;
};

/**
 * Porta ogni Coppa Specialità alla potenza di 2 immediatamente superiore.
 * I posti mancanti diventano bye distribuiti nel primo turno.
 *
 * Esempio: 93 iscritti -> tabellone 128 -> 35 bye -> 29 partite reali
 * nel primo turno -> 64 giocatori al turno successivo.
 */
export function buildSpecialtyCupBracketPlan(
  entrants: number
): SpecialtyCupBracketPlan {
  if (!Number.isInteger(entrants) || entrants < 2) {
    throw new Error("Servono almeno due giocatori per creare il tabellone.");
  }

  const bracketSize = nextPowerOfTwo(entrants);
  const byes = bracketSize - entrants;
  const firstRoundMatches = entrants - bracketSize / 2;

  return {
    entrants,
    bracketSize,
    byes,
    firstRoundMatches,
    playersAdvancingByBye: byes,
    playersAfterFirstRound: bracketSize / 2,
  };
}

function nextPowerOfTwo(value: number): SpecialtyCupBracketSize {
  let size = 2;

  while (size < value) {
    size *= 2;
  }

  if (size > 1024) {
    throw new Error("Il tabellone supera il limite supportato di 1024 giocatori.");
  }

  return size as SpecialtyCupBracketSize;
}
