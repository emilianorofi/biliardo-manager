import type { FormationSlot } from "@/lib/match-engine";

export const RESERVE_SLOTS = ["R1", "R2", "R3"] as const;
export type ReserveSlot = (typeof RESERVE_SLOTS)[number];

export const MAX_FORMATION_SUBSTITUTIONS = 3;
export const LAST_SUBSTITUTION_GAME = 5;

export type FormationSubstitution = {
  afterGame: number;
  slot: FormationSlot;
  reserveSlot: ReserveSlot;
};

export type FormationStrategy = {
  reserves: Record<ReserveSlot, number | null>;
  substitutions: FormationSubstitution[];
};

type ParseFormationStrategyInput = {
  starterPlayerIds: readonly number[];
  reservesInput?: unknown;
  substitutionsInput?: unknown;
  validPlayerIds?: ReadonlySet<number>;
};

export type FormationStrategyParseResult =
  | {
      ok: true;
      strategy: FormationStrategy;
    }
  | {
      ok: false;
      error: string;
    };

export function createEmptyFormationStrategy(): FormationStrategy {
  return {
    reserves: {
      R1: null,
      R2: null,
      R3: null,
    },
    substitutions: [],
  };
}

export function parseFormationStrategy({
  starterPlayerIds,
  reservesInput,
  substitutionsInput,
  validPlayerIds,
}: ParseFormationStrategyInput): FormationStrategyParseResult {
  const reserves = createEmptyFormationStrategy().reserves;

  if (reservesInput !== undefined) {
    if (!isRecord(reservesInput)) {
      return {
        ok: false,
        error: "Le riserve indicate non sono valide.",
      };
    }

    for (const reserveSlot of RESERVE_SLOTS) {
      const parsedPlayerId = parseOptionalPlayerId(
        reservesInput[reserveSlot]
      );

      if (parsedPlayerId === "INVALID") {
        return {
          ok: false,
          error: `Il giocatore indicato come ${reserveSlot} non è valido.`,
        };
      }

      reserves[reserveSlot] = parsedPlayerId;
    }
  }

  const starterIds = new Set(starterPlayerIds);
  const reserveIds = RESERVE_SLOTS.flatMap((reserveSlot) => {
    const playerId = reserves[reserveSlot];
    return playerId === null ? [] : [playerId];
  });

  if (new Set(reserveIds).size !== reserveIds.length) {
    return {
      ok: false,
      error: "Ogni riserva deve essere un giocatore diverso.",
    };
  }

  for (const reservePlayerId of reserveIds) {
    if (starterIds.has(reservePlayerId)) {
      return {
        ok: false,
        error: "Un titolare non può essere contemporaneamente una riserva.",
      };
    }

    if (validPlayerIds && !validPlayerIds.has(reservePlayerId)) {
      return {
        ok: false,
        error: "Una delle riserve non è un giocatore attivo della tua squadra.",
      };
    }
  }

  const substitutionsValue = substitutionsInput ?? [];
  if (!Array.isArray(substitutionsValue)) {
    return {
      ok: false,
      error: "Il piano dei cambi non è valido.",
    };
  }

  if (substitutionsValue.length > MAX_FORMATION_SUBSTITUTIONS) {
    return {
      ok: false,
      error: `Puoi programmare al massimo ${MAX_FORMATION_SUBSTITUTIONS} cambi.`,
    };
  }

  const substitutions: FormationSubstitution[] = [];
  const usedReserveSlots = new Set<ReserveSlot>();
  const usedBoundaries = new Set<string>();

  for (const rawSubstitution of substitutionsValue) {
    if (!isRecord(rawSubstitution)) {
      return {
        ok: false,
        error: "Uno dei cambi programmati non è valido.",
      };
    }

    const afterGame = Number(rawSubstitution.afterGame);
    const slot = rawSubstitution.slot;
    const reserveSlot = rawSubstitution.reserveSlot;

    if (
      !Number.isInteger(afterGame) ||
      afterGame < 1 ||
      afterGame > LAST_SUBSTITUTION_GAME
    ) {
      return {
        ok: false,
        error: "I cambi possono avvenire soltanto al termine delle prime cinque prove.",
      };
    }

    if (!isFormationSlot(slot)) {
      return {
        ok: false,
        error: "Lo slot da sostituire deve essere A, B oppure C.",
      };
    }

    if (!isReserveSlot(reserveSlot)) {
      return {
        ok: false,
        error: "La riserva indicata per il cambio non è valida.",
      };
    }

    if (reserves[reserveSlot] === null) {
      return {
        ok: false,
        error: `${reserveSlot} deve essere assegnata prima di poter programmare il cambio.`,
      };
    }

    if (usedReserveSlots.has(reserveSlot)) {
      return {
        ok: false,
        error: `${reserveSlot} può entrare una sola volta nella stessa giornata.`,
      };
    }

    const boundaryKey = `${afterGame}:${slot}`;
    if (usedBoundaries.has(boundaryKey)) {
      return {
        ok: false,
        error: `Non puoi programmare due cambi sullo slot ${slot} dopo la stessa prova.`,
      };
    }

    usedReserveSlots.add(reserveSlot);
    usedBoundaries.add(boundaryKey);
    substitutions.push({
      afterGame,
      slot,
      reserveSlot,
    });
  }

  substitutions.sort(
    (first, second) => first.afterGame - second.afterGame
  );

  return {
    ok: true,
    strategy: {
      reserves,
      substitutions,
    },
  };
}

export function sanitizeFormationStrategy(
  strategy: FormationStrategy,
  starterPlayerIds: readonly number[],
  validPlayerIds: ReadonlySet<number>
): FormationStrategy {
  const starters = new Set(starterPlayerIds);
  const usedPlayers = new Set<number>();
  const reserves = createEmptyFormationStrategy().reserves;

  for (const reserveSlot of RESERVE_SLOTS) {
    const playerId = strategy.reserves[reserveSlot];

    if (
      playerId === null ||
      !Number.isInteger(playerId) ||
      playerId <= 0 ||
      !validPlayerIds.has(playerId) ||
      starters.has(playerId) ||
      usedPlayers.has(playerId)
    ) {
      continue;
    }

    reserves[reserveSlot] = playerId;
    usedPlayers.add(playerId);
  }

  const substitutions: FormationSubstitution[] = [];
  const usedReserveSlots = new Set<ReserveSlot>();
  const usedBoundaries = new Set<string>();

  for (const substitution of strategy.substitutions) {
    if (substitutions.length >= MAX_FORMATION_SUBSTITUTIONS) break;
    if (
      !Number.isInteger(substitution.afterGame) ||
      substitution.afterGame < 1 ||
      substitution.afterGame > LAST_SUBSTITUTION_GAME ||
      !isFormationSlot(substitution.slot) ||
      !isReserveSlot(substitution.reserveSlot) ||
      reserves[substitution.reserveSlot] === null ||
      usedReserveSlots.has(substitution.reserveSlot)
    ) {
      continue;
    }

    const boundaryKey = `${substitution.afterGame}:${substitution.slot}`;
    if (usedBoundaries.has(boundaryKey)) continue;

    usedReserveSlots.add(substitution.reserveSlot);
    usedBoundaries.add(boundaryKey);
    substitutions.push({ ...substitution });
  }

  substitutions.sort(
    (first, second) => first.afterGame - second.afterGame
  );

  return {
    reserves,
    substitutions,
  };
}

function parseOptionalPlayerId(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const playerId = Number(value);
  return Number.isInteger(playerId) && playerId > 0
    ? playerId
    : ("INVALID" as const);
}

function isFormationSlot(value: unknown): value is FormationSlot {
  return value === "A" || value === "B" || value === "C";
}

function isReserveSlot(value: unknown): value is ReserveSlot {
  return value === "R1" || value === "R2" || value === "R3";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
