import {
  MATCH_SHOT_SCORES,
  type MatchSpecialty,
} from "@/lib/match-engine";

export type IndividualChroniclePlayerSide =
  | "PLAYER_ONE"
  | "PLAYER_TWO";

export type IndividualChronicleShot = {
  order: number;
  playerSide: IndividualChroniclePlayerSide;
  points: number;
  playerOneTotal: number;
  playerTwoTotal: number;
};

export function buildIndividualGameChronicle({
  gameId,
  specialty,
  winnerSide,
  playerOneScore,
  playerTwoScore,
}: {
  gameId: number;
  specialty: MatchSpecialty;
  winnerSide: IndividualChroniclePlayerSide;
  playerOneScore: number;
  playerTwoScore: number;
}) {
  const allowedScores = MATCH_SHOT_SCORES[specialty];
  const random = createSeededRandom(
    gameId * 97 + playerOneScore * 17 + playerTwoScore * 31
  );
  const playerOneAttempts = 8;
  const playerTwoAttempts = winnerSide === "PLAYER_ONE" ? 7 : 8;
  const playerOneShots = distributeScore({
    total: playerOneScore,
    attempts: playerOneAttempts,
    allowedScores,
    requireLastScore: winnerSide === "PLAYER_ONE",
    random,
  });
  const playerTwoShots = distributeScore({
    total: playerTwoScore,
    attempts: playerTwoAttempts,
    allowedScores,
    requireLastScore: winnerSide === "PLAYER_TWO",
    random,
  });
  const chronicle: IndividualChronicleShot[] = [];
  let playerOneTotal = 0;
  let playerTwoTotal = 0;

  for (
    let attemptIndex = 0;
    attemptIndex < Math.max(playerOneShots.length, playerTwoShots.length);
    attemptIndex += 1
  ) {
    const playerOnePoints = playerOneShots[attemptIndex];

    if (playerOnePoints !== undefined) {
      playerOneTotal += playerOnePoints;
      chronicle.push({
        order: chronicle.length + 1,
        playerSide: "PLAYER_ONE",
        points: playerOnePoints,
        playerOneTotal,
        playerTwoTotal,
      });
    }

    const playerTwoPoints = playerTwoShots[attemptIndex];

    if (playerTwoPoints !== undefined) {
      playerTwoTotal += playerTwoPoints;
      chronicle.push({
        order: chronicle.length + 1,
        playerSide: "PLAYER_TWO",
        points: playerTwoPoints,
        playerOneTotal,
        playerTwoTotal,
      });
    }
  }

  return chronicle;
}

function distributeScore({
  total,
  attempts,
  allowedScores,
  requireLastScore,
  random,
}: {
  total: number;
  attempts: number;
  allowedScores: readonly number[];
  requireLastScore: boolean;
  random: () => number;
}) {
  const memo = new Map<string, boolean>();
  const scores: number[] = [];
  let remaining = total;

  for (let index = 0; index < attempts; index += 1) {
    const remainingAttempts = attempts - index - 1;
    const feasibleScores = [0, ...allowedScores].filter((score) => {
      if (score > remaining) return false;

      const nextTotal = remaining - score;

      if (remainingAttempts === 0) {
        return nextTotal === 0 && (!requireLastScore || score > 0);
      }

      return requireLastScore
        ? canRepresentWithPositiveLast(
            nextTotal,
            remainingAttempts,
            allowedScores,
            memo
          )
        : canRepresent(
            nextTotal,
            remainingAttempts,
            allowedScores,
            memo
          );
    });

    if (feasibleScores.length === 0) {
      throw new Error("INDIVIDUAL_CHRONICLE_SCORE_NOT_REPRESENTABLE");
    }

    const average = remaining / (remainingAttempts + 1);
    const desiredScore = average * (0.65 + random() * 0.7);
    const selectedScore = feasibleScores.reduce((best, candidate) =>
      Math.abs(candidate - desiredScore) < Math.abs(best - desiredScore)
        ? candidate
        : best
    );

    scores.push(selectedScore);
    remaining -= selectedScore;
  }

  return scores;
}

function canRepresentWithPositiveLast(
  total: number,
  attempts: number,
  allowedScores: readonly number[],
  memo: Map<string, boolean>
) {
  return allowedScores.some(
    (lastScore) =>
      lastScore <= total &&
      canRepresent(total - lastScore, attempts - 1, allowedScores, memo)
  );
}

function canRepresent(
  total: number,
  attempts: number,
  allowedScores: readonly number[],
  memo: Map<string, boolean>
): boolean {
  if (attempts === 0) return total === 0;
  if (total < 0 || total > attempts * allowedScores.at(-1)!) return false;

  const memoKey = `${total}:${attempts}`;
  const cached = memo.get(memoKey);

  if (cached !== undefined) return cached;

  const representable = [0, ...allowedScores].some(
    (score) =>
      score <= total &&
      canRepresent(total - score, attempts - 1, allowedScores, memo)
  );
  memo.set(memoKey, representable);

  return representable;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}