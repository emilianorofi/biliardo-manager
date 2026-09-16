export type SpecialtyCupBracketSize =
  | 2
  | 4
  | 8
  | 16
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024;

export type SpecialtyCupBracketPlan = {
  entrants: number;
  bracketSize: SpecialtyCupBracketSize;
  byes: number;
  firstRoundMatches: number;
  playersAdvancingByBye: number;
  playersAfterFirstRound: number;
};

export type SpecialtyCupDrawSlot<T> = {
  position: number;
  player: T;
  bye: boolean;
};

export type SpecialtyCupDraw<T> = {
  plan: SpecialtyCupBracketPlan;
  slots: SpecialtyCupDrawSlot<T>[];
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

/**
 * Esegue il sorteggio del primo turno.
 *
 * - l'ordine dei giocatori viene mescolato casualmente;
 * - i bye vengono assegnati casualmente fra tutti gli iscritti;
 * - ogni bye occupa un accoppiamento da solo e porta il giocatore direttamente
 *   al turno successivo;
 * - il risultato di questa funzione va salvato quando viene effettuato il
 *   sorteggio, così non cambia riaprendo la pagina della competizione.
 *
 * Il parametro rng è iniettato solo per rendere la funzione testabile; nel gioco
 * viene usato Math.random.
 */
export function drawSpecialtyCupBracket<T>(
  entrants: readonly T[],
  rng: () => number = Math.random
): SpecialtyCupDraw<T> {
  const plan = buildSpecialtyCupBracketPlan(entrants.length);
  const shuffled = fisherYatesShuffle([...entrants], rng);

  const byeIndexes = new Set(
    fisherYatesShuffle(
      Array.from({ length: entrants.length }, (_, index) => index),
      rng
    ).slice(0, plan.byes)
  );

  const byePlayers = shuffled.filter((_, index) => byeIndexes.has(index));
  const playingPlayers = shuffled.filter((_, index) => !byeIndexes.has(index));
  const slots: SpecialtyCupDrawSlot<T>[] = [];

  let position = 1;
  let playingIndex = 0;
  let byeIndex = 0;

  for (let matchIndex = 0; matchIndex < plan.bracketSize / 2; matchIndex++) {
    if (byeIndex < byePlayers.length) {
      slots.push({
        position,
        player: byePlayers[byeIndex],
        bye: true,
      });
      position += 2;
      byeIndex += 1;
      continue;
    }

    const firstPlayer = playingPlayers[playingIndex];
    const secondPlayer = playingPlayers[playingIndex + 1];

    if (firstPlayer === undefined || secondPlayer === undefined) {
      throw new Error("Sorteggio Coppa Specialità non valido.");
    }

    slots.push({ position, player: firstPlayer, bye: false });
    slots.push({ position: position + 1, player: secondPlayer, bye: false });
    position += 2;
    playingIndex += 2;
  }

  return { plan, slots };
}

function fisherYatesShuffle<T>(values: T[], rng: () => number) {
  for (let index = values.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(rng() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }

  return values;
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
