export type TeamWeeklyResult =
  | "WIN"
  | "DRAW"
  | "LOSS"
  | null;

type PlayerConditionInput = {
  currentForm: number;
  currentMorale: number;
  gamesPlayed: number;
  gamesWon: number;
  teamResult: TeamWeeklyResult;
  consecutiveBenchWeeks: number;
};

export function calculateWeeklyPlayerCondition({
  currentForm,
  currentMorale,
  gamesPlayed,
  gamesWon,
  teamResult,
  consecutiveBenchWeeks,
}: PlayerConditionInput) {
  const formChange = getFormChange({
    currentForm,
    gamesPlayed,
    gamesWon,
  });
  const moraleChange =
    getMoraleChange({
      teamResult,
      consecutiveBenchWeeks,
    });

  return {
    formChange,
    formAfter: clampCondition(
      currentForm + formChange
    ),
    moraleChange,
    moraleAfter: clampCondition(
      currentMorale + moraleChange
    ),
  };
}

function getFormChange({
  currentForm,
  gamesPlayed,
  gamesWon,
}: {
  currentForm: number;
  gamesPlayed: number;
  gamesWon: number;
}) {
  if (gamesPlayed === 0) {
    if (currentForm > 5) return -1;
    if (currentForm < 5) return 1;

    return 0;
  }

  if (gamesWon >= 2) return 1;
  if (gamesWon === 0) return -1;

  return 0;
}

function getMoraleChange({
  teamResult,
  consecutiveBenchWeeks,
}: {
  teamResult: TeamWeeklyResult;
  consecutiveBenchWeeks: number;
}) {
  let change = 0;

  if (teamResult === "WIN") change += 1;
  if (teamResult === "LOSS") change -= 1;

  if (
    teamResult !== null &&
    consecutiveBenchWeeks >= 2
  ) {
    change -= 1;
  }

  return change;
}

function clampCondition(value: number) {
  return Math.min(
    10,
    Math.max(1, value)
  );
}
