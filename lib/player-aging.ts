export type EndOfSeasonPlayerOutcome = {
  previousAge: number;
  age: number;
  retirementChance: number;
  retirementRoll: number;
  retired: boolean;
};

export function getRetirementChance(age: number): number {
  validateAge(age);

  if (age < 50) return 0;
  if (age <= 55) return 2;
  if (age <= 60) return 3;
  if (age <= 65) return 5;
  if (age <= 70) return 10;
  if (age <= 75) return 20;
  if (age <= 80) return 40;
  if (age <= 85) return 70;
  if (age <= 90) return 90;

  return 95;
}

export function calculateEndOfSeasonPlayerOutcome(
  currentAge: number,
  retirementRoll: number
): EndOfSeasonPlayerOutcome {
  validateAge(currentAge);
  validateRetirementRoll(retirementRoll);

  const age = currentAge + 1;
  const retirementChance = getRetirementChance(age);

  return {
    previousAge: currentAge,
    age,
    retirementChance,
    retirementRoll,
    retired:
      retirementRoll < retirementChance / 100,
  };
}

function validateAge(age: number): void {
  if (!Number.isInteger(age) || age < 0) {
    throw new Error("L'età del giocatore non è valida.");
  }
}

function validateRetirementRoll(retirementRoll: number): void {
  if (
    !Number.isFinite(retirementRoll) ||
    retirementRoll < 0 ||
    retirementRoll >= 1
  ) {
    throw new Error(
      "Il valore casuale per il ritiro deve essere compreso tra 0 incluso e 1 escluso."
    );
  }
}
