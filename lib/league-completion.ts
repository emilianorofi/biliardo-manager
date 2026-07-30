const DEFAULT_TOTAL_ROUNDS = 14;

export type LeagueCompletionResult = {
  completedRound: number;
  totalRounds: number;
  isCompleted: boolean;
  status: "ACTIVE" | "COMPLETED";
};

export function calculateLeagueCompletion(
  completedRound: number,
  totalRounds: number =
    DEFAULT_TOTAL_ROUNDS
): LeagueCompletionResult {
  validateCompletionValues(
    completedRound,
    totalRounds
  );

  const isCompleted =
    completedRound ===
    totalRounds;

  return {
    completedRound,
    totalRounds,
    isCompleted,

    status:
      isCompleted
        ? "COMPLETED"
        : "ACTIVE",
  };
}

function validateCompletionValues(
  completedRound: number,
  totalRounds: number
): void {
  if (
    !Number.isInteger(
      completedRound
    ) ||
    completedRound < 0
  ) {
    throw new Error(
      "La giornata completata non è valida."
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
    completedRound >
    totalRounds
  ) {
    throw new Error(
      "La giornata completata supera il numero totale delle giornate."
    );
  }
}