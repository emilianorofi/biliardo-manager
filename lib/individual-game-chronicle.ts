import {
  MATCH_SHOT_SCORES,
  MATCH_TARGET_POINTS,
  type MatchSpecialty,
} from "@/lib/match-engine";

export type IndividualChroniclePlayerSide = "PLAYER_ONE" | "PLAYER_TWO";

export type IndividualChroniclePlayerValues = {
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
  form: number;
  morale: number;
  experience: number;
};

type ShotFamily = "DIRECT" | "CUSHION";

type ShotDefinition = {
  key: string;
  name: string;
  family: ShotFamily;
  difficulty: number;
  italianPasses?: "MULTIPLE";
  weights: Record<MatchSpecialty, number>;
};

export type IndividualChronicleShotOutcome =
  | "COMPLETE"
  | "PARTIAL_POINTS"
  | "PARTIAL_DEFENSE"
  | "ERROR"
  | "FOUL"
  | "OWN_BALL_PINS";

export type IndividualChronicleShot = {
  order: number;
  playerSide: IndividualChroniclePlayerSide;
  scoringSide: IndividualChroniclePlayerSide;
  shotName: string;
  shotFamily: ShotFamily;
  outcome: IndividualChronicleShotOutcome;
  points: number;
  playerOneTotal: number;
  playerTwoTotal: number;
  phase: "OPENING" | "MIDDLE" | "FINISH";
  technicalCommentary: string;
  commentary: string;
  highlight:
    | "NONE"
    | "MISS"
    | "FOUL"
    | "LEAD_CHANGE"
    | "BIG_SHOT"
    | "WINNER";
};

const SHOT_DEFINITIONS: ShotDefinition[] = [
  {
    key: "RADDRIZZO",
    name: "Raddrizzo",
    family: "DIRECT",
    difficulty: 2,
    weights: { ITALIANA: 18, GORIZIANA: 10, TUTTI_DOPPI: 17 },
  },
  {
    key: "ROVESCIO",
    name: "Rovescio",
    family: "DIRECT",
    difficulty: 2,
    weights: { ITALIANA: 15, GORIZIANA: 11, TUTTI_DOPPI: 17 },
  },
  {
    key: "TRAVERSINO_PIANO",
    name: "Traversino piano",
    family: "DIRECT",
    difficulty: 3,
    weights: { ITALIANA: 7, GORIZIANA: 2, TUTTI_DOPPI: 3 },
  },
  {
    key: "TRAVERSINO_PASSATE",
    name: "Traversino a più passate",
    family: "DIRECT",
    difficulty: 4,
    italianPasses: "MULTIPLE",
    weights: { ITALIANA: 5, GORIZIANA: 2, TUTTI_DOPPI: 4 },
  },
  {
    key: "GIRO",
    name: "Giro",
    family: "DIRECT",
    difficulty: 3,
    weights: { ITALIANA: 11, GORIZIANA: 4, TUTTI_DOPPI: 6 },
  },
  {
    key: "GIRONE",
    name: "Girone",
    family: "DIRECT",
    difficulty: 4,
    weights: { ITALIANA: 7, GORIZIANA: 3, TUTTI_DOPPI: 4 },
  },
  {
    key: "ANGOLO_PRIMA",
    name: "Angolo di prima",
    family: "DIRECT",
    difficulty: 3,
    weights: { ITALIANA: 5, GORIZIANA: 3, TUTTI_DOPPI: 5 },
  },
  {
    key: "ANGOLO_SECONDA",
    name: "Angolo di seconda",
    family: "DIRECT",
    difficulty: 4,
    weights: { ITALIANA: 3, GORIZIANA: 2, TUTTI_DOPPI: 3 },
  },
  {
    key: "STRISCIO",
    name: "Striscio",
    family: "DIRECT",
    difficulty: 3,
    weights: { ITALIANA: 5, GORIZIANA: 4, TUTTI_DOPPI: 7 },
  },
  {
    key: "CANDELA",
    name: "Candela",
    family: "CUSHION",
    difficulty: 3,
    weights: { ITALIANA: 5, GORIZIANA: 4, TUTTI_DOPPI: 4 },
  },
  {
    key: "SPONDA_BIGLIA",
    name: "Sponda-biglia",
    family: "CUSHION",
    difficulty: 3,
    weights: { ITALIANA: 5, GORIZIANA: 14, TUTTI_DOPPI: 10 },
  },
  {
    key: "BRICOLLA",
    name: "Bricolla",
    family: "CUSHION",
    difficulty: 3,
    weights: { ITALIANA: 13, GORIZIANA: 18, TUTTI_DOPPI: 12 },
  },
  {
    key: "GARUFFA",
    name: "Garuffa",
    family: "CUSHION",
    difficulty: 4,
    weights: { ITALIANA: 8, GORIZIANA: 11, TUTTI_DOPPI: 8 },
  },
  {
    key: "MEZZA_GARUFFA",
    name: "Mezza garuffa",
    family: "CUSHION",
    difficulty: 3,
    weights: { ITALIANA: 7, GORIZIANA: 9, TUTTI_DOPPI: 8 },
  },
  {
    key: "GANCIO",
    name: "Gancio",
    family: "CUSHION",
    difficulty: 4,
    weights: { ITALIANA: 3, GORIZIANA: 5, TUTTI_DOPPI: 4 },
  },
  {
    key: "PARABOLA",
    name: "Parabola",
    family: "CUSHION",
    difficulty: 5,
    weights: { ITALIANA: 2, GORIZIANA: 3, TUTTI_DOPPI: 3 },
  },
  {
    key: "TRE_SPONDE_CALCIO",
    name: "Tre sponde di calcio",
    family: "CUSHION",
    difficulty: 3,
    weights: { ITALIANA: 8, GORIZIANA: 15, TUTTI_DOPPI: 9 },
  },
  {
    key: "CINQUE_SPONDE_CALCIO",
    name: "Cinque sponde di calcio",
    family: "CUSHION",
    difficulty: 4,
    weights: { ITALIANA: 5, GORIZIANA: 9, TUTTI_DOPPI: 5 },
  },
];

const PALLINO_SHOT: ShotDefinition = {
  key: "PALLINO",
  name: "Giocata sul pallino",
  family: "DIRECT",
  difficulty: 3,
  weights: { ITALIANA: 0, GORIZIANA: 0, TUTTI_DOPPI: 0 },
};

type ItalianShotScoreProfile = {
  plain: readonly number[];
  withPallino: readonly number[];
};

const ITALIAN_SHOT_SCORE_PROFILES: Record<
  string,
  ItalianShotScoreProfile
> = {
  RADDRIZZO: { plain: [8, 10], withPallino: [11, 12, 13, 14] },
  ROVESCIO: { plain: [8, 10], withPallino: [11, 12, 13, 14] },
  TRAVERSINO_PIANO: { plain: [2, 8], withPallino: [5, 6, 11, 12] },
  TRAVERSINO_PASSATE: { plain: [4, 8, 10], withPallino: [7, 11, 12] },
  GIRO: { plain: [4, 6, 8, 10], withPallino: [7, 8, 9, 10, 11] },
  GIRONE: { plain: [4, 6, 8, 10], withPallino: [7, 8, 9, 10, 11] },
  ANGOLO_PRIMA: { plain: [2, 4, 6], withPallino: [5, 6, 7, 8, 9, 10] },
  ANGOLO_SECONDA: {
    plain: [2, 4, 6],
    withPallino: [5, 6, 7, 8, 9, 10],
  },
  STRISCIO: { plain: [2, 4, 6], withPallino: [5, 6, 7, 8, 9] },
  CANDELA: { plain: [2, 8], withPallino: [5, 11] },
  SPONDA_BIGLIA: {
    plain: [2, 4, 6],
    withPallino: [5, 6, 7, 8, 9, 10],
  },
  BRICOLLA: {
    plain: [2, 4, 6, 8, 10],
    withPallino: [5, 6, 7, 8, 9, 10, 11, 13],
  },
  GARUFFA: { plain: [2, 6, 8], withPallino: [5, 6, 9, 11] },
  MEZZA_GARUFFA: { plain: [2, 6, 8], withPallino: [5, 6, 9, 11] },
  GANCIO: { plain: [2, 4, 6], withPallino: [5, 6, 7, 8, 9, 10] },
  PARABOLA: { plain: [2, 4, 6], withPallino: [5, 6, 7, 8, 9, 10] },
  TRE_SPONDE_CALCIO: {
    plain: [2, 4, 6, 8],
    withPallino: [5, 6, 7, 8, 9, 10, 11],
  },
  CINQUE_SPONDE_CALCIO: {
    plain: [2, 4, 6, 8],
    withPallino: [5, 6, 7, 8, 9, 10, 11],
  },
};

const GORIZIANA_DIRECT_PREFERRED = [
  18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50,
  52,
] as const;
const GORIZIANA_CUSHION_PREFERRED = [
  20, 24, 28, 32, 36, 40, 44, 48, 52,
] as const;
const TUTTI_DOPPI_DIRECT_PREFERRED = [
  40, 44, 48, 52, 80, 84, 88, 92,
] as const;
const TUTTI_DOPPI_CUSHION_PREFERRED = [
  16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56,
] as const;

type OnePassShotScoreProfile = {
  max: number;
  preferred?: readonly number[];
};

const ONE_PASS_SHOT_SCORE_PROFILES: Record<
  Exclude<MatchSpecialty, "ITALIANA">,
  Record<string, OnePassShotScoreProfile>
> = {
  GORIZIANA: {
    GARUFFA: { max: 72, preferred: [16, 36, 40] },
    MEZZA_GARUFFA: { max: 72, preferred: [16, 36, 40] },
    PARABOLA: { max: 52 },
  },
  TUTTI_DOPPI: {
    GARUFFA: { max: 72, preferred: [16, 36, 40] },
    MEZZA_GARUFFA: { max: 72, preferred: [16, 36, 40] },
    PARABOLA: { max: 52 },
  },
};

const FOUL_BASE_POINTS: Record<MatchSpecialty, number> = {
  ITALIANA: 2,
  GORIZIANA: 2,
  TUTTI_DOPPI: 4,
};

export function buildIndividualGameChronicle({
  gameId,
  specialty,
  winnerSide,
  playerOneScore,
  playerTwoScore,
  playerOnePerformanceRating,
  playerTwoPerformanceRating,
  playerOne,
  playerTwo,
  playerOneName = "Il primo giocatore",
  playerTwoName = "Il secondo giocatore",
}: {
  gameId: number;
  specialty: MatchSpecialty;
  winnerSide: IndividualChroniclePlayerSide;
  playerOneScore: number;
  playerTwoScore: number;
  playerOnePerformanceRating: number;
  playerTwoPerformanceRating: number;
  playerOne: IndividualChroniclePlayerValues;
  playerTwo: IndividualChroniclePlayerValues;
  playerOneName?: string;
  playerTwoName?: string;
}) {
  const allowedScores = MATCH_SHOT_SCORES[specialty];
  const random = createSeededRandom(
    gameId * 97 + playerOneScore * 17 + playerTwoScore * 31
  );
  const narrativeRandom = createSeededRandom(
    gameId * 193 + playerOneScore * 29 + playerTwoScore * 43
  );
  const playerOneRawAttempts = getAttemptCount(
    specialty,
    playerOneScore,
    playerOnePerformanceRating,
    random
  );
  const playerTwoRawAttempts = getAttemptCount(
    specialty,
    playerTwoScore,
    playerTwoPerformanceRating,
    random
  );
  const pairedAttempts = Math.max(
    playerOneRawAttempts,
    winnerSide === "PLAYER_ONE"
      ? playerTwoRawAttempts + 1
      : playerTwoRawAttempts
  );
  const playerOneAttempts = pairedAttempts;
  const playerTwoAttempts =
    winnerSide === "PLAYER_ONE" ? pairedAttempts - 1 : pairedAttempts;
  const playerOneShots = distributeScore({
    total: playerOneScore,
    attempts: playerOneAttempts,
    allowedScores,
    requireLastScore: winnerSide === "PLAYER_ONE",
    minimumMisses: getMinimumMisses(specialty, playerOneAttempts, playerOne),
    missProbability: getMissProbability(specialty, playerOne),
    random,
  });
  const playerTwoShots = distributeScore({
    total: playerTwoScore,
    attempts: playerTwoAttempts,
    allowedScores,
    requireLastScore: winnerSide === "PLAYER_TWO",
    minimumMisses: getMinimumMisses(specialty, playerTwoAttempts, playerTwo),
    missProbability: getMissProbability(specialty, playerTwo),
    random,
  });
  const rawChronicle: Array<
    Omit<
      IndividualChronicleShot,
      | "phase"
      | "technicalCommentary"
      | "commentary"
      | "highlight"
      | "shotName"
      | "shotFamily"
      | "outcome"
    >
  > = [];
  let playerOneTotal = 0;
  let playerTwoTotal = 0;

  for (let index = 0; index < playerOneAttempts; index += 1) {
    const playerOnePoints = playerOneShots[index];

    if (playerOnePoints !== undefined) {
      playerOneTotal += playerOnePoints;
      rawChronicle.push({
        order: rawChronicle.length + 1,
        playerSide: "PLAYER_ONE",
        scoringSide: "PLAYER_ONE",
        points: playerOnePoints,
        playerOneTotal,
        playerTwoTotal,
      });
    }

    const playerTwoPoints = playerTwoShots[index];

    if (playerTwoPoints !== undefined) {
      playerTwoTotal += playerTwoPoints;
      rawChronicle.push({
        order: rawChronicle.length + 1,
        playerSide: "PLAYER_TWO",
        scoringSide: "PLAYER_TWO",
        points: playerTwoPoints,
        playerOneTotal,
        playerTwoTotal,
      });
    }
  }

  return rawChronicle.map((rawShot, index) => {
    const previousShot = rawChronicle[index - 1];
    const previousPlayerOneTotal = previousShot?.playerOneTotal ?? 0;
    const previousPlayerTwoTotal = previousShot?.playerTwoTotal ?? 0;
    const isFinalShot = index === rawChronicle.length - 1;
    const scoringPlayer =
      rawShot.scoringSide === "PLAYER_ONE" ? playerOne : playerTwo;
    const potentialOffender =
      rawShot.scoringSide === "PLAYER_ONE" ? playerTwo : playerOne;
    const adverseShot = selectShot(
      specialty,
      potentialOffender,
      rawShot.points,
      narrativeRandom
    );
    const adverseEvent =
      rawShot.points > 0 &&
      canBeAdverseEvent(specialty, rawShot.points) &&
      narrativeRandom() <
        getAdverseEventProbability(potentialOffender, adverseShot);
    const playerSide = adverseEvent
      ? oppositeSide(rawShot.scoringSide)
      : rawShot.scoringSide;
    const actingPlayer = adverseEvent ? potentialOffender : scoringPlayer;
    const actingPlayerName =
      playerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
    const scoringPlayerName =
      rawShot.scoringSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
    const selectedShot = adverseEvent
      ? adverseShot
      : selectShot(specialty, actingPlayer, rawShot.points, narrativeRandom);
    const outcome = getShotOutcome({
      specialty,
      shot: selectedShot,
      player: actingPlayer,
      points: rawShot.points,
      adverseEvent,
      random: narrativeRandom,
    });
    const enrichedShot = {
      ...rawShot,
      playerSide,
      shotName: getShotName(selectedShot),
      shotFamily: selectedShot.family,
      outcome,
    };
    const narrative = buildShotNarrative({
      specialty,
      shot: enrichedShot,
      shotDefinition: selectedShot,
      previousPlayerOneTotal,
      previousPlayerTwoTotal,
      isFinalShot,
      actingPlayerName,
      scoringPlayerName,
      random: narrativeRandom,
    });

    return {
      ...enrichedShot,
      phase: getChroniclePhase(index, rawChronicle.length),
      ...narrative,
    };
  });
}

function getAttemptCount(
  specialty: MatchSpecialty,
  total: number,
  performanceRating: number,
  random: () => number
) {
  const rating = clamp(performanceRating, 1, 100);
  const expectedAverage: Record<MatchSpecialty, number> = {
    ITALIANA: 1.25 + rating * 0.032,
    GORIZIANA: 4.5 + rating * 0.115,
    TUTTI_DOPPI: 7 + rating * 0.16,
  };
  const variation = 0.9 + random() * 0.2;
  const minimumAttempts: Record<MatchSpecialty, number> = {
    ITALIANA: 16,
    GORIZIANA: 22,
    TUTTI_DOPPI: 26,
  };

  return Math.max(
    minimumAttempts[specialty],
    Math.ceil(total / (expectedAverage[specialty] * variation))
  );
}

function getMinimumMisses(
  specialty: MatchSpecialty,
  attempts: number,
  player: IndividualChroniclePlayerValues
) {
  return Math.max(
    3,
    Math.round(attempts * getMissProbability(specialty, player) * 0.72)
  );
}

function getMissProbability(
  specialty: MatchSpecialty,
  player: IndividualChroniclePlayerValues
) {
  const execution = getExecutionRating(player, specialty);
  const base: Record<MatchSpecialty, number> = {
    ITALIANA: 0.4,
    GORIZIANA: 0.44,
    TUTTI_DOPPI: 0.42,
  };

  return clamp(base[specialty] + (50 - execution) * 0.0022, 0.25, 0.55);
}

function getExecutionRating(
  player: IndividualChroniclePlayerValues,
  specialty: MatchSpecialty
) {
  const specialtySkill =
    specialty === "ITALIANA"
      ? player.diretto
      : specialty === "GORIZIANA"
        ? player.sponde
        : player.diretto * 0.65 + player.sponde * 0.35;
  const condition =
    (clamp(player.form, 1, 10) + clamp(player.morale, 1, 10)) * 2;

  return clamp(
    player.precisione * 0.32 +
      specialtySkill * 0.32 +
      player.misura * 0.14 +
      player.mentalita * 0.1 +
      player.realizzazione * 0.08 +
      clamp(player.experience, 0, 100) * 0.02 +
      condition * 0.02,
    1,
    100
  );
}

function distributeScore({
  total,
  attempts,
  allowedScores,
  requireLastScore,
  minimumMisses,
  missProbability,
  random,
}: {
  total: number;
  attempts: number;
  allowedScores: readonly number[];
  requireLastScore: boolean;
  minimumMisses: number;
  missProbability: number;
  random: () => number;
}) {
  const memo = new Map<string, boolean>();
  const scores: number[] = [];
  let remaining = total;
  let remainingMisses = minimumMisses;

  for (let index = 0; index < attempts; index += 1) {
    const remainingAttempts = attempts - index - 1;
    const feasibleScores = [0, ...allowedScores].filter((score) => {
      if (score > remaining) return false;

      const nextTotal = remaining - score;
      const nextMinimumMisses = Math.max(
        0,
        remainingMisses - (score === 0 ? 1 : 0)
      );

      if (remainingAttempts === 0) {
        return (
          nextTotal === 0 &&
          nextMinimumMisses === 0 &&
          (!requireLastScore || score > 0)
        );
      }

      return requireLastScore
        ? canRepresentWithPositiveLast(
            nextTotal,
            remainingAttempts,
            allowedScores,
            memo,
            nextMinimumMisses
          )
        : canRepresent(
            nextTotal,
            remainingAttempts,
            allowedScores,
            memo,
            nextMinimumMisses
          );
    });

    if (feasibleScores.length === 0) {
      throw new Error("INDIVIDUAL_CHRONICLE_SCORE_NOT_REPRESENTABLE");
    }

    const requiredMissProbability =
      remainingMisses / Math.max(1, remainingAttempts + 1);
    const canMiss = feasibleScores.includes(0);
    const shouldMiss =
      canMiss && random() < Math.max(requiredMissProbability, missProbability);
    const scoringOptions = feasibleScores.filter((score) => score > 0);
    const average = remaining / Math.max(1, remainingAttempts + 1);
    const desiredScore = average * (0.62 + random() * 0.56);
    const selectedScore = shouldMiss
      ? 0
      : (scoringOptions.length > 0 ? scoringOptions : feasibleScores).reduce(
          (best, candidate) =>
            Math.abs(candidate - desiredScore) <
            Math.abs(best - desiredScore)
              ? candidate
              : best
        );

    scores.push(selectedScore);
    remaining -= selectedScore;
    if (selectedScore === 0) remainingMisses = Math.max(0, remainingMisses - 1);
  }

  return scores;
}

function canRepresentWithPositiveLast(
  total: number,
  attempts: number,
  allowedScores: readonly number[],
  memo: Map<string, boolean>,
  minimumMisses: number
) {
  return allowedScores.some(
    (lastScore) =>
      lastScore <= total &&
      canRepresent(
        total - lastScore,
        attempts - 1,
        allowedScores,
        memo,
        minimumMisses
      )
  );
}

function canRepresent(
  total: number,
  attempts: number,
  allowedScores: readonly number[],
  memo: Map<string, boolean>,
  minimumMisses: number
): boolean {
  if (attempts === 0) return total === 0 && minimumMisses === 0;
  if (minimumMisses > attempts) return false;
  if (total < 0 || total > attempts * allowedScores.at(-1)!) return false;

  const memoKey = `${total}:${attempts}:${minimumMisses}`;
  const cached = memo.get(memoKey);

  if (cached !== undefined) return cached;

  const representable = [0, ...allowedScores].some(
    (score) =>
      score <= total &&
      canRepresent(
        total - score,
        attempts - 1,
        allowedScores,
        memo,
        Math.max(0, minimumMisses - (score === 0 ? 1 : 0))
      )
  );
  memo.set(memoKey, representable);

  return representable;
}

function selectShot(
  specialty: MatchSpecialty,
  player: IndividualChroniclePlayerValues,
  points: number,
  random: () => number
) {
  if (specialty === "ITALIANA" && points === 3) {
    return PALLINO_SHOT;
  }

  const candidates = SHOT_DEFINITIONS.filter((shot) =>
    isShotScoreCompatible(specialty, shot, points)
  ).map((shot) => {
    const familyRating =
      shot.family === "DIRECT" ? player.diretto : player.sponde;
    const creativityFactor =
      shot.difficulty >= 4
        ? 0.65 + clamp(player.creativita, 0, 100) / 180
        : 1;
    const tacticalFactor = 0.8 + clamp(player.tattica, 0, 100) / 250;
    const gorizianaHighScoreFactor =
      specialty === "GORIZIANA" && points > 56
        ? shot.family === "CUSHION"
          ? 2.4
          : 0
        : 1;

    return {
      value: shot,
      weight:
        shot.weights[specialty] *
        getShotScoreAffinity(specialty, shot, points) *
        (0.7 + clamp(familyRating, 0, 100) / 170) *
        creativityFactor *
        tacticalFactor *
        gorizianaHighScoreFactor,
    };
  }).filter((candidate) => candidate.weight > 0);

  return selectWeighted(candidates, random);
}

function getShotScoreAffinity(
  specialty: MatchSpecialty,
  shot: ShotDefinition,
  points: number
) {
  if (points === 0) return 1;

  if (specialty === "ITALIANA") {
    const profile = ITALIAN_SHOT_SCORE_PROFILES[shot.key];

    if (!profile) return 0.65;
    return profile.plain.includes(points) || profile.withPallino.includes(points)
      ? 7
      : 0.18;
  }

  const onePassProfile = ONE_PASS_SHOT_SCORE_PROFILES[specialty][shot.key];

  if (onePassProfile?.preferred) {
    return onePassProfile.preferred.includes(points) ? 8 : 0.35;
  }

  if (specialty === "GORIZIANA") {
    const preferred =
      shot.family === "DIRECT"
        ? GORIZIANA_DIRECT_PREFERRED
        : GORIZIANA_CUSHION_PREFERRED;

    return (preferred as readonly number[]).includes(points) ? 3.4 : 0.7;
  }

  const preferred =
    shot.family === "DIRECT"
      ? TUTTI_DOPPI_DIRECT_PREFERRED
      : TUTTI_DOPPI_CUSHION_PREFERRED;

  return (preferred as readonly number[]).includes(points) ? 3.4 : 0.7;
}

function isShotScoreCompatible(
  specialty: MatchSpecialty,
  shot: ShotDefinition,
  points: number
) {
  if (points === 0) return true;

  if (specialty === "ITALIANA") {
    return getItalianScoreOptions(shot, points).length > 0;
  }

  const onePassProfile = ONE_PASS_SHOT_SCORE_PROFILES[specialty][shot.key];

  if (onePassProfile && points > onePassProfile.max) return false;

  if (specialty === "GORIZIANA") {
    if (shot.family === "DIRECT") return points <= 56;
    return points % 4 === 0;
  }

  return true;
}

function getAdverseEventProbability(
  player: IndividualChroniclePlayerValues,
  shot: ShotDefinition
) {
  const pressureControl =
    player.precisione * 0.55 +
    player.mentalita * 0.25 +
    clamp(player.experience, 0, 100) * 0.1 +
    clamp(player.form, 1, 10);

  return clamp(
    0.018 + (100 - pressureControl) * 0.00065 + shot.difficulty * 0.006,
    0.025,
    0.13
  );
}

function canBeAdverseEvent(specialty: MatchSpecialty, points: number) {
  return specialty !== "ITALIANA" || points !== 3;
}

function getShotOutcome({
  specialty,
  shot,
  player,
  points,
  adverseEvent,
  random,
}: {
  specialty: MatchSpecialty;
  shot: ShotDefinition;
  player: IndividualChroniclePlayerValues;
  points: number;
  adverseEvent: boolean;
  random: () => number;
}): IndividualChronicleShotOutcome {
  if (adverseEvent) {
    if (specialty === "ITALIANA" && points % 2 === 1) {
      return "OWN_BALL_PINS";
    }

    const foulProbability =
      shot.key === "PARABOLA" ? 0.72 : 0.42 + shot.difficulty * 0.04;

    return random() < foulProbability ? "FOUL" : "OWN_BALL_PINS";
  }

  const defenseRating =
    player.misura * 0.45 + player.difesa * 0.35 + player.tattica * 0.2;
  const bigShotPenalty = isBigShot(specialty, points) ? 0.08 : 0;
  const defenseProbability = clamp(
    0.2 + defenseRating * 0.006 - shot.difficulty * 0.035 - bigShotPenalty,
    0.18,
    0.78
  );
  const goodDefense = random() < defenseProbability;

  if (points > 0) return goodDefense ? "COMPLETE" : "PARTIAL_POINTS";
  return goodDefense ? "PARTIAL_DEFENSE" : "ERROR";
}

function getShotName(
  shot: ShotDefinition,
) {
  return shot.name;
}

export function buildIndividualGameSummary({
  chronicle,
  winnerSide,
  winnerName,
  specialty,
}: {
  chronicle: IndividualChronicleShot[];
  winnerSide: IndividualChroniclePlayerSide;
  winnerName: string;
  specialty: MatchSpecialty;
}) {
  const finalShot = chronicle.at(-1);

  if (!finalShot) return "Cronaca non disponibile.";

  let currentLeader: IndividualChroniclePlayerSide | null = null;
  let leadChanges = 0;
  let winnerMaximumDeficit = 0;

  for (const shot of chronicle) {
    const leader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);

    if (leader && currentLeader && leader !== currentLeader) leadChanges += 1;
    if (leader) currentLeader = leader;

    const winnerDeficit =
      winnerSide === "PLAYER_ONE"
        ? shot.playerTwoTotal - shot.playerOneTotal
        : shot.playerOneTotal - shot.playerTwoTotal;
    winnerMaximumDeficit = Math.max(winnerMaximumDeficit, winnerDeficit);
  }

  const targetPoints = MATCH_TARGET_POINTS[specialty];
  const biggestShot = Math.max(...chronicle.map((shot) => shot.points));
  const partialShots = chronicle.filter(
    (shot) =>
      shot.outcome === "PARTIAL_POINTS" ||
      shot.outcome === "PARTIAL_DEFENSE"
  ).length;
  const adverseEvents = chronicle.filter(
    (shot) => shot.outcome === "FOUL" || shot.outcome === "OWN_BALL_PINS"
  ).length;
  const finalScore = `${finalShot.playerOneTotal}–${finalShot.playerTwoTotal}`;
  const comeback = winnerMaximumDeficit >= targetPoints * 0.15;
  let opening: string;

  if (comeback) {
    opening = `${winnerName} resta freddo nel momento più difficile e costruisce la rimonta tiro dopo tiro.`;
  } else if (leadChanges >= 3) {
    opening = `Il comando cambia ${leadChanges} volte prima dello strappo decisivo di ${winnerName}.`;
  } else {
    opening = `${winnerName} costruisce il successo alternando realizzazione, misura e difesa.`;
  }

  const middle = isBigShot(specialty, biggestShot)
    ? `Il colpo più pesante vale ${biggestShot} punti; in ${partialShots} occasioni arrivano soltanto i punti o soltanto la copertura.`
    : `In ${partialShots} occasioni punti e copertura non arrivano insieme.`;
  const discipline =
    adverseEvents > 0
      ? ` Gli errori che assegnano punti all'avversario sono ${adverseEvents}.`
      : " Nessuno regala punti con falli o passaggi della propria sui birilli.";

  const closing =
    finalShot.playerSide === finalShot.scoringSide
      ? `Il tiro decisivo da ${finalShot.points} punti fissa il ${finalScore}.`
      : `L'errore decisivo assegna ${finalShot.points} punti e fissa il ${finalScore}.`;

  return `${opening} ${middle}${discipline} ${closing}`;
}

export function selectIndividualChronicleHighlights({
  chronicle,
  gameId,
}: {
  chronicle: IndividualChronicleShot[];
  gameId: number;
}) {
  const targetCount = Math.min(chronicle.length, 20 + Math.abs(gameId) % 6);

  if (chronicle.length <= targetCount) return chronicle;

  const lastIndex = chronicle.length - 1;
  const selectedIndexes = new Set([
    0,
    1,
    Math.floor(lastIndex * 0.25),
    Math.floor(lastIndex * 0.5),
    Math.floor(lastIndex * 0.75),
    lastIndex - 1,
    lastIndex,
  ]);
  const rankedShots = chronicle
    .map((shot, index) => ({
      index,
      importance: getChronicleShotImportance(shot, index, lastIndex),
    }))
    .sort(
      (left, right) =>
        right.importance - left.importance || left.index - right.index
    );

  for (const candidate of rankedShots) {
    if (selectedIndexes.size >= targetCount) break;
    selectedIndexes.add(candidate.index);
  }

  return [...selectedIndexes]
    .sort((left, right) => left - right)
    .map((index) => chronicle[index]);
}

export function buildIndividualGameBroadcast({
  chronicle,
  gameId,
  specialty,
  playerOneName,
  playerTwoName,
  gameOrder = 1,
  matchPlayerOneWins = 0,
  matchPlayerTwoWins = 0,
  isDecisiveGame = true,
}: {
  chronicle: IndividualChronicleShot[];
  gameId: number;
  specialty: MatchSpecialty;
  playerOneName: string;
  playerTwoName: string;
  gameOrder?: number;
  matchPlayerOneWins?: number;
  matchPlayerTwoWins?: number;
  isDecisiveGame?: boolean;
}) {
  const selectedShots = selectIndividualChronicleHighlights({
    chronicle,
    gameId,
  });
  const templateOffset = Math.floor(
    createSeededRandom(gameId * 7_919 + 113)() * 997
  );

  return selectedShots.map((shot, selectedIndex) => {
    const chronicleIndex = Math.max(
      0,
      chronicle.findIndex((candidate) => candidate.order === shot.order)
    );
    const previousShot = chronicle[chronicleIndex - 1] ?? null;
    const previousSelectedShot = selectedShots[selectedIndex - 1] ?? null;
    const playerName =
      shot.playerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
    const opponentName =
      shot.playerSide === "PLAYER_ONE" ? playerTwoName : playerOneName;
    const scoringPlayerName =
      shot.scoringSide === "PLAYER_ONE" ? playerOneName : playerTwoName;

    return {
      ...shot,
      commentary: buildBroadcastMoment({
        shot,
        previousShot,
        previousSelectedShot,
        chronicle,
        chronicleIndex,
        selectedIndex,
        selectedCount: selectedShots.length,
        specialty,
        playerName,
        opponentName,
        scoringPlayerName,
        gameOrder,
        matchPlayerOneWins,
        matchPlayerTwoWins,
        isDecisiveGame,
        templateOffset,
      }),
    };
  });
}

function buildBroadcastMoment({
  shot,
  previousShot,
  previousSelectedShot,
  chronicle,
  chronicleIndex,
  selectedIndex,
  selectedCount,
  specialty,
  playerName,
  opponentName,
  scoringPlayerName,
  gameOrder,
  matchPlayerOneWins,
  matchPlayerTwoWins,
  isDecisiveGame,
  templateOffset,
}: {
  shot: IndividualChronicleShot;
  previousShot: IndividualChronicleShot | null;
  previousSelectedShot: IndividualChronicleShot | null;
  chronicle: IndividualChronicleShot[];
  chronicleIndex: number;
  selectedIndex: number;
  selectedCount: number;
  specialty: MatchSpecialty;
  playerName: string;
  opponentName: string;
  scoringPlayerName: string;
  gameOrder: number;
  matchPlayerOneWins: number;
  matchPlayerTwoWins: number;
  isDecisiveGame: boolean;
  templateOffset: number;
}) {
  const target = MATCH_TARGET_POINTS[specialty];
  const score = `${shot.playerOneTotal}–${shot.playerTwoTotal}`;
  const technical = getBroadcastTechnicalDetail(shot);
  const isFinal = shot.highlight === "WINNER";
  const isTie =
    shot.playerOneTotal === shot.playerTwoTotal && shot.playerOneTotal > 0;
  const previousLeader = previousShot
    ? getLeader(previousShot.playerOneTotal, previousShot.playerTwoTotal)
    : null;
  const currentLeader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);
  const isLeadChange =
    previousLeader !== null &&
    currentLeader !== null &&
    previousLeader !== currentLeader;
  const leaderScore = Math.max(shot.playerOneTotal, shot.playerTwoTotal);
  const margin = Math.abs(shot.playerOneTotal - shot.playerTwoTotal);
  const scorelessRun = countPreviousScorelessShots(chronicle, chronicleIndex);
  const lateAndClose = leaderScore >= target * 0.7 && margin <= target * 0.12;
  const selectionProgress =
    selectedCount > 1 ? selectedIndex / (selectedCount - 1) : 1;

  if (isFinal) {
    if (!isDecisiveGame) {
      const gameWinnerName = scoringPlayerName;
      const gameLoserName =
        shot.playerSide === shot.scoringSide ? opponentName : playerName;

      return selectBroadcastTemplate(
        [
          `Il tavolo arriva alla bilia che decide la partita ${gameOrder}. ${technical} ${gameWinnerName} si prende questo capitolo sul ${score}, ma l'incontro continua: ora è ${matchPlayerOneWins}–${matchPlayerTwoWins}. ${gameLoserName} ha già ripreso il gesso in mano.`,
          `La sala capisce che la partita ${gameOrder} è arrivata al suo punto decisivo. ${technical} ${gameWinnerName} porta a casa il capitolo, non ancora l'incontro: il conto complessivo è ${matchPlayerOneWins}–${matchPlayerTwoWins}, e dall'altra sedia si prepara subito la risposta.`,
          `C'è la chiusura della partita ${gameOrder}, non quella dell'incontro. ${technical} Sul ${score} arrivano gli applausi per ${gameWinnerName}, mentre ${gameLoserName} resta vicino al tavolo. Il prossimo capitolo vale già una reazione.`,
        ],
        selectedIndex + templateOffset
      );
    }

    if (shot.playerSide !== shot.scoringSide) {
      return `Il tavolo sceglie il modo più amaro di chiudere. ${technical} Per un istante non si sente nulla: poi ${scoringPlayerName} guarda il tabellone, ${score}, e può finalmente lasciare uscire il respiro. Questa volta è finita davvero: l'incontro è suo.`;
    }

    return selectBroadcastTemplate(
      [
        `Adesso il rumore della sala si spegne. ${playerName} resta in piedi, studia la chiusura e sa che questa bilia pesa più delle altre. ${technical} Le bilie si fermano, il tabellone dice ${score}: è finita davvero, ${playerName} ha vinto l'incontro.`,
        `${playerName} torna al tavolo con l'incontro nelle mani. Niente fretta: un ultimo sguardo alla linea, un respiro, poi la stecca parte. ${technical} Sul ${score} si alzano gli applausi. È il punto che chiude tutto.`,
        `C'è un tiro per chiudere l'incontro e tutta la sala lo ha capito. ${playerName} prende tempo, si abbassa e non arretra. ${technical} Il ${score} è la sentenza finale: questa volta non c'è un'altra partita.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (shot.outcome === "FOUL" || shot.outcome === "OWN_BALL_PINS") {
    const consequence =
      selectionProgress > 0.65
        ? `In questa fase non è soltanto un errore: sono punti e fiducia consegnati a ${scoringPlayerName}.`
        : `Il regalo finisce sul tabellone di ${scoringPlayerName}, che ora può cambiare il tono della partita.`;

    return `${selectBroadcastTemplate(
      [
        `La mano di ${playerName} tradisce proprio sul più delicato.`,
        `${playerName} vede il disegno, ma nell'esecuzione qualcosa si spezza.`,
        `È il primo vero colpo alla fiducia di ${playerName}.`,
      ],
      selectedIndex + templateOffset
    )} ${technical} ${consequence} Il parziale è ${score}.`;
  }

  if (isTie) {
    return `${playerName} rifiuta di lasciar scappare l'avversario. ${technical} Quando l'ultima bilia rallenta, sul tabellone c'è ${score}. Tutto da rifare, e adesso ogni scelta comincia a pesare.`;
  }

  if (isLeadChange || shot.highlight === "LEAD_CHANGE") {
    return selectBroadcastTemplate(
      [
        `${playerName} non si accontenta di rientrare: vuole prendersi la partita. ${technical} Le cifre cambiano padrone, ${score}. Ora tocca a ${opponentName} trovare una risposta.`,
        `La partita gira qui. ${playerName} riconosce il momento e non lo lascia passare: ${technical} Sul ${score} cambia chi comanda, e con il comando cambia anche il peso della prossima bilia.`,
        `Sembrava un'altra fase favorevole a ${opponentName}; invece ${playerName} resta aggrappato al tavolo. ${technical} È sorpasso sul ${score}, con la sala che finalmente si accende.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (lateAndClose) {
    return selectBroadcastTemplate(
      [
        `Qui la stecca pesa. ${playerName} ha davanti un tiro che può spostare tutta la pressione e lo affronta senza scappare: ${technical} Il ${score} tiene entrambi dentro la partita; nessuno, ormai, può permettersi una bilia distratta.`,
        `Siamo nel tratto in cui persino il silenzio sembra fare rumore. ${playerName} sceglie ${shot.shotName.toLowerCase()} e si prende il rischio: ${technical} Sul ${score} basta un dettaglio per cambiare tutto.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (shot.highlight === "BIG_SHOT") {
    return selectBroadcastTemplate(
      [
        `Questo è il colpo che sveglia la sala. ${playerName} vede una linea coraggiosa e la stecca con convinzione: ${technical} Sono ${shot.points} punti che valgono più del numero, perché obbligano ${opponentName} a inseguire sul ${score}.`,
        `${playerName} sente che il tavolo gli sta offrendo qualcosa e decide di prenderlo. ${technical} Il pubblico accompagna le ultime corse delle bilie: il parziale sale a ${score} e la partita cambia temperatura.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (shot.points === 0 && shot.outcome === "ERROR") {
    const pause =
      scorelessRun >= 2
        ? `È un altro passaggio a vuoto, e la sedia sembra allontanarsi dal tavolo.`
        : `Nessun punto: ${opponentName} si rialza e capisce di avere un'occasione.`;

    return `${selectBroadcastTemplate(
      [
        `${playerName} rimane qualche secondo sulla linea, come se volesse convincersi che il varco esiste.`,
        `La scelta di ${playerName} è ambiziosa, forse troppo per questo momento.`,
        `Per la prima volta ${playerName} esita davvero prima di scendere sul tiro.`,
      ],
      selectedIndex + templateOffset
    )} ${technical} ${pause}`;
  }

  if (shot.points === 0 && shot.outcome === "PARTIAL_DEFENSE") {
    return `${playerName} non trova i birilli, ma non consegna il tavolo. ${technical} È una di quelle giocate che non fanno alzare il punteggio eppure costringono ${opponentName} a pensare: qui la pazienza conta quanto la realizzazione.`;
  }

  if (shot.outcome === "PARTIAL_POINTS") {
    return selectBroadcastTemplate(
      [
        `${playerName} sceglie di attaccare e i punti arrivano. ${technical} Manca però il riparo: ${opponentName} resta con gli occhi sul tavolo e sa che può rispondere. Il parziale è ${score}.`,
        `La realizzazione c'è, la protezione no. ${technical} ${playerName} aggiunge ${shot.points} punti, ma deve tornare alla sedia sapendo di aver lasciato una porta aperta a ${opponentName}.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (shot.outcome === "COMPLETE") {
    const controlLine =
      previousSelectedShot?.scoringSide === shot.scoringSide
        ? `${playerName} sta cucendo insieme punti e controllo; ${opponentName} fatica a spezzare il ritmo.`
        : `${playerName} rimette la propria voce dentro la partita.`;

    return selectBroadcastTemplate(
      [
        `${playerName} torna al tavolo con un'idea precisa. ${technical} Il punteggio va sul ${score}, ma soprattutto arriva una rimanenza che obbliga ${opponentName} a ricominciare da lontano. ${controlLine}`,
        `Qui non basta fare punti: bisogna anche lasciare un problema. ${playerName} riesce in entrambe le cose. ${technical} Sul ${score} l'inerzia comincia a inclinarsi dalla sua parte.`,
        `Niente gesto teatrale, solo una giocata pensata bene. ${technical} ${playerName} si prende ${shot.points} punti e una piccola porzione di tavolo; il ${score} racconta una partita che sta prendendo forma.`,
      ],
      selectedIndex + templateOffset
    );
  }

  const openingMood =
    selectionProgress < 0.25
      ? `Sono ancora schermaglie, ma ${opponentName} ha già capito che ogni spazio verrà conteso.`
      : `Non è lo strappo decisivo, è il modo con cui ${playerName} resta dentro la partita.`;

  return `${playerName} prova a dare ritmo alla propria partita. ${technical} Il parziale diventa ${score}. ${openingMood}`;
}

function getBroadcastTechnicalDetail(shot: IndividualChronicleShot) {
  return shot.technicalCommentary
    .replace(/^.+? si prende il tavolo e cerca il tiro della chiusura\. /, "")
    .replace(/ L'esecuzione riesce e la partita termina qui\.$/, "")
    .replace(
      "Giocata sul pallino: l'avversaria trova il pallino: 3 punti realizzati",
      "L'avversaria trova il pallino: 3 punti"
    );
}

function selectBroadcastTemplate(templates: string[], selectedIndex: number) {
  return templates[Math.abs(selectedIndex) % templates.length];
}

function countPreviousScorelessShots(
  chronicle: IndividualChronicleShot[],
  chronicleIndex: number
) {
  let count = 0;

  for (let index = chronicleIndex - 1; index >= 0; index -= 1) {
    if (chronicle[index].points > 0) break;
    count += 1;
  }

  return count;
}

export function buildIndividualGameIntroduction({
  gameId,
  gameOrder = 1,
  matchPlayerOneWinsBefore = 0,
  matchPlayerTwoWinsBefore = 0,
  isTournamentFinal = false,
  venue,
  tournamentName,
  stageLabel,
  specialty,
  playerOneName,
  playerTwoName,
  playerOneRanking,
  playerTwoRanking,
  playerOneOverall,
  playerTwoOverall,
  playerOne,
  playerTwo,
}: {
  gameId?: number;
  gameOrder?: number;
  matchPlayerOneWinsBefore?: number;
  matchPlayerTwoWinsBefore?: number;
  isTournamentFinal?: boolean;
  venue: string;
  tournamentName: string;
  stageLabel: string;
  specialty: MatchSpecialty;
  playerOneName: string;
  playerTwoName: string;
  playerOneRanking?: number | null;
  playerTwoRanking?: number | null;
  playerOneOverall?: number | null;
  playerTwoOverall?: number | null;
  playerOne?: IndividualChroniclePlayerValues;
  playerTwo?: IndividualChroniclePlayerValues;
}) {
  const targetPoints = MATCH_TARGET_POINTS[specialty];
  const random = createSeededRandom((gameId ?? 1) * 3_571 + 41);
  const rankingLine = getRankingIntroduction(
    playerOneName,
    playerTwoName,
    playerOneRanking,
    playerTwoRanking
  );
  const overallLine = getOverallIntroduction(
    playerOneName,
    playerTwoName,
    playerOneOverall,
    playerTwoOverall
  );
  const styleLine = getStyleIntroduction(
    playerOneName,
    playerTwoName,
    playerOne,
    playerTwo,
    specialty
  );
  const atmosphere = selectTemplate(
    [
      `${venue}: le voci si abbassano mentre le bilie vengono sistemate sul panno. Sta per cominciare la ${stageLabel.toLowerCase()} del ${tournamentName}.`,
      `${venue}: luci ferme sul biliardo, pubblico vicino e quel brusio che precede soltanto le partite sentite. ${stageLabel} del ${tournamentName}, si comincia.`,
      `${venue}: resta soltanto il rumore secco delle bilie di prova. ${stageLabel} del ${tournamentName}, adesso il tavolo è tutto per loro.`,
    ],
    random
  );
  const promise = selectTemplate(
    [
      `Si gioca a ${formatSpecialtyName(specialty)} fino a ${targetPoints}: ci sarà spazio per il coraggio, ma la partita finirà nelle mani di chi saprà restare lucido quando il tavolo diventerà pesante.`,
      `${formatSpecialtyName(specialty)}, traguardo a ${targetPoints}. All'inizio parleranno le geometrie; più avanti conteranno il respiro, la scelta e la capacità di non arretrare.`,
      `Il traguardo è a ${targetPoints} punti nella ${formatSpecialtyName(specialty)}. Ogni giocata può sembrare soltanto una linea sul panno, finché non arriva quella che cambia il cuore della partita.`,
    ],
    random
  );

  if (gameOrder > 1) {
    return buildIndividualGameContinuationIntroduction({
      venue,
      specialty,
      targetPoints,
      playerOneName,
      playerTwoName,
      matchPlayerOneWinsBefore,
      matchPlayerTwoWinsBefore,
      isTournamentFinal,
      styleLine,
      random,
    });
  }

  return [
    atmosphere,
    `${playerOneName}${formatRankingSuffix(playerOneRanking)} affronta ${playerTwoName}${formatRankingSuffix(playerTwoRanking)}.`,
    rankingLine,
    styleLine,
    overallLine,
    promise,
  ];
}

function buildIndividualGameContinuationIntroduction({
  venue,
  specialty,
  targetPoints,
  playerOneName,
  playerTwoName,
  matchPlayerOneWinsBefore,
  matchPlayerTwoWinsBefore,
  isTournamentFinal,
  styleLine,
  random,
}: {
  venue: string;
  specialty: MatchSpecialty;
  targetPoints: number;
  playerOneName: string;
  playerTwoName: string;
  matchPlayerOneWinsBefore: number;
  matchPlayerTwoWinsBefore: number;
  isTournamentFinal: boolean;
  styleLine: string;
  random: () => number;
}) {
  const matchScore = `${matchPlayerOneWinsBefore}–${matchPlayerTwoWinsBefore}`;
  const tied = matchPlayerOneWinsBefore === matchPlayerTwoWinsBefore;
  const leaderName =
    matchPlayerOneWinsBefore > matchPlayerTwoWinsBefore
      ? playerOneName
      : playerTwoName;
  const chasingName = leaderName === playerOneName ? playerTwoName : playerOneName;
  const resetLine = selectTemplate(
    [
      `Il breve intervallo è finito. ${venue}: tornano il gesso sulla punta e il rumore delle bilie sistemate, perché nessuno dei due vuole restare seduto.`,
      `Le bilie della partita precedente sono state appena raccolte. A ${venue} il pubblico continua a parlare di quei punti, ma i giocatori hanno già voltato pagina.`,
      `Pochi minuti, un sorso d'acqua e di nuovo sotto le luci di ${venue}. Il punteggio resta, tutto il resto deve ricominciare.`,
    ],
    random
  );

  if (tied) {
    const stakes = isTournamentFinal
      ? `Una partita per parte, ${matchScore}: chi vince adesso alza il trofeo e diventa campione.`
      : `Una partita per parte, ${matchScore}: il prossimo punto nell'incontro vale il passaggio del turno.`;

    return [
      resetLine,
      stakes,
      `${playerOneName} e ${playerTwoName} non hanno più una partita alle spalle né una davanti: hanno soltanto questa.`,
      styleLine,
      `Si decide a ${formatSpecialtyName(specialty)}, traguardo a ${targetPoints}. La tecnica porta fino al finale; lì servirà anche il coraggio di restare sul tiro.`,
      "Le voci calano di nuovo. Non c'è più spazio per amministrare: da questo momento ogni bilia può essere quella che resterà nella memoria.",
    ];
  }

  return [
    resetLine,
    `${leaderName} conduce l'incontro ${matchScore}. Ha preso la prima partita, ma non ha ancora preso l'avversario.`,
    `${chasingName} torna al tavolo con un compito semplice da dire e difficile da compiere: vincere la prossima per rimettere tutto in equilibrio.`,
    styleLine,
    `Ora si gioca a ${formatSpecialtyName(specialty)}, fino a ${targetPoints}. ${leaderName} può chiudere l'incontro; ${chasingName} può trascinarlo alla partita decisiva.`,
    `Nessuno lascia la sala e nessuno abbassa la voce: il ${matchScore} non è un verdetto, è soltanto il punto da cui riparte la sfida.`,
  ];
}

export function buildIndividualGameClosing({
  chronicle,
  specialty,
  winnerSide,
  playerOneName,
  playerTwoName,
  gameOrder,
  matchPlayerOneWins,
  matchPlayerTwoWins,
  isDecisiveGame = true,
  isTournamentFinal = false,
  tournamentName,
}: {
  chronicle: IndividualChronicleShot[];
  specialty: MatchSpecialty;
  winnerSide: IndividualChroniclePlayerSide;
  playerOneName: string;
  playerTwoName: string;
  gameOrder: number;
  matchPlayerOneWins?: number;
  matchPlayerTwoWins?: number;
  isDecisiveGame?: boolean;
  isTournamentFinal?: boolean;
  tournamentName?: string;
}) {
  const finalShot = chronicle.at(-1);

  if (!finalShot) return ["La partita non dispone ancora di un epilogo."];

  const winnerName =
    winnerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
  const loserName =
    winnerSide === "PLAYER_ONE" ? playerTwoName : playerOneName;
  const targetPoints = MATCH_TARGET_POINTS[specialty];
  let currentLeader: IndividualChroniclePlayerSide | null = null;
  let leadChanges = 0;
  let winnerMaximumDeficit = 0;

  for (const shot of chronicle) {
    const leader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);

    if (leader && currentLeader && leader !== currentLeader) leadChanges += 1;
    if (leader) currentLeader = leader;

    const deficit =
      winnerSide === "PLAYER_ONE"
        ? shot.playerTwoTotal - shot.playerOneTotal
        : shot.playerOneTotal - shot.playerTwoTotal;
    winnerMaximumDeficit = Math.max(winnerMaximumDeficit, deficit);
  }

  const biggestShot = chronicle
    .filter((shot) => shot.playerSide === shot.scoringSide)
    .reduce<IndividualChronicleShot | null>(
      (best, shot) => (!best || shot.points > best.points ? shot : best),
      null
    );
  const biggestShotPlayer =
    biggestShot?.playerSide === "PLAYER_TWO" ? playerTwoName : playerOneName;
  const finalScore = `${finalShot.playerOneTotal}–${finalShot.playerTwoTotal}`;
  const seriesPlayerOneWins =
    matchPlayerOneWins ?? (winnerSide === "PLAYER_ONE" ? 2 : 0);
  const seriesPlayerTwoWins =
    matchPlayerTwoWins ?? (winnerSide === "PLAYER_TWO" ? 2 : 0);
  const matchScore = `${seriesPlayerOneWins}–${seriesPlayerTwoWins}`;
  const finalMargin = Math.abs(
    finalShot.playerOneTotal - finalShot.playerTwoTotal
  );
  const random = createSeededRandom(
    gameOrder * 2_009 + finalShot.playerOneTotal * 17 + finalShot.playerTwoTotal
  );
  const matchFlow =
    winnerMaximumDeficit >= targetPoints * 0.15
      ? `${winnerName} era finito lontano, quasi fuori dalla partita. Non ha inseguito il punteggio: ha inseguito una bilia alla volta, finché la rimonta è diventata reale.`
      : leadChanges >= 3
        ? `Il comando è passato di mano ${leadChanges} volte. Nessuno ha accettato la sedia troppo a lungo, finché ${winnerName} ha trovato l'ultimo strappo.`
        : `${winnerName} ha preso lentamente possesso del tavolo: prima la misura, poi i punti, infine quel controllo che ha tolto ossigeno alla risposta.`;
  const decisiveLine =
    finalShot.playerSide === finalShot.scoringSide
      ? `${winnerName} ha visto il tiro della chiusura, ha aspettato che il respiro tornasse calmo e lo ha giocato. Quando le bilie si sono fermate, il tabellone segnava ${finalScore}.`
      : `L'ultima traiettoria di ${loserName} si è spenta nel modo peggiore. I punti sono andati dall'altra parte e il tabellone si è fermato sul ${finalScore}.`;
  const biggestLine = biggestShot
    ? `Resterà negli occhi anche il ${biggestShot.shotName.toLowerCase()} da ${biggestShot.points} di ${biggestShotPlayer}: il colpo che ha fatto cambiare rumore alla sala.`
    : "Non c'è stato un solo colpo da ricordare: la differenza è nata dalla pazienza con cui è stata costruita ogni rimanenza.";
  const loserLine =
    finalMargin <= targetPoints * 0.12
      ? `${loserName} rimane qualche secondo a guardare il panno. È arrivato a una manciata di punti, abbastanza vicino da sentire quanto brucia.`
      : `${loserName} stringe la mano e saluta il tavolo. Il punteggio è severo, ma non racconta da solo tutta la resistenza messa dentro la partita.`;
  const roomLine = selectTemplate(
    [
      `Per un istante resta soltanto silenzio. Poi arrivano gli applausi, mentre ${winnerName} lascia finalmente cadere la tensione dalle spalle.`,
      `La sala esplode soltanto adesso. ${winnerName} chiude gli occhi per un attimo: tutta la pressione tenuta dentro può finalmente uscire.`,
      `Prima un respiro collettivo, poi gli applausi. ${winnerName} si volta dal tavolo sapendo che questa partita gli resterà addosso.`,
    ],
    random
  );

  if (!isDecisiveGame) {
    const nextGameOrder = gameOrder + 1;
    const continuationLine =
      finalShot.playerSide === finalShot.scoringSide
        ? `${winnerName} trova la chiusura della partita ${gameOrder}: le bilie si fermano sul ${finalScore} e il primo applauso rompe la tensione.`
        : `L'ultimo errore di ${loserName} consegna la partita ${gameOrder} a ${winnerName}, con il tabellone fermo sul ${finalScore}.`;

    const nextChapterLine =
      seriesPlayerOneWins === seriesPlayerTwoWins
        ? `Fra poco si ricomincia con la partita ${nextGameOrder}. Una vittoria a testa: tutto quello che hanno costruito fin qui conduce allo stesso tavolo, per il capitolo decisivo.`
        : `Fra poco si ricomincia con la partita ${nextGameOrder}. ${winnerName} può avvicinarsi alla chiusura; ${loserName} ha ancora il tavolo per riprendersi tutto.`;

    return [
      continuationLine,
      `Il conto dell'incontro è ${matchScore}. È cambiato il punteggio, non c'è ancora un verdetto.`,
      matchFlow,
      biggestLine,
      `${loserName} non lascia che la delusione diventi resa: torna al proprio posto, passa il gesso sulla punta e comincia già a pensare alla risposta.`,
      nextChapterLine,
    ];
  }

  const verdictLine = isTournamentFinal
    ? `${winnerName} vince l'incontro ${matchScore} ed è il campione${tournamentName ? ` del ${tournamentName}` : ""}. Il titolo adesso ha il suo nome.`
    : `${winnerName} vince l'incontro ${matchScore} e supera il turno. Questa volta non c'è un'altra partita a cui affidare la risposta.`;

  return [
    decisiveLine,
    roomLine,
    matchFlow,
    biggestLine,
    loserLine,
    verdictLine,
  ];
}

function getChronicleShotImportance(
  shot: IndividualChronicleShot,
  index: number,
  lastIndex: number
) {
  const highlightScores: Record<IndividualChronicleShot["highlight"], number> = {
    NONE: 0,
    MISS: 8,
    FOUL: 75,
    LEAD_CHANGE: 95,
    BIG_SHOT: 85,
    WINNER: 1_000,
  };
  const outcomeScores: Record<IndividualChronicleShotOutcome, number> = {
    COMPLETE: 28,
    PARTIAL_POINTS: 18,
    PARTIAL_DEFENSE: 14,
    ERROR: 4,
    FOUL: 45,
    OWN_BALL_PINS: 42,
  };
  const finishWeight = lastIndex > 0 ? (index / lastIndex) * 18 : 0;

  return (
    highlightScores[shot.highlight] +
    outcomeScores[shot.outcome] +
    shot.points * 2 +
    finishWeight
  );
}

function getRankingIntroduction(
  playerOneName: string,
  playerTwoName: string,
  playerOneRanking?: number | null,
  playerTwoRanking?: number | null
) {
  if (!playerOneRanking || !playerTwoRanking) {
    return "Il ranking non assegna un favorito netto e lascia al tavolo il compito di stabilire i rapporti di forza.";
  }

  const difference = Math.abs(playerOneRanking - playerTwoRanking);

  if (difference <= 8) {
    return `Nel ranking individuale li separano appena ${difference} posizioni: l'equilibrio annunciato è quasi totale.`;
  }

  const favoriteName =
    playerOneRanking < playerTwoRanking ? playerOneName : playerTwoName;
  const outsiderName =
    playerOneRanking < playerTwoRanking ? playerTwoName : playerOneName;

  return `${favoriteName} parte avanti nel ranking, mentre ${outsiderName} cerca una vittoria capace di sovvertire il pronostico.`;
}

function getOverallIntroduction(
  playerOneName: string,
  playerTwoName: string,
  playerOneOverall?: number | null,
  playerTwoOverall?: number | null
) {
  if (playerOneOverall == null || playerTwoOverall == null) {
    return "Le caratteristiche dei due giocatori promettono una sfida tra realizzazione, difesa e controllo della misura.";
  }

  const roundedOne = Math.round(playerOneOverall);
  const roundedTwo = Math.round(playerTwoOverall);

  if (Math.abs(roundedOne - roundedTwo) <= 2) {
    return `Anche i valori sono vicini: ${roundedOne} contro ${roundedTwo}, senza un vantaggio tecnico evidente.`;
  }

  const strongerName = roundedOne > roundedTwo ? playerOneName : playerTwoName;
  return `I valori alla vigilia sono ${roundedOne} contro ${roundedTwo}: ${strongerName} ha qualcosa in più sulla carta, non ancora sul biliardo.`;
}

function getStyleIntroduction(
  playerOneName: string,
  playerTwoName: string,
  playerOne: IndividualChroniclePlayerValues | undefined,
  playerTwo: IndividualChroniclePlayerValues | undefined,
  specialty: MatchSpecialty
) {
  if (!playerOne || !playerTwo) {
    return `${playerOneName} e ${playerTwoName} arrivano con armi diverse: la sfida sarà capire chi riuscirà a imporre per primo il proprio biliardo.`;
  }

  return `${describePlayerIdentity(playerOneName, playerOne, specialty)}; ${describePlayerIdentity(playerTwoName, playerTwo, specialty)}.`;
}

function describePlayerIdentity(
  playerName: string,
  player: IndividualChroniclePlayerValues,
  specialty: MatchSpecialty
) {
  const qualities = [
    { value: player.misura, phrase: "ama governare la misura" },
    { value: player.difesa, phrase: "sa togliere aria all'avversario con la difesa" },
    { value: player.realizzazione, phrase: "vive delle occasioni che riesce a trasformare" },
    { value: player.mentalita, phrase: "ha nella tenuta mentale la sua forza" },
    { value: player.tattica, phrase: "legge il tavolo qualche istante prima degli altri" },
    { value: player.creativita, phrase: "non ha paura di inventare una linea" },
    {
      value: specialty === "GORIZIANA" ? player.sponde + 5 : player.sponde,
      phrase: "si sente a casa quando entrano in gioco le sponde",
    },
    {
      value: specialty === "TUTTI_DOPPI" ? player.diretto + 5 : player.diretto,
      phrase: "può fare male appena vede un diretto",
    },
    { value: player.precisione, phrase: "costruisce tutto sulla precisione" },
  ].sort((left, right) => right.value - left.value);

  return `${playerName} ${qualities[0].phrase}`;
}

function formatRankingSuffix(ranking?: number | null) {
  return ranking ? `, numero ${ranking} del ranking` : "";
}

function formatSpecialtyName(specialty: MatchSpecialty) {
  if (specialty === "TUTTI_DOPPI") return "Tutti Doppi";
  return specialty.charAt(0) + specialty.slice(1).toLowerCase();
}

function buildShotNarrative({
  specialty,
  shot,
  shotDefinition,
  previousPlayerOneTotal,
  previousPlayerTwoTotal,
  isFinalShot,
  actingPlayerName,
  scoringPlayerName,
  random,
}: {
  specialty: MatchSpecialty;
  shot: Omit<
    IndividualChronicleShot,
    "phase" | "technicalCommentary" | "commentary" | "highlight"
  >;
  shotDefinition: ShotDefinition;
  previousPlayerOneTotal: number;
  previousPlayerTwoTotal: number;
  isFinalShot: boolean;
  actingPlayerName: string;
  scoringPlayerName: string;
  random: () => number;
}) {
  const previousLeader = getLeader(
    previousPlayerOneTotal,
    previousPlayerTwoTotal
  );
  const currentLeader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);
  const tied =
    shot.playerOneTotal === shot.playerTwoTotal &&
    shot.playerOneTotal > 0 &&
    previousPlayerOneTotal !== previousPlayerTwoTotal;
  const leadChanged =
    previousLeader !== null &&
    currentLeader !== null &&
    previousLeader !== currentLeader;
  const previousDeficit =
    shot.scoringSide === "PLAYER_ONE"
      ? previousPlayerTwoTotal - previousPlayerOneTotal
      : previousPlayerOneTotal - previousPlayerTwoTotal;
  const currentDeficit =
    shot.scoringSide === "PLAYER_ONE"
      ? shot.playerTwoTotal - shot.playerOneTotal
      : shot.playerOneTotal - shot.playerTwoTotal;
  const technicalCommentary = getOutcomeCommentary(
    specialty,
    shot,
    shotDefinition,
    isFinalShot,
    actingPlayerName,
    random
  );
  let commentary = technicalCommentary;
  let highlight: IndividualChronicleShot["highlight"] = "NONE";

  if (shot.outcome === "ERROR") highlight = "MISS";
  if (shot.outcome === "FOUL" || shot.outcome === "OWN_BALL_PINS") {
    highlight = "FOUL";
  } else if (isBigShot(specialty, shot.points)) {
    highlight = "BIG_SHOT";
  }

  if (!isFinalShot && tied) {
    commentary += " Il tabellone torna in parità.";
    highlight = "LEAD_CHANGE";
  } else if (!isFinalShot && leadChanged) {
    commentary += selectTemplate(
      [
        " È sorpasso: cambia il comando della partita.",
        " Il margine si rovescia e la pressione passa sull'altra sedia.",
        " Nuovo cambio al comando, con la partita ancora apertissima.",
      ],
      random
    );
    highlight = "LEAD_CHANGE";
  } else if (
    !isFinalShot &&
    previousDeficit > MATCH_TARGET_POINTS[specialty] * 0.12 &&
    currentDeficit > 0 &&
    currentDeficit <= previousDeficit * 0.65
  ) {
    commentary += " Lo svantaggio si accorcia e la pressione sale.";
  }

  if (isFinalShot) {
    if (shot.playerSide !== shot.scoringSide) {
      commentary += ` ${scoringPlayerName} incassa i punti decisivi: la partita finisce qui.`;
    }
    highlight = "WINNER";
  }

  return { technicalCommentary, commentary, highlight };
}

function getOutcomeCommentary(
  specialty: MatchSpecialty,
  shot: Omit<
    IndividualChronicleShot,
    "phase" | "technicalCommentary" | "commentary" | "highlight"
  >,
  shotDefinition: ShotDefinition,
  isFinalShot: boolean,
  actingPlayerName: string,
  random: () => number
) {
  if (
    isFinalShot &&
    shot.playerSide === shot.scoringSide &&
    shot.points > 0
  ) {
    const scoringPhrase = getScoringPhrase(
      specialty,
      shotDefinition,
      shot.points,
      random
    );

    return `${actingPlayerName} si prende il tavolo e cerca il tiro della chiusura. ${shotDefinition.name}: ${scoringPhrase}. L'esecuzione riesce e la partita termina qui.`;
  }

  if (shot.outcome === "FOUL") {
    const basePoints = FOUL_BASE_POINTS[specialty];
    const foul =
      shotDefinition.key === "PARABOLA" || random() < 0.45
        ? "steccaccia"
        : "mancato contatto";
    const consequence =
      specialty === "ITALIANA"
        ? getItalianFoulConsequence(shot.points, random)
        : shot.points > basePoints
          ? `ai ${basePoints} punti di fallo si sommano i birilli, per un totale di ${shot.points} assegnati all'avversario`
          : `sono ${shot.points} punti assegnati all'avversario`;
    const placement =
      foul === "mancato contatto"
        ? selectTemplate(
            [
              " L'avversario sceglie di ripartire dall'acchito.",
              " L'avversario preferisce lasciare le bilie dove sono.",
            ],
            random
          )
        : "";
    const shotReference = getShotReference(shotDefinition);

    return `${capitalize(foul)} ${shotReference}: ${consequence}.${placement}`;
  }

  if (shot.outcome === "OWN_BALL_PINS") {
    const pallino =
      specialty === "ITALIANA" && shot.points % 2 === 1
        ? " L'avversaria prende anche il pallino da 3."
        : "";

    return `${shotDefinition.name}: sui birilli passa la propria.${pallino} I ${shot.points} punti vanno all'avversario e il gioco prosegue.`;
  }

  const scoringPhrase =
    shot.points > 0
      ? getScoringPhrase(specialty, shotDefinition, shot.points, random)
      : "i birilli non si muovono";

  if (shot.outcome === "COMPLETE") {
    const label = random() < 0.12 ? " Tiro completo." : "";
    const ending = selectTemplate(
      [
        "e lascia una rimanenza coperta",
        "poi porta le bilie al riparo dietro il castello",
        "e chiude bene anche la traiettoria difensiva",
      ],
      random
    );

    return `${shotDefinition.name}: ${scoringPhrase}, ${ending}.${label}`;
  }

  if (shot.outcome === "PARTIAL_POINTS") {
    const label = random() < 0.12 ? " Tiro preso per metà." : "";
    const ending = selectTemplate(
      [
        "ma la difesa non riesce e resta una replica possibile",
        "però la rimanenza rimane leggibile",
        "senza riuscire a nascondere il tiro successivo",
      ],
      random
    );

    return `${shotDefinition.name}: ${scoringPhrase}, ${ending}.${label}`;
  }

  if (shot.outcome === "PARTIAL_DEFENSE") {
    const label = random() < 0.12 ? " Tiro preso per metà." : "";
    const ending = selectTemplate(
      [
        "ma la misura è precisa e il castello resta a protezione",
        "però la rimanenza costringe l'avversario a cercare la sponda",
        "ma almeno porta le bilie in una posizione difensiva",
      ],
      random
    );

    return `${shotDefinition.name}: ${scoringPhrase}, ${ending}.${label}`;
  }

  const measureError =
    shotDefinition.key === "TRE_SPONDE_CALCIO" ||
    shotDefinition.key === "CINQUE_SPONDE_CALCIO"
      ? selectTemplate(
          [
            "La bilia avversaria resta corta e concede un diretto semplice.",
            "La bilia avversaria corre lunga oltre il castello e resta visibile.",
          ],
          random
        )
      : selectTemplate(
          [
            "La quantità non è quella cercata e rimane un tavolo leggibile.",
            "L'esecuzione sfila: niente punti e nessuna copertura.",
            "Il tiro arriva soltanto vicino alla linea voluta e lascia una replica comoda.",
          ],
          random
        );

  return `${shotDefinition.name}: ${measureError}`;
}

function getItalianFoulConsequence(points: number, random: () => number) {
  const basePoints = FOUL_BASE_POINTS.ITALIANA;
  const remainingPoints = points - basePoints;
  const pallinoOptions = [0, 2].filter((pallinoPoints) =>
    ITALIAN_PIN_TOTALS.includes(
      (remainingPoints - pallinoPoints) as (typeof ITALIAN_PIN_TOTALS)[number]
    )
  );
  const pallinoPoints = selectWeighted(
    pallinoOptions.map((value) => ({
      value,
      weight: value === 0 ? 3 : 1,
    })),
    random
  );
  const pinPoints = remainingPoints - pallinoPoints;
  const additions: string[] = [];

  if (pinPoints > 0) additions.push(`${pinPoints} punti di birilli`);
  if (pallinoPoints > 0) {
    additions.push("2 punti per il pallino colpito durante il fallo");
  }

  if (additions.length === 0) {
    return `sono ${points} punti assegnati all'avversario`;
  }

  return `ai ${basePoints} punti di fallo si aggiungono ${joinItalianList(additions)}, per un totale di ${points} assegnati all'avversario`;
}

function getShotReference(shot: ShotDefinition) {
  const feminineShots = new Set([
    "CANDELA",
    "SPONDA_BIGLIA",
    "BRICOLLA",
    "GARUFFA",
    "MEZZA_GARUFFA",
    "PARABOLA",
  ]);
  const pluralShots = new Set([
    "TRE_SPONDE_CALCIO",
    "CINQUE_SPONDE_CALCIO",
  ]);
  const name = shot.name.toLowerCase();

  if (shot.key === "ANGOLO_PRIMA" || shot.key === "ANGOLO_SECONDA") {
    return `sull'${name}`;
  }

  if (pluralShots.has(shot.key)) return `sulle ${name}`;

  return `${feminineShots.has(shot.key) ? "sulla" : "sul"} ${name}`;
}

function joinItalianList(parts: string[]) {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
}

function getScoringPhrase(
  specialty: MatchSpecialty,
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  if (specialty === "ITALIANA") {
    return getItalianScoringPhrase(shot, points, random);
  }

  if (specialty === "GORIZIANA") {
    return getGorizianaScoringPhrase(shot, points, random);
  }

  return getTuttiDoppiScoringPhrase(shot, points, random);
}

const ITALIAN_PIN_TOTALS = [0, 2, 4, 6, 8, 10, 12] as const;

function getItalianAllowedPinTotals(shot: ShotDefinition) {
  if (shot.key === "GARUFFA" || shot.key === "MEZZA_GARUFFA") {
    return [0, 2, 4, 6, 8] as const;
  }

  if (shot.italianPasses === "MULTIPLE") return ITALIAN_PIN_TOTALS;
  return [0, 2, 4, 6, 8, 10] as const;
}

function getItalianScoreOptions(shot: ShotDefinition, points: number) {
  const allowedPinTotals = getItalianAllowedPinTotals(shot);

  return [0, 3, 4]
    .map((pallinoPoints) => ({
      pallinoPoints,
      pinPoints: points - pallinoPoints,
    }))
    .filter(({ pinPoints }) =>
      (allowedPinTotals as readonly number[]).includes(pinPoints)
    );
}

function getItalianScoringPhrase(
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  if (points === 3) {
    return "l'avversaria trova il pallino: 3 punti realizzati";
  }

  const scoreOptions = getItalianScoreOptions(shot, points);
  const scoreProfile = ITALIAN_SHOT_SCORE_PROFILES[shot.key];
  const prefersPlain = scoreProfile?.plain.includes(points) ?? false;
  const prefersPallino =
    scoreProfile?.withPallino.includes(points) ?? false;
  const pallinoPoints =
    points % 2 === 1
      ? 3
      : selectWeighted(
          scoreOptions.map(({ pallinoPoints }) => ({
            value: pallinoPoints,
            weight:
              pallinoPoints === 0
                ? prefersPlain
                  ? 6
                  : prefersPallino
                    ? 0.8
                    : 4
                : prefersPallino
                  ? 6
                  : prefersPlain
                    ? 0.8
                    : 1,
          })),
          random
        );
  const pinPoints = points - pallinoPoints;
  const pinPhrase = getItalianPinPhrase(shot, pinPoints, random);

  if (pallinoPoints === 0) return `${pinPhrase} per ${points} punti`;

  const pallinoPhrase =
    pallinoPoints === 3
      ? "l'avversaria prende anche il pallino da 3"
      : "dopo il primo contatto la battente prende anche il pallino da 4";

  if (pinPoints === 0) return `${pallinoPhrase} e realizza ${points} punti`;
  return `${pinPhrase}; ${pallinoPhrase}, totale ${points}`;
}

function getItalianPinPhrase(
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  if (points === 0) return "non abbatte birilli";
  if (points === 2) return "cade un birillo laterale";
  if (points === 4) return "cadono due birilli laterali";
  if (points === 6) {
    if (shot.italianPasses !== "MULTIPLE") {
      return "il rosso cade insieme a un birillo laterale";
    }

    return selectTemplate(
      [
        "cadono tre laterali",
        "il rosso cade insieme a un laterale",
      ],
      random
    );
  }
  if (points === 8) {
    if (shot.italianPasses !== "MULTIPLE") {
      return shot.family === "DIRECT"
        ? "trova il filotto da 8"
        : "il rosso cade insieme a due birilli laterali";
    }

    return shot.family === "DIRECT"
      ? "trova il filotto da 8"
      : "cadono quattro laterali";
  }
  if (points === 10) {
    if (shot.italianPasses !== "MULTIPLE") {
      return "trova la ciliegia con il rosso abbattuto da solo";
    }

    return selectTemplate(
      [
        "trova la ciliegia con il rosso abbattuto da solo",
        "il rosso cade insieme a tre laterali",
      ],
      random
    );
  }
  return "attraversa tutto il castello";
}

function getGorizianaScoringPhrase(
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  const multiplier = shot.family === "CUSHION" ? 2 : 1;
  const basePoints = points / multiplier;
  const forceFilotto = shot.family === "DIRECT" && points === 30;
  const forceOnePassPallino =
    (shot.key === "GARUFFA" || shot.key === "MEZZA_GARUFFA") &&
    points > 60;
  const pallinoPossible = basePoints >= 6 && basePoints <= 56;
  const pallinoPoints =
    forceOnePassPallino || basePoints > 50
      ? 6
      : !forceFilotto && pallinoPossible && random() < 0.18
        ? 6
        : 0;
  const pinPoints = basePoints - pallinoPoints;
  let action: string;

  if (forceFilotto) {
    action = "trova il filotto da 30";
  } else if (pinPoints === 0) {
    action = "trova soltanto il pallino";
  } else if (pinPoints === 50) {
    action = "porta giù l'intero castello";
  } else {
    action = `realizza ${pinPoints} punti di birilli`;
  }

  if (pallinoPoints > 0 && pinPoints > 0) {
    action += " e aggiunge i 6 punti del pallino";
  }

  if (forceOnePassPallino) {
    return `${pinPoints} punti di birilli diventano ${pinPoints * 2} con il tiro di sponda; l'arrivo sul pallino aggiunge 12 punti, totale ${points}`;
  }

  return multiplier === 2
    ? `${action}; il tiro di sponda raddoppia il conteggio fino a ${points}`
    : `${action} per un totale di ${points} punti`;
}

function getTuttiDoppiScoringPhrase(
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  const forceFilotto = shot.family === "DIRECT" && points === 60;
  const forceOnePassPallino =
    (shot.key === "GARUFFA" || shot.key === "MEZZA_GARUFFA") &&
    points > 60;
  const pallinoPossible = points >= 12;
  const pallinoPoints =
    forceOnePassPallino || points > 100
      ? 12
      : !forceFilotto && pallinoPossible && random() < 0.16
        ? 12
        : 0;
  const pinPoints = points - pallinoPoints;
  let action: string;

  if (forceFilotto) {
    action = "trova il filotto da 60";
  } else if (pinPoints === 0) {
    action = "trova soltanto il pallino da 12";
  } else if (pinPoints === 100) {
    action = "porta giù l'intero castello da 100";
  } else {
    action = `realizza ${pinPoints} punti di birilli`;
  }

  if (pallinoPoints > 0 && pinPoints > 0) {
    action += " e aggiunge i 12 punti del pallino";
  }

  return `${action}, totale ${points}`;
}

function getChroniclePhase(index: number, totalShots: number) {
  if (index < Math.ceil(totalShots * 0.25)) return "OPENING" as const;
  if (index >= Math.floor(totalShots * 0.75)) return "FINISH" as const;
  return "MIDDLE" as const;
}

function getShotBand(specialty: MatchSpecialty, points: number) {
  const thresholds: Record<MatchSpecialty, [number, number, number]> = {
    ITALIANA: [5, 10, 14],
    GORIZIANA: [16, 40, 72],
    TUTTI_DOPPI: [20, 48, 80],
  };
  const [low, medium, high] = thresholds[specialty];

  if (points <= low) return "LOW" as const;
  if (points <= medium) return "MEDIUM" as const;
  if (points <= high) return "HIGH" as const;
  return "EXCEPTIONAL" as const;
}

function isBigShot(specialty: MatchSpecialty, points: number) {
  return getShotBand(specialty, points) === "EXCEPTIONAL";
}

function getLeader(
  playerOneTotal: number,
  playerTwoTotal: number
): IndividualChroniclePlayerSide | null {
  if (playerOneTotal === playerTwoTotal) return null;
  return playerOneTotal > playerTwoTotal ? "PLAYER_ONE" : "PLAYER_TWO";
}

function oppositeSide(side: IndividualChroniclePlayerSide) {
  return side === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
}

function selectWeighted<T>(
  candidates: Array<{ value: T; weight: number }>,
  random: () => number
) {
  const totalWeight = candidates.reduce(
    (total, candidate) => total + candidate.weight,
    0
  );
  let cursor = random() * totalWeight;

  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor <= 0) return candidate.value;
  }

  return candidates.at(-1)!.value;
}

function selectTemplate(templates: readonly string[], random: () => number) {
  return templates[Math.floor(random() * templates.length)] ?? templates[0];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
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
