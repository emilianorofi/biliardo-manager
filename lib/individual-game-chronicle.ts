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
  storyTitle?: string;
  showShotDetail?: boolean;
  highlight:
    | "NONE"
    | "MISS"
    | "FOUL"
    | "LEAD_CHANGE"
    | "BIG_SHOT"
    | "WINNER";
};

export type ChroniclePallinoContact =
  | "NONE"
  | "OPPONENT_BALL"
  | "OWN_BALL";

export type PinFallScore = {
  basePinPoints: number;
  pinPoints: number;
  pallinoPoints: number;
  totalPoints: number;
  redAlone: boolean;
};

export function calculatePinFallScore({
  specialty,
  outerPins,
  innerPins = 0,
  redPin = false,
  pallinoContact = "NONE",
  cushionShot = false,
}: {
  specialty: MatchSpecialty;
  outerPins: number;
  innerPins?: number;
  redPin?: boolean;
  pallinoContact?: ChroniclePallinoContact;
  cushionShot?: boolean;
}): PinFallScore {
  const maximumOuterPins = 4;
  const maximumInnerPins = specialty === "ITALIANA" ? 0 : 4;

  if (
    !Number.isInteger(outerPins) ||
    !Number.isInteger(innerPins) ||
    outerPins < 0 ||
    outerPins > maximumOuterPins ||
    innerPins < 0 ||
    innerPins > maximumInnerPins
  ) {
    throw new Error("INVALID_PIN_FALL");
  }

  const otherPins = outerPins + innerPins;
  const redAlone = redPin && otherPins === 0;
  const redValue = redPin
    ? redAlone
      ? specialty === "ITALIANA"
        ? 10
        : 30
      : specialty === "ITALIANA"
        ? 4
        : 10
    : 0;
  const basePinPoints =
    outerPins * 2 +
    (specialty === "ITALIANA" ? 0 : innerPins * 8) +
    redValue;
  const multiplier =
    specialty === "TUTTI_DOPPI" ||
    (specialty === "GORIZIANA" && cushionShot)
      ? 2
      : 1;
  const pinPoints = basePinPoints * multiplier;
  const pallinoPoints =
    pallinoContact === "NONE"
      ? 0
      : specialty === "ITALIANA"
        ? pallinoContact === "OPPONENT_BALL"
          ? 3
          : 4
        : 6 * multiplier;

  return {
    basePinPoints,
    pinPoints,
    pallinoPoints,
    totalPoints: pinPoints + pallinoPoints,
    redAlone,
  };
}

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
    key: "EBREA",
    name: "Ebrea",
    family: "CUSHION",
    difficulty: 5,
    weights: { ITALIANA: 0, GORIZIANA: 3, TUTTI_DOPPI: 4 },
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

type NinePinTrajectory = {
  outerPins: number;
  innerPins: number;
  redPin: boolean;
};

type NinePinScoreOption = PinFallScore & {
  outerPins: number;
  innerPins: number;
  redPin: boolean;
  pallinoContact: "NONE" | "OPPONENT_BALL";
};

const NINE_PIN_SCORE_OPTIONS_CACHE = new Map<
  string,
  NinePinScoreOption[]
>();

const ONE_PASS_SHOT_SCORE_PROFILES: Record<
  Exclude<MatchSpecialty, "ITALIANA">,
  Record<string, OnePassShotScoreProfile>
> = {
  GORIZIANA: {
    BRICOLLA: { max: 72, preferred: [16, 36, 40] },
    GARUFFA: { max: 72, preferred: [16, 36, 40] },
    MEZZA_GARUFFA: { max: 72, preferred: [16, 36, 40] },
    PARABOLA: { max: 52 },
  },
  TUTTI_DOPPI: {
    BRICOLLA: { max: 72, preferred: [16, 36, 40] },
    GARUFFA: { max: 72, preferred: [16, 36, 40] },
    MEZZA_GARUFFA: { max: 72, preferred: [16, 36, 40] },
    PARABOLA: { max: 52 },
  },
};

// On a single crossing the ball can only knock down adjacent pins along its
// path through the nine-pin castle. These are the possible contiguous
// sections of the outer-inner-red-inner-outer line; independent pin counts
// would invent trajectories such as outer + red while skipping the inner.
const CONTIGUOUS_NINE_PIN_TRAJECTORIES: readonly NinePinTrajectory[] = [
  { outerPins: 0, innerPins: 0, redPin: false },
  { outerPins: 1, innerPins: 0, redPin: false },
  { outerPins: 0, innerPins: 1, redPin: false },
  { outerPins: 0, innerPins: 0, redPin: true },
  { outerPins: 1, innerPins: 1, redPin: false },
  { outerPins: 0, innerPins: 1, redPin: true },
  { outerPins: 1, innerPins: 1, redPin: true },
  { outerPins: 0, innerPins: 2, redPin: true },
  { outerPins: 1, innerPins: 2, redPin: true },
  { outerPins: 2, innerPins: 2, redPin: true },
] as const;

const CANDELA_NINE_PIN_TRAJECTORIES: readonly NinePinTrajectory[] = [
  { outerPins: 0, innerPins: 0, redPin: false },
  { outerPins: 1, innerPins: 0, redPin: false },
  { outerPins: 0, innerPins: 1, redPin: false },
  { outerPins: 1, innerPins: 1, redPin: false },
] as const;

const SINGLE_PASS_NINE_PIN_SHOTS = new Set([
  "RADDRIZZO",
  "ROVESCIO",
  "TRAVERSINO_PIANO",
  "GIRO",
  "GIRONE",
  "ANGOLO_PRIMA",
  "ANGOLO_SECONDA",
  "STRISCIO",
  "CANDELA",
  "SPONDA_BIGLIA",
  "BRICOLLA",
  "GARUFFA",
  "MEZZA_GARUFFA",
  "GANCIO",
  "PARABOLA",
  "TRE_SPONDE_CALCIO",
  "CINQUE_SPONDE_CALCIO",
]);

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
  const targetPoints = MATCH_TARGET_POINTS[specialty];
  const playerOneShots = distributeScore({
    total: playerOneScore,
    attempts: playerOneAttempts,
    allowedScores,
    lastScoreMustExceed:
      winnerSide === "PLAYER_ONE"
        ? getLastScoreThreshold(playerOneScore, targetPoints, allowedScores)
        : undefined,
    minimumMisses: getMinimumMisses(specialty, playerOneAttempts, playerOne),
    missProbability: getMissProbability(specialty, playerOne),
    random,
  });
  const playerTwoShots = distributeScore({
    total: playerTwoScore,
    attempts: playerTwoAttempts,
    allowedScores,
    lastScoreMustExceed:
      winnerSide === "PLAYER_TWO"
        ? getLastScoreThreshold(playerTwoScore, targetPoints, allowedScores)
        : undefined,
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
      shotName: selectedShot.name,
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

function getLastScoreThreshold(
  winnerScore: number,
  targetPoints: number,
  allowedScores: readonly number[]
) {
  const overshoot = Math.max(0, winnerScore - targetPoints);

  return overshoot < allowedScores.at(-1)! ? overshoot : 0;
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
  lastScoreMustExceed,
  minimumMisses,
  missProbability,
  random,
}: {
  total: number;
  attempts: number;
  allowedScores: readonly number[];
  lastScoreMustExceed?: number;
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
          (lastScoreMustExceed === undefined ||
            score > lastScoreMustExceed)
        );
      }

      return lastScoreMustExceed !== undefined
        ? canRepresentWithFinalScoreAbove(
            nextTotal,
            remainingAttempts,
            allowedScores,
            memo,
            nextMinimumMisses,
            lastScoreMustExceed
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

function canRepresentWithFinalScoreAbove(
  total: number,
  attempts: number,
  allowedScores: readonly number[],
  memo: Map<string, boolean>,
  minimumMisses: number,
  minimumExclusive: number
) {
  return allowedScores.some(
    (lastScore) =>
      lastScore > minimumExclusive &&
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

  if (shot.key === "EBREA") {
    return points > 72 ? 9 : 0;
  }

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

function getNinePinScoreOptions(
  specialty: "GORIZIANA" | "TUTTI_DOPPI",
  shot: ShotDefinition,
  points: number
) {
  const cacheKey = `${specialty}:${shot.key}:${points}`;
  const cached = NINE_PIN_SCORE_OPTIONS_CACHE.get(cacheKey);

  if (cached) return cached;

  const onePassProfile = ONE_PASS_SHOT_SCORE_PROFILES[specialty][shot.key];
  const options: NinePinScoreOption[] = [];
  const trajectories = getNinePinTrajectories(shot);

  for (const { outerPins, innerPins, redPin } of trajectories) {
    for (const pallinoContact of ["NONE", "OPPONENT_BALL"] as const) {
      const score = calculatePinFallScore({
        specialty,
        outerPins,
        innerPins,
        redPin,
        pallinoContact,
        cushionShot: shot.family === "CUSHION",
      });

      if (
        score.totalPoints === points &&
        (!onePassProfile || points <= onePassProfile.max)
      ) {
        options.push({
          ...score,
          outerPins,
          innerPins,
          redPin,
          pallinoContact,
        });
      }
    }
  }

  if (options.length === 0 && !SINGLE_PASS_NINE_PIN_SHOTS.has(shot.key)) {
    for (let outerPins = 0; outerPins <= 4; outerPins += 1) {
      for (let innerPins = 0; innerPins <= 4; innerPins += 1) {
        for (const redPin of [false, true]) {
          for (const pallinoContact of ["NONE", "OPPONENT_BALL"] as const) {
            const score = calculatePinFallScore({
              specialty,
              outerPins,
              innerPins,
              redPin,
              pallinoContact,
              cushionShot: shot.family === "CUSHION",
            });

            if (score.totalPoints === points) {
              options.push({
                ...score,
                outerPins,
                innerPins,
                redPin,
                pallinoContact,
              });
            }
          }
        }
      }
    }
  }

  NINE_PIN_SCORE_OPTIONS_CACHE.set(cacheKey, options);
  return options;
}

function getNinePinTrajectories(shot: ShotDefinition) {
  if (shot.key === "CANDELA") return CANDELA_NINE_PIN_TRAJECTORIES;
  return CONTIGUOUS_NINE_PIN_TRAJECTORIES;
}

function selectNinePinScoreOption(
  specialty: "GORIZIANA" | "TUTTI_DOPPI",
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  const options = getNinePinScoreOptions(specialty, shot, points);

  if (options.length === 0) {
    throw new Error("NINE_PIN_SCORE_NOT_REPRESENTABLE");
  }

  const preferredMaximumOptions =
    shot.key === "PARABOLA" && points === 52
      ? options.filter((option) =>
          isPreferredOnePassComposition(shot, points, option)
        )
      : [];
  const selectableOptions =
    preferredMaximumOptions.length > 0 ? preferredMaximumOptions : options;

  return selectWeighted(
    selectableOptions.map((option) => ({
      value: option,
      weight: getNinePinScoreOptionWeight(specialty, shot, points, option),
    })),
    random
  );
}

function getNinePinScoreOptionWeight(
  specialty: "GORIZIANA" | "TUTTI_DOPPI",
  shot: ShotDefinition,
  points: number,
  option: NinePinScoreOption
) {
  const isDirectFilotto =
    shot.family === "DIRECT" &&
    ((specialty === "GORIZIANA" && points === 30) ||
      (specialty === "TUTTI_DOPPI" && points === 60));
  const isFullCentralLine =
    option.outerPins === 2 &&
    option.innerPins === 2 &&
    option.redPin &&
    option.pallinoContact === "NONE";

  if (isDirectFilotto) return isFullCentralLine ? 80 : 0.05;

  if (isPreferredOnePassComposition(shot, points, option)) return 60;

  return (
    (option.pallinoContact === "NONE" ? 4 : 0.75) *
    (option.redAlone ? 0.3 : 1) *
    (1 + option.outerPins * 0.08 + option.innerPins * 0.12)
  );
}

function isPreferredOnePassComposition(
  shot: ShotDefinition,
  points: number,
  option: NinePinScoreOption
) {
  if (shot.key === "PARABOLA" && points === 52) {
    return (
      option.outerPins === 0 &&
      option.innerPins === 2 &&
      option.redPin &&
      option.pallinoContact === "NONE"
    );
  }

  if (shot.key !== "GARUFFA" && shot.key !== "MEZZA_GARUFFA") {
    return false;
  }

  if (points === 16) {
    return (
      option.outerPins === 0 &&
      option.innerPins === 1 &&
      !option.redPin &&
      option.pallinoContact === "NONE"
    );
  }

  if (points === 36) {
    return (
      option.outerPins === 0 &&
      option.innerPins === 1 &&
      option.redPin &&
      option.pallinoContact === "NONE"
    );
  }

  if (points === 40) {
    return (
      option.outerPins === 1 &&
      option.innerPins === 1 &&
      option.redPin &&
      option.pallinoContact === "NONE"
    );
  }

  if (points === 72) {
    return (
      option.outerPins === 2 &&
      option.innerPins === 2 &&
      option.redPin &&
      option.pallinoContact === "OPPONENT_BALL"
    );
  }

  return false;
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

  return getNinePinScoreOptions(specialty, shot, points).length > 0;
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
  const targetCount = Math.min(chronicle.length, 5 + Math.abs(gameId) % 3);

  if (chronicle.length <= targetCount) return chronicle;

  const lastIndex = chronicle.length - 1;
  const narrativeSegments = targetCount - 1;
  const selectedIndexes = new Set<number>();

  for (let segmentIndex = 0; segmentIndex < narrativeSegments; segmentIndex += 1) {
    const startIndex = Math.floor((segmentIndex * lastIndex) / narrativeSegments);
    const endIndex = Math.max(
      startIndex,
      Math.floor(((segmentIndex + 1) * lastIndex) / narrativeSegments) - 1
    );
    let bestIndex = startIndex;
    let bestImportance = Number.NEGATIVE_INFINITY;

    for (let index = startIndex; index <= endIndex; index += 1) {
      const importance =
        getChronicleShotImportance(chronicle[index], index, lastIndex) +
        ((index - startIndex) / Math.max(1, endIndex - startIndex)) * 8;

      if (importance > bestImportance) {
        bestIndex = index;
        bestImportance = importance;
      }
    }

    selectedIndexes.add(bestIndex);
  }

  selectedIndexes.add(lastIndex);

  return [...selectedIndexes]
    .sort((left, right) => left - right)
    .map((index) => chronicle[index]);
}

type BroadcastStoryContext = {
  winnerSide: IndividualChroniclePlayerSide;
  leadChanges: number;
  winnerMaximumDeficit: number;
  decisiveOrder: number | null;
};

function analyzeBroadcastStory(
  chronicle: IndividualChronicleShot[],
  specialty: MatchSpecialty
): BroadcastStoryContext {
  const finalShot = chronicle.at(-1);
  const winnerSide: IndividualChroniclePlayerSide =
    !finalShot || finalShot.playerOneTotal >= finalShot.playerTwoTotal
      ? "PLAYER_ONE"
      : "PLAYER_TWO";
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

  const target = MATCH_TARGET_POINTS[specialty];
  const minimumDecisiveProgress = target * 0.18;
  const decisiveShot = chronicle.find((shot, index) => {
    const winnerTotal =
      winnerSide === "PLAYER_ONE" ? shot.playerOneTotal : shot.playerTwoTotal;
    const loserTotal =
      winnerSide === "PLAYER_ONE" ? shot.playerTwoTotal : shot.playerOneTotal;

    return (
      winnerTotal >= minimumDecisiveProgress &&
      winnerTotal > loserTotal &&
      chronicle.slice(index).every((laterShot) => {
        const laterWinnerTotal =
          winnerSide === "PLAYER_ONE"
            ? laterShot.playerOneTotal
            : laterShot.playerTwoTotal;
        const laterLoserTotal =
          winnerSide === "PLAYER_ONE"
            ? laterShot.playerTwoTotal
            : laterShot.playerOneTotal;

        return laterWinnerTotal > laterLoserTotal;
      })
    );
  });

  return {
    winnerSide,
    leadChanges,
    winnerMaximumDeficit,
    decisiveOrder: decisiveShot?.order ?? null,
  };
}

export function buildIndividualGameBroadcast({
  chronicle,
  gameId,
  specialty,
  playerOneName,
  playerTwoName,
  playerOne,
  playerTwo,
  playerOnePerformanceRating,
  playerTwoPerformanceRating,
  gameOrder = 1,
  matchPlayerOneWins = 0,
  matchPlayerTwoWins = 0,
  isDecisiveGame = true,
  isTournamentFinal = false,
}: {
  chronicle: IndividualChronicleShot[];
  gameId: number;
  specialty: MatchSpecialty;
  playerOneName: string;
  playerTwoName: string;
  playerOne?: IndividualChroniclePlayerValues;
  playerTwo?: IndividualChroniclePlayerValues;
  playerOnePerformanceRating?: number;
  playerTwoPerformanceRating?: number;
  gameOrder?: number;
  matchPlayerOneWins?: number;
  matchPlayerTwoWins?: number;
  isDecisiveGame?: boolean;
  isTournamentFinal?: boolean;
}) {
  const selectedShots = selectIndividualChronicleHighlights({
    chronicle,
    gameId,
  });
  const templateOffset = Math.floor(
    createSeededRandom(gameId * 7_919 + 113)() * 997
  );
  const story = analyzeBroadcastStory(chronicle, specialty);
  const featuredShotOrders = selectStoryShotDetails({
    selectedShots,
    chronicle,
    specialty,
    story,
  });

  return selectedShots.map((shot, selectedIndex) => {
    const chronicleIndex = Math.max(
      0,
      chronicle.findIndex((candidate) => candidate.order === shot.order)
    );
    const previousShot = chronicle[chronicleIndex - 1] ?? null;
    const previousSelectedShot = selectedShots[selectedIndex - 1] ?? null;
    const previousSelectedChronicleIndex = previousSelectedShot
      ? chronicle.findIndex(
          (candidate) => candidate.order === previousSelectedShot.order
        )
      : -1;
    const segment = chronicle.slice(
      previousSelectedChronicleIndex + 1,
      chronicleIndex + 1
    );
    const crossesDecisivePassage =
      story.decisiveOrder !== null &&
      shot.order >= story.decisiveOrder &&
      (previousSelectedShot?.order ?? 0) < story.decisiveOrder;
    const showShotDetail = featuredShotOrders.has(shot.order);
    const storyTitle = getStoryBeatTitle({
      shot,
      previousShot,
      showShotDetail,
      selectedIndex,
      selectedCount: selectedShots.length,
      crossesDecisivePassage,
      segment,
      previousSelectedShot,
      specialty,
    });

    return {
      ...shot,
      storyTitle,
      showShotDetail,
      commentary: buildMatchStoryBeat({
        shot,
        previousShot,
        previousSelectedShot,
        segment,
        chronicle,
        chronicleIndex,
        selectedIndex,
        selectedCount: selectedShots.length,
        specialty,
        story,
        playerOneName,
        playerTwoName,
        playerOne,
        playerTwo,
        playerOnePerformanceRating,
        playerTwoPerformanceRating,
        gameOrder,
        matchPlayerOneWins,
        matchPlayerTwoWins,
        isDecisiveGame,
        isTournamentFinal,
        crossesDecisivePassage,
        showShotDetail,
        templateOffset,
      }),
    };
  });
}

type StorySegmentStats = {
  playerOneGain: number;
  playerTwoGain: number;
  playerOneAttempts: number;
  playerTwoAttempts: number;
  playerOneScoringVisits: number;
  playerTwoScoringVisits: number;
  playerOneEmptyVisits: number;
  playerTwoEmptyVisits: number;
  playerOneAdverseEvents: number;
  playerTwoAdverseEvents: number;
};

function selectStoryShotDetails({
  selectedShots,
  chronicle,
  specialty,
  story,
}: {
  selectedShots: IndividualChronicleShot[];
  chronicle: IndividualChronicleShot[];
  specialty: MatchSpecialty;
  story: BroadcastStoryContext;
}) {
  const finalShot = selectedShots.at(-1);
  const orders = new Set<number>();

  if (finalShot) orders.add(finalShot.order);

  const candidates = selectedShots
    .slice(1, -1)
    .map((shot) => {
      const chronicleIndex = chronicle.findIndex(
        (candidate) => candidate.order === shot.order
      );
      const previousShot = chronicle[chronicleIndex - 1] ?? null;
      const previousLeader = previousShot
        ? getLeader(previousShot.playerOneTotal, previousShot.playerTwoTotal)
        : null;
      const currentLeader = getLeader(
        shot.playerOneTotal,
        shot.playerTwoTotal
      );
      const actualLeadChange =
        previousLeader !== null &&
        currentLeader !== null &&
        previousLeader !== currentLeader;
      const tiesTheGame =
        previousShot !== null &&
        previousShot.playerOneTotal !== previousShot.playerTwoTotal &&
        shot.playerOneTotal === shot.playerTwoTotal;
      const adverseEvent =
        shot.outcome === "FOUL" || shot.outcome === "OWN_BALL_PINS";
      const previousMargin = previousShot
        ? Math.abs(
            previousShot.playerOneTotal - previousShot.playerTwoTotal
          )
        : 0;
      const lateGame =
        Math.max(shot.playerOneTotal, shot.playerTwoTotal) >=
        MATCH_TARGET_POINTS[specialty] * 0.72;
      const importantAdverseEvent =
        adverseEvent &&
        (shot.points >= MATCH_TARGET_POINTS[specialty] * 0.06 ||
          previousMargin <= MATCH_TARGET_POINTS[specialty] * 0.12 ||
          lateGame);
      const crossesDecisivePassage =
        story.decisiveOrder !== null &&
        shot.order >= story.decisiveOrder &&
        (previousShot?.order ?? 0) < story.decisiveOrder;
      const important =
        importantAdverseEvent ||
        actualLeadChange ||
        tiesTheGame ||
        crossesDecisivePassage ||
        shot.highlight === "BIG_SHOT";
      const eventWeight = importantAdverseEvent
        ? 130
        : crossesDecisivePassage
          ? 120
          : actualLeadChange
            ? 110
            : tiesTheGame
              ? 95
              : 70;

      return {
        shot,
        category: importantAdverseEvent
          ? "ADVERSE"
          : actualLeadChange
            ? "LEAD_CHANGE"
            : tiesTheGame
              ? "TIE"
              : crossesDecisivePassage
                ? "DECISIVE"
                : "BIG_SHOT",
        important,
        importance:
          eventWeight +
          getChronicleShotImportance(
            shot,
            chronicleIndex,
            chronicle.length - 1
          ) +
          (isBigShot(specialty, shot.points) ? 25 : 0),
      };
    })
    .filter((candidate) => candidate.important)
    .sort(
      (left, right) =>
        right.importance - left.importance ||
        left.shot.order - right.shot.order
    );

  const maximumFeaturedEvents = selectedShots.length >= 6 ? 2 : 1;
  const selectedCategories = new Set<string>();

  for (const candidate of candidates) {
    if (orders.size >= maximumFeaturedEvents + 1) break;
    if (selectedCategories.has(candidate.category)) continue;
    orders.add(candidate.shot.order);
    selectedCategories.add(candidate.category);
  }

  return orders;
}

function getStoryBeatTitle({
  shot,
  previousShot,
  showShotDetail,
  selectedIndex,
  selectedCount,
  crossesDecisivePassage,
  segment,
  previousSelectedShot,
  specialty,
}: {
  shot: IndividualChronicleShot;
  previousShot: IndividualChronicleShot | null;
  showShotDetail: boolean;
  selectedIndex: number;
  selectedCount: number;
  crossesDecisivePassage: boolean;
  segment: IndividualChronicleShot[];
  previousSelectedShot: IndividualChronicleShot | null;
  specialty: MatchSpecialty;
}) {
  const previousLeader = previousShot
    ? getLeader(previousShot.playerOneTotal, previousShot.playerTwoTotal)
    : null;
  const currentLeader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);
  const actualLeadChange =
    previousLeader !== null &&
    currentLeader !== null &&
    previousLeader !== currentLeader;

  if (shot.highlight === "WINNER") return "Il tiro che decide";
  if (selectedIndex === 0) return "I primi equilibri";
  if (
    showShotDetail &&
    (shot.outcome === "FOUL" || shot.outcome === "OWN_BALL_PINS")
  ) {
    return "L'errore che cambia il ritmo";
  }
  if (showShotDetail && crossesDecisivePassage) return "La svolta";
  if (shot.playerOneTotal === shot.playerTwoTotal) return "Di nuovo insieme";
  if (showShotDetail && actualLeadChange) return "Il comando cambia";
  if (showShotDetail && shot.highlight === "BIG_SHOT") {
    return "Il colpo che riapre tutto";
  }

  const stats = getStorySegmentStats(segment, previousSelectedShot);
  const segmentGap = Math.abs(stats.playerOneGain - stats.playerTwoGain);
  const progress = selectedCount > 1 ? selectedIndex / (selectedCount - 1) : 1;

  if (progress >= 0.8) return "Verso il finale";
  if (segmentGap >= MATCH_TARGET_POINTS[specialty] * 0.1) {
    return progress < 0.5 ? "Il primo strappo" : "La risposta";
  }
  if (progress >= 0.65) return "La pressione sale";
  if (progress >= 0.45) return "La fase centrale";
  if (progress >= 0.25) return "L'equilibrio si muove";
  return "La partita prende forma";
}

function buildMatchStoryBeat({
  shot,
  previousShot,
  previousSelectedShot,
  segment,
  chronicle,
  chronicleIndex,
  selectedIndex,
  selectedCount,
  specialty,
  story,
  playerOneName,
  playerTwoName,
  playerOne,
  playerTwo,
  playerOnePerformanceRating,
  playerTwoPerformanceRating,
  gameOrder,
  matchPlayerOneWins,
  matchPlayerTwoWins,
  isDecisiveGame,
  isTournamentFinal,
  crossesDecisivePassage,
  showShotDetail,
  templateOffset,
}: {
  shot: IndividualChronicleShot;
  previousShot: IndividualChronicleShot | null;
  previousSelectedShot: IndividualChronicleShot | null;
  segment: IndividualChronicleShot[];
  chronicle: IndividualChronicleShot[];
  chronicleIndex: number;
  selectedIndex: number;
  selectedCount: number;
  specialty: MatchSpecialty;
  story: BroadcastStoryContext;
  playerOneName: string;
  playerTwoName: string;
  playerOne?: IndividualChroniclePlayerValues;
  playerTwo?: IndividualChroniclePlayerValues;
  playerOnePerformanceRating?: number;
  playerTwoPerformanceRating?: number;
  gameOrder: number;
  matchPlayerOneWins: number;
  matchPlayerTwoWins: number;
  isDecisiveGame: boolean;
  isTournamentFinal: boolean;
  crossesDecisivePassage: boolean;
  showShotDetail: boolean;
  templateOffset: number;
}) {
  const target = MATCH_TARGET_POINTS[specialty];
  const score = `${shot.playerOneTotal}–${shot.playerTwoTotal}`;
  const stats = getStorySegmentStats(segment, previousSelectedShot);
  const gameWinnerName =
    story.winnerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
  const gameLoserName =
    story.winnerSide === "PLAYER_ONE" ? playerTwoName : playerOneName;
  const flow = buildStorySegmentFlow({
    stats,
    playerOneName,
    playerTwoName,
    target,
    score,
    selectedIndex,
    selectedCount,
    templateOffset,
  });
  const technical = showShotDetail
    ? buildStoryShotLine({
        shot,
        previousShot,
        crossesDecisivePassage,
        playerOneName,
        playerTwoName,
      })
    : "";

  if (shot.highlight === "WINNER") {
    const scoreBeforeFinal = previousShot
      ? `${previousShot.playerOneTotal}–${previousShot.playerTwoTotal}`
      : "0–0";
    const leadInSegment = segment.slice(0, -1);
    const leadIn =
      previousShot && leadInSegment.length > 0
        ? buildStorySegmentFlow({
            stats: getStorySegmentStats(
              leadInSegment,
              previousSelectedShot
            ),
            playerOneName,
            playerTwoName,
            target,
            score: scoreBeforeFinal,
            selectedIndex,
            selectedCount,
            templateOffset,
          })
        : "";
    const finalTechnical = getBroadcastTechnicalDetail(shot);
    const closingAction =
      shot.playerSide === shot.scoringSide
        ? `Sul ${scoreBeforeFinal}, ${gameWinnerName} riconosce la possibilità, si prende il tempo necessario e va sul tiro della chiusura. ${finalTechnical}`
        : `Sul ${scoreBeforeFinal}, la pressione presenta il conto a ${gameLoserName}. ${finalTechnical}`;

    if (!isDecisiveGame) {
      return [
        leadIn,
        closingAction,
        `Il ${score} consegna a ${gameWinnerName} la partita ${gameOrder}, ma l'incontro continua sul ${matchPlayerOneWins}–${matchPlayerTwoWins}. Il verdetto è rimandato.`,
      ]
        .filter(Boolean)
        .join(" ");
    }

    const verdict = isTournamentFinal
      ? `È finita: ${gameWinnerName} vince l'incontro ${matchPlayerOneWins}–${matchPlayerTwoWins} ed è il campione.`
      : `È finita: ${gameWinnerName} vince l'incontro ${matchPlayerOneWins}–${matchPlayerTwoWins} e supera il turno.`;

    return [
      leadIn,
      closingAction,
      `Le bilie si fermano sul ${score}; per un istante la sala trattiene il respiro, poi arrivano gli applausi.`,
      verdict,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (selectedIndex === 0) {
    const stakes = buildStoryStakesLine({
      gameOrder,
      matchPlayerOneWins,
      matchPlayerTwoWins,
      story,
      playerOneName,
      playerTwoName,
      isDecisiveGame,
      isTournamentFinal,
    });
    const conditions = buildConditionLine({
      playerOneName,
      playerTwoName,
      playerOne,
      playerTwo,
    });

    return [stakes, conditions, flow, technical]
      .filter(Boolean)
      .join(" ");
  }

  const performance =
    selectedIndex === 1
      ? buildPerformanceLine({
          playerOneName,
          playerTwoName,
          playerOnePerformanceRating,
          playerTwoPerformanceRating,
          playerOneTotal: shot.playerOneTotal,
          playerTwoTotal: shot.playerTwoTotal,
        })
      : "";
  const concentration =
    selectedIndex === Math.floor(selectedCount / 2)
      ? buildConcentrationLine({
          stats,
          playerOneName,
          playerTwoName,
          playerOne,
          playerTwo,
        })
      : "";
  const tension = buildStoryTensionLine({
    shot,
    target,
    story,
    playerOneName,
    playerTwoName,
    chronicle,
    chronicleIndex,
    isPenultimateChapter: selectedIndex === selectedCount - 2,
  });

  return [flow, concentration, performance, technical, tension]
    .filter(Boolean)
    .join(" ");
}

function getStorySegmentStats(
  segment: IndividualChronicleShot[],
  previousSelectedShot: IndividualChronicleShot | null
): StorySegmentStats {
  const finalShot = segment.at(-1);
  const stats: StorySegmentStats = {
    playerOneGain: finalShot
      ? finalShot.playerOneTotal -
        (previousSelectedShot?.playerOneTotal ?? 0)
      : 0,
    playerTwoGain: finalShot
      ? finalShot.playerTwoTotal -
        (previousSelectedShot?.playerTwoTotal ?? 0)
      : 0,
    playerOneAttempts: 0,
    playerTwoAttempts: 0,
    playerOneScoringVisits: 0,
    playerTwoScoringVisits: 0,
    playerOneEmptyVisits: 0,
    playerTwoEmptyVisits: 0,
    playerOneAdverseEvents: 0,
    playerTwoAdverseEvents: 0,
  };

  for (const candidate of segment) {
    const prefix = candidate.playerSide === "PLAYER_ONE" ? "playerOne" : "playerTwo";
    stats[`${prefix}Attempts`] += 1;

    if (candidate.playerSide !== candidate.scoringSide) {
      stats[`${prefix}AdverseEvents`] += 1;
    } else if (candidate.points > 0) {
      stats[`${prefix}ScoringVisits`] += 1;
    } else {
      stats[`${prefix}EmptyVisits`] += 1;
    }
  }

  return stats;
}

function buildStoryStakesLine({
  gameOrder,
  matchPlayerOneWins,
  matchPlayerTwoWins,
  story,
  playerOneName,
  playerTwoName,
  isDecisiveGame,
  isTournamentFinal,
}: {
  gameOrder: number;
  matchPlayerOneWins: number;
  matchPlayerTwoWins: number;
  story: BroadcastStoryContext;
  playerOneName: string;
  playerTwoName: string;
  isDecisiveGame: boolean;
  isTournamentFinal: boolean;
}) {
  const winnerAlreadyAdded = story.winnerSide === "PLAYER_ONE" ? 1 : 0;
  const loserAlreadyAdded = story.winnerSide === "PLAYER_TWO" ? 1 : 0;
  const beforeOne = Math.max(0, matchPlayerOneWins - winnerAlreadyAdded);
  const beforeTwo = Math.max(0, matchPlayerTwoWins - loserAlreadyAdded);
  const beforeScore = `${beforeOne}–${beforeTwo}`;

  if (beforeOne === 1 && beforeTwo === 1) {
    return isTournamentFinal
      ? `Non c'è più domani: si parte dall'${beforeScore} e questa partita assegna il titolo.`
      : `Si parte dall'${beforeScore}: questa partita vale il passaggio del turno e non concede appelli.`;
  }

  if (gameOrder > 1 && beforeOne !== beforeTwo) {
    const leaderName = beforeOne > beforeTwo ? playerOneName : playerTwoName;
    const chasingName = leaderName === playerOneName ? playerTwoName : playerOneName;
    return `${leaderName} entra nella partita ${gameOrder} avanti ${beforeScore} e può chiudere l'incontro. Per ${chasingName} ogni punto serve a tenere viva la sfida.`;
  }

  if (isDecisiveGame) {
    return `La prima partita deve ancora scegliere il proprio padrone, ma il suo peso è già chiaro: chi la prende costringe l'altro a inseguire.`;
  }

  return `${playerOneName} e ${playerTwoName} entrano nella partita ${gameOrder} sapendo che il primo strappo può cambiare l'intero incontro.`;
}

function buildConditionLine({
  playerOneName,
  playerTwoName,
  playerOne,
  playerTwo,
}: {
  playerOneName: string;
  playerTwoName: string;
  playerOne?: IndividualChroniclePlayerValues;
  playerTwo?: IndividualChroniclePlayerValues;
}) {
  if (!playerOne || !playerTwo) {
    return "I primi scambi serviranno anche a capire chi dei due riesce a portare sul panno la propria giornata migliore.";
  }

  const one = describeCondition(playerOneName, playerOne);
  const two = describeCondition(playerTwoName, playerTwo);
  const conditionGap =
    playerOne.form + playerOne.morale - playerTwo.form - playerTwo.morale;
  const reading =
    Math.abs(conditionGap) <= 2
      ? "Alla vigilia nessuno dei due ha un vantaggio emotivo evidente."
      : `${conditionGap > 0 ? playerOneName : playerTwoName} arriva con qualcosa in più da spendere, almeno nei numeri.`;

  return `${one}; ${two}. ${reading}`;
}

function describeCondition(
  playerName: string,
  player: IndividualChroniclePlayerValues
) {
  const formDescription =
    player.form >= 8
      ? "una forma eccellente"
      : player.form >= 6
        ? "una buona forma"
        : player.form >= 4
          ? "una condizione ordinaria"
          : "una forma lontana dal meglio";
  const moraleDescription =
    player.morale >= 8
      ? "una fiducia altissima"
      : player.morale >= 6
        ? "un morale solido"
        : player.morale >= 4
          ? "un morale da proteggere"
          : "una fiducia fragile";

  return `${playerName} porta al tavolo ${formDescription} (${player.form}/10) e ${moraleDescription} (${player.morale}/10)`;
}

function buildStorySegmentFlow({
  stats,
  playerOneName,
  playerTwoName,
  target,
  score,
  selectedIndex,
  selectedCount,
  templateOffset,
}: {
  stats: StorySegmentStats;
  playerOneName: string;
  playerTwoName: string;
  target: number;
  score: string;
  selectedIndex: number;
  selectedCount: number;
  templateOffset: number;
}) {
  const gap = Math.abs(stats.playerOneGain - stats.playerTwoGain);
  const dominantName =
    stats.playerOneGain > stats.playerTwoGain ? playerOneName : playerTwoName;
  const trailingName =
    dominantName === playerOneName ? playerTwoName : playerOneName;
  const [playerOneScore, playerTwoScore] = score
    .split("–")
    .map((value) => Number(value));
  const leaderName =
    playerOneScore >= playerTwoScore ? playerOneName : playerTwoName;
  const margin = Math.abs(playerOneScore - playerTwoScore);
  const progress = selectedCount > 1 ? selectedIndex / (selectedCount - 1) : 1;

  if (stats.playerOneGain === 0 && stats.playerTwoGain === 0) {
    return `Il tavolo resta chiuso e i birilli quasi fuori dal gioco. ${playerOneName} e ${playerTwoName} cercano prima di tutto di non concedere una posizione semplice.`;
  }

  if (selectedIndex === 0) {
    if (gap >= target * 0.08) {
      return `${dominantName} entra con maggiore continuità e prova subito a dare una direzione alla partita. ${trailingName} resta vicino, ma sul ${score} è già costretto a inseguire.`;
    }

    return `L'avvio è equilibrato: entrambi trovano punti senza riuscire a costruire una vera fuga. Il ${score} lascia ancora aperta ogni direzione.`;
  }

  if (stats.playerOneGain === 0 || stats.playerTwoGain === 0) {
    return `${dominantName} mette insieme una serie senza risposta e porta il tabellone sul ${score}. ${trailingName} deve interrompere il ritmo prima che il margine diventi anche fiducia.`;
  }

  if (margin === 0) {
    return `${playerOneName} e ${playerTwoName} si ritrovano sul ${score}. Tutto quello che uno prova a costruire viene cancellato dalla risposta dell'altro.`;
  }

  if (gap >= target * 0.1) {
    return selectBroadcastTemplate(
      [
        `${dominantName} prende questo tratto con più presenza e porta la partita sul ${score}. Non è ancora uno strappo definitivo, ma ${trailingName} comincia a rincorrere anche il ritmo del tavolo.`,
        `La partita cambia passo: ${dominantName} trova più spesso la prima scelta e sale sul ${score}. ${trailingName} resta dentro la sfida, ma adesso deve costruire una risposta vera.`,
        `${dominantName} mette insieme pazienza e punti fino al ${score}. Il margine comincia ad avere un peso e ${trailingName} non può più affidarsi soltanto all'errore.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (progress >= 0.68 && margin <= target * 0.12) {
    return `Si rispondono senza riuscire a staccarsi. Sul ${score} il finale è già entrato nei pensieri: ogni rientro al tavolo può aprire la strada alla chiusura.`;
  }

  return `${dominantName} guadagna qualcosa in questo tratto, ma ${trailingName} continua a rispondere. Sul ${score} ${leaderName} è avanti senza avere ancora il controllo della partita.`;
}

function buildConcentrationLine({
  stats,
  playerOneName,
  playerTwoName,
  playerOne,
  playerTwo,
}: {
  stats: StorySegmentStats;
  playerOneName: string;
  playerTwoName: string;
  playerOne?: IndividualChroniclePlayerValues;
  playerTwo?: IndividualChroniclePlayerValues;
}) {
  const oneTrouble = stats.playerOneEmptyVisits + stats.playerOneAdverseEvents;
  const twoTrouble = stats.playerTwoEmptyVisits + stats.playerTwoAdverseEvents;
  const totalAttempts = stats.playerOneAttempts + stats.playerTwoAttempts;

  if (totalAttempts < 4) return "";

  const oneRate = stats.playerOneAttempts
    ? stats.playerOneScoringVisits / stats.playerOneAttempts
    : 0;
  const twoRate = stats.playerTwoAttempts
    ? stats.playerTwoScoringVisits / stats.playerTwoAttempts
    : 0;

  if (Math.abs(oneRate - twoRate) >= 0.3) {
    const focusedName = oneRate > twoRate ? playerOneName : playerTwoName;
    const strugglingName = focusedName === playerOneName ? playerTwoName : playerOneName;
    const strugglingPlayer = focusedName === playerOneName ? playerTwo : playerOne;
    const trustLine =
      strugglingPlayer && strugglingPlayer.morale <= 3
        ? ` La fiducia già fragile non lo aiuta a cancellare l'errore precedente.`
        : "";

    return `${focusedName} appare più presente e dà continuità alle proprie scelte; ${strugglingName}, invece, comincia a perdere il filo tra un ingresso e l'altro.${trustLine}`;
  }

  if (oneTrouble + twoTrouble >= 3) {
    return "La fase centrale è meno pulita dell'avvio: aumentano le occasioni lasciate per strada e la concentrazione diventa parte della sfida quanto la tecnica.";
  }

  return "Entrambi restano dentro la partita con la testa: poche concessioni e la sensazione che il primo errore pesante possa lasciare un segno.";
}

function buildPerformanceLine({
  playerOneName,
  playerTwoName,
  playerOnePerformanceRating,
  playerTwoPerformanceRating,
  playerOneTotal,
  playerTwoTotal,
}: {
  playerOneName: string;
  playerTwoName: string;
  playerOnePerformanceRating?: number;
  playerTwoPerformanceRating?: number;
  playerOneTotal: number;
  playerTwoTotal: number;
}) {
  if (
    playerOnePerformanceRating == null ||
    playerTwoPerformanceRating == null
  ) {
    return "Anche i valori tecnici annunciavano equilibrio, e il tavolo fin qui non li ha smentiti.";
  }

  const expectedName =
    playerOnePerformanceRating > playerTwoPerformanceRating
      ? playerOneName
      : playerTwoName;
  const currentLeader =
    playerOneTotal === playerTwoTotal
      ? null
      : playerOneTotal > playerTwoTotal
        ? playerOneName
        : playerTwoName;

  if (
    Math.abs(playerOnePerformanceRating - playerTwoPerformanceRating) <= 3
  ) {
    return "I valori tecnici annunciavano una sfida vicina, e il tavolo fin qui non li ha smentiti.";
  }

  if (currentLeader === expectedName) {
    return `${expectedName} sta trasformando il vantaggio tecnico della vigilia in maggiore continuità, senza però riuscire ancora a prendere definitivamente il tavolo.`;
  }

  const surprisingName =
    expectedName === playerOneName ? playerTwoName : playerOneName;
  return `${surprisingName} sta andando oltre ciò che suggerivano i valori iniziali: compensa il divario con scelte più lucide e una migliore lettura di questo momento.`;
}

function buildStoryShotLine({
  shot,
  previousShot,
  crossesDecisivePassage,
  playerOneName,
  playerTwoName,
}: {
  shot: IndividualChronicleShot;
  previousShot: IndividualChronicleShot | null;
  crossesDecisivePassage: boolean;
  playerOneName: string;
  playerTwoName: string;
}) {
  const actingName =
    shot.playerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
  const scoringName =
    shot.scoringSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
  const previousLeader = previousShot
    ? getLeader(previousShot.playerOneTotal, previousShot.playerTwoTotal)
    : null;
  const currentLeader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);
  const technical = getBroadcastTechnicalDetail(shot);

  if (shot.outcome === "FOUL" || shot.outcome === "OWN_BALL_PINS") {
    const consequence =
      previousLeader &&
      currentLeader &&
      previousLeader !== currentLeader
        ? "Il comando cambia proprio su questo errore."
        : currentLeader === shot.scoringSide
          ? `${scoringName} allunga senza aver dovuto costruire il tiro.`
          : `${scoringName} accorcia le distanze e ritrova un ingresso nella partita.`;

    return `La pressione apre una crepa: ${actingName} sbaglia nel momento meno adatto. ${technical} ${consequence}`;
  }

  if (crossesDecisivePassage) {
    return `La svolta ha una traiettoria precisa. ${technical} Da questa bilia in avanti chi insegue non riuscirà più a tornare in parità.`;
  }

  if (
    previousLeader &&
    currentLeader &&
    previousLeader !== currentLeader
  ) {
    return `Il sorpasso nasce qui. ${actingName} accetta il rischio e trova il tiro che cercava: ${technical} Quando le bilie si fermano, il comando è cambiato.`;
  }

  if (shot.playerOneTotal === shot.playerTwoTotal) {
    return `${scoringName} ricuce tutto con la giocata che serviva: ${technical} La parità rimette entrambi davanti allo stesso bivio.`;
  }

  return `Il colpo che merita di essere ricordato arriva adesso. ${actingName} vede una linea che può cambiare il tono della partita e non si tira indietro: ${technical}`;
}

function buildStoryTensionLine({
  shot,
  target,
  story,
  playerOneName,
  playerTwoName,
  chronicle,
  chronicleIndex,
  isPenultimateChapter,
}: {
  shot: IndividualChronicleShot;
  target: number;
  story: BroadcastStoryContext;
  playerOneName: string;
  playerTwoName: string;
  chronicle: IndividualChronicleShot[];
  chronicleIndex: number;
  isPenultimateChapter: boolean;
}) {
  const leader = getLeader(shot.playerOneTotal, shot.playerTwoTotal);
  const leaderScore = Math.max(shot.playerOneTotal, shot.playerTwoTotal);
  const margin = Math.abs(shot.playerOneTotal - shot.playerTwoTotal);
  const winnerName =
    story.winnerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
  const loserName =
    story.winnerSide === "PLAYER_ONE" ? playerTwoName : playerOneName;

  if (
    isPenultimateChapter &&
    leaderScore >= target * 0.72 &&
    margin <= target * 0.15
  ) {
    const oneNeeds = Math.max(0, target - shot.playerOneTotal);
    const twoNeeds = Math.max(0, target - shot.playerTwoTotal);
    return `Ora i conti entrano nella testa: ${getItalianDative(playerOneName)} mancano ${oneNeeds} punti, ${getItalianDative(playerTwoName)} ${twoNeeds}. Una sola occasione pulita può valere la partita.`;
  }

  if (
    story.winnerMaximumDeficit >= target * 0.12 &&
    leader === story.winnerSide &&
    chronicle
      .slice(chronicleIndex)
      .every((candidate) => getLeader(candidate.playerOneTotal, candidate.playerTwoTotal) !== (story.winnerSide === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE"))
  ) {
    return `${winnerName} ha assorbito il momento peggiore e adesso è davanti. ${loserName} lo sente: la partita che sembrava sotto controllo gli sta scivolando di mano.`;
  }

  if (isPenultimateChapter && leaderScore >= target * 0.62) {
    const leaderName = leader === "PLAYER_ONE" ? playerOneName : playerTwoName;
    const chaserName = leaderName === playerOneName ? playerTwoName : playerOneName;
    return leader
      ? `${leaderName} vede avvicinarsi il traguardo; ${chaserName}, però, è ancora a un buon passaggio dal riaprire tutto.`
      : "La parità arriva quando il tavolo comincia a pesare davvero: da qui in avanti ogni scelta avrà il suono di una decisione.";
  }

  return "";
}

function getItalianDative(playerName: string) {
  return `${/^[aeiouàèéìòóù]/i.test(playerName) ? "ad" : "a"} ${playerName}`;
}

// Kept temporarily for the older compact chronicle while the match-story
// renderer is validated against played games.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildBroadcastMoment({
  shot,
  previousShot,
  previousSelectedShot,
  chronicle,
  chronicleIndex,
  selectedIndex,
  selectedCount,
  specialty,
  story,
  playerOneName,
  playerTwoName,
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
  story: BroadcastStoryContext;
  playerOneName: string;
  playerTwoName: string;
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
  const currentRun = getCurrentScoringRun(chronicle, chronicleIndex);
  const previousSelectedChronicleIndex = previousSelectedShot
    ? chronicle.findIndex(
        (candidate) => candidate.order === previousSelectedShot.order
      )
    : -1;
  const previousSelectedRun = getCurrentScoringRun(
    chronicle,
    previousSelectedChronicleIndex
  );
  const segmentLead = getBroadcastSegmentLead({
    previousSelectedShot,
    shot,
    target,
    playerOneName,
    playerTwoName,
  });
  const crossesDecisivePassage =
    story.decisiveOrder !== null &&
    shot.order >= story.decisiveOrder &&
    (previousSelectedShot?.order ?? 0) < story.decisiveOrder;
  const comebackStory = story.winnerMaximumDeficit >= target * 0.12;

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
        `${playerName} resta un istante piegato sul biliardo: sa di aver regalato più di un semplice punteggio.`,
      ],
      selectedIndex + templateOffset
    )} ${technical} ${consequence} Il parziale è ${score}.`;
  }

  if (selectedIndex === 0) {
    if (shot.points === 0) {
      return `${playerName} ha la prima occasione per capire il panno. ${technical} Il tabellone resta fermo, ma la posizione lasciata dice già a ${opponentName} quale tipo di partita lo aspetta.`;
    }

    return `${playerName} rompe l'attesa e mette il primo segno sul tabellone. ${technical} È soltanto l'inizio, ${score}, ma adesso la partita ha una voce.`;
  }

  if (crossesDecisivePassage) {
    const winnerName =
      story.winnerSide === "PLAYER_ONE" ? playerOneName : playerTwoName;
    const loserName =
      story.winnerSide === "PLAYER_ONE" ? playerTwoName : playerOneName;
    const path = comebackStory
      ? `${winnerName} era stato sotto di ${story.winnerMaximumDeficit} punti; con questa sequenza completa la risalita e mette finalmente il naso avanti.`
      : `${winnerName} passa davanti e, da questo momento, non concederà più a ${loserName} nemmeno la parità.`;

    return `Eccolo, il passaggio su cui si piega la partita. ${technical} ${path} Il tabellone segna ${score}; ${loserName} non è ancora battuto, ma adesso deve inseguire senza più margine per un regalo.`;
  }

  if (isTie) {
    return `${playerName} rifiuta di lasciar scappare l'avversario. ${technical} Quando l'ultima bilia rallenta, sul tabellone c'è ${score}. Dalla sedia ${opponentName} si rialza subito: la partita ricomincia da zero, ma la tensione no.`;
  }

  if (isLeadChange || shot.highlight === "LEAD_CHANGE") {
    return selectBroadcastTemplate(
      [
        `${playerName} non si accontenta di rientrare: vuole prendersi il tavolo. ${technical} È sorpasso, ${score}. ${opponentName} si alza prima ancora che le bilie siano ferme: la risposta non può aspettare.`,
        `${playerName} trova il varco nel momento giusto. ${technical} Sul ${score} cambia chi comanda; dalla sedia di ${opponentName} sparisce qualunque espressione, perché la prossima bilia è già diventata una prova di nervi.`,
        `${opponentName} sembrava avere la partita in mano, ma ${playerName} non ha smesso di rosicchiare punti. ${technical} Il sorpasso è servito, ${score}, e il pubblico accompagna le bilie fino all'ultimo centimetro.`,
      ],
      selectedIndex + templateOffset
    );
  }


  if (
    shot.points > 0 &&
    currentRun.shots >= 2 &&
    currentRun.points >= target * 0.12 &&
    previousSelectedRun.points < target * 0.12
  ) {
    return `${opponentName} continua a tornare al tavolo da una posizione scomoda e non riesce a interrompere la serie. ${technical} ${playerName} ha raccolto ${currentRun.points} punti senza subirne: non è più un singolo colpo, è uno strappo. Sul ${score} la partita comincia a chiedere una reazione vera.`;
  }

  if (lateAndClose) {
    const playerOneNeeded = Math.max(0, target - shot.playerOneTotal);
    const playerTwoNeeded = Math.max(0, target - shot.playerTwoTotal);

    return selectBroadcastTemplate(
      [
        `Qui non si gioca più soltanto contro il tavolo. ${playerName} prende tempo, controlla due volte la linea e parte: ${technical} Sul ${score} a ${playerOneName} mancano ${playerOneNeeded} punti, a ${playerTwoName} ${playerTwoNeeded}. Ogni rientro può essere l'ultimo buono.`,
        `${playerName} resta basso sulla stecca qualche secondo in più. ${technical} Il ${score} lascia entrambi a distanza di un solo passaggio importante: nessuno parla, perché tutti stanno facendo lo stesso conto.`,
      ],
      selectedIndex + templateOffset
    );
  }

  if (shot.highlight === "BIG_SHOT") {
    return selectBroadcastTemplate(
      [
        `Questo è il colpo che sveglia la sala. ${playerName} vede la linea, non la rifiuta e accelera la stecca: ${technical} I ${shot.points} punti aprono il margine sul ${score}; ${opponentName} resta in piedi accanto alla sedia, già dentro la replica.`,
        `${playerName} sceglie la soluzione più ambiziosa del tavolo e la esegue senza trattenere il braccio. ${technical} Il pubblico segue l'ultima corsa in piedi: sul ${score}, ${opponentName} sa che una risposta normale potrebbe non bastare.`,
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
        `${playerName} cambia impugnatura, torna sulla linea e alla fine decide di giocarla.`,
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
        `${segmentLead}${playerName} sceglie di attaccare e i punti arrivano. ${technical} Manca però il riparo: ${opponentName} è già in piedi e cerca con gli occhi la traiettoria della risposta.`,
        `${segmentLead}La realizzazione c'è, la protezione no. ${technical} ${playerName} aggiunge ${shot.points} punti, poi torna alla sedia senza staccare gli occhi dal tavolo: sa di aver lasciato a ${opponentName} una possibilità vera.`,
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
        `${segmentLead}${playerName} torna al tavolo con un'idea precisa. ${technical} I punti si sommano alla difesa e ${opponentName}, quando si alza, trova ancora il castello davanti. ${controlLine}`,
        `${segmentLead}Qui il realizzo è soltanto metà del lavoro. ${playerName} mette dentro anche la misura: ${technical} ${opponentName} osserva il tavolo da entrambi i lati prima di scegliere da dove provare a uscire.`,
        `${segmentLead}${playerName} non forza ciò che il tavolo non offre. ${technical} Sono ${shot.points} punti e, soprattutto, una rimanenza che costringe ${opponentName} a giocare per riaprire la posizione prima ancora che per segnare.`,
      ],
      selectedIndex + templateOffset
    );
  }

  const openingMood =
    selectionProgress < 0.25
      ? `Sono ancora schermaglie, ma ${opponentName} ha già capito che ogni spazio verrà conteso.`
      : `Non è lo strappo decisivo, è il modo con cui ${playerName} resta dentro la partita.`;

  return `${segmentLead}${playerName} prova a dare ritmo alla propria partita. ${technical} ${openingMood}`;
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

function getCurrentScoringRun(
  chronicle: IndividualChronicleShot[],
  chronicleIndex: number
) {
  let anchorIndex = chronicleIndex;

  while (anchorIndex >= 0 && chronicle[anchorIndex].points === 0) {
    anchorIndex -= 1;
  }

  const current = chronicle[anchorIndex];

  if (!current) return { points: 0, shots: 0 };

  let points = 0;
  let shots = 0;

  for (let index = anchorIndex; index >= 0; index -= 1) {
    const candidate = chronicle[index];

    if (candidate.points === 0) continue;
    if (candidate.scoringSide !== current.scoringSide) break;
    points += candidate.points;
    shots += 1;
  }

  return { points, shots };
}

function getBroadcastSegmentLead({
  previousSelectedShot,
  shot,
  target,
  playerOneName,
  playerTwoName,
}: {
  previousSelectedShot: IndividualChronicleShot | null;
  shot: IndividualChronicleShot;
  target: number;
  playerOneName: string;
  playerTwoName: string;
}) {
  if (
    !previousSelectedShot ||
    shot.order - previousSelectedShot.order < 3
  ) {
    return "";
  }

  const playerOneGain =
    shot.playerOneTotal - previousSelectedShot.playerOneTotal;
  const playerTwoGain =
    shot.playerTwoTotal - previousSelectedShot.playerTwoTotal;
  const gap = Math.abs(playerOneGain - playerTwoGain);

  if (gap < target * 0.08) return "";

  const dominantName =
    playerOneGain > playerTwoGain ? playerOneName : playerTwoName;
  const dominantGain = Math.max(playerOneGain, playerTwoGain);
  const otherGain = Math.min(playerOneGain, playerTwoGain);

  return `Fra un momento chiave e il successivo, ${dominantName} ha costruito un parziale di ${dominantGain}–${otherGain}. `;
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
    `Nessuno lascia la sala e nessuno abbassa la voce: lo ${matchScore} non è un verdetto, è soltanto il punto da cui riparte la sfida.`,
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
    const shotPreparation =
      shotDefinition.key === "BRICOLLA"
        ? "misura la forza per accompagnare l'avversaria nel castello; "
        : shotDefinition.key === "EBREA"
          ? "cerca prima la sponda e poi l'avversaria, per spingerla più volte attraverso il castello; "
        : "";

    return `${actingPlayerName} si prende il tavolo e cerca il tiro della chiusura. ${shot.shotName}: ${shotPreparation}${scoringPhrase}. L'esecuzione riesce e la partita termina qui.`;
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

    return `${shot.shotName}: sui birilli passa la propria.${pallino} I ${shot.points} punti vanno all'avversario e il gioco prosegue.`;
  }

  const scoringPhrase =
    shot.points > 0
      ? getScoringPhrase(specialty, shotDefinition, shot.points, random)
      : "i birilli non si muovono";

  if (shot.outcome === "COMPLETE") {
    const label = random() < 0.12 ? " Tiro completo." : "";
    const ending =
      shotDefinition.key === "BRICOLLA"
        ? selectTemplate(
            [
              "e accompagna l'avversaria dentro il castello con forza controllata",
              "poi lascia l'avversaria appena oltre il castello, ancora a protezione",
            ],
            random
          )
        : shotDefinition.key === "EBREA"
          ? "la battente trova prima la sponda e poi l'avversaria, che attraversa il castello con la forza cercata"
        : selectTemplate(
            [
              "e lascia una rimanenza coperta",
              "poi porta le bilie al riparo dietro il castello",
              "e chiude bene anche la traiettoria difensiva",
            ],
            random
          );

    return `${shot.shotName}: ${scoringPhrase}, ${ending}.${label}`;
  }

  if (shot.outcome === "PARTIAL_POINTS") {
    const label = random() < 0.12 ? " Tiro preso per metà." : "";
    const ending =
      shotDefinition.key === "BRICOLLA"
        ? "ma la forza è eccessiva e l'avversaria supera il castello più del previsto"
        : shotDefinition.key === "EBREA"
          ? "ma dopo il contatto di sponda l'avversaria attraversa il castello senza lasciare copertura"
        : selectTemplate(
            [
              "ma la difesa non riesce e resta una replica possibile",
              "però la rimanenza rimane leggibile",
              "senza riuscire a nascondere il tiro successivo",
            ],
            random
          );

    return `${shot.shotName}: ${scoringPhrase}, ${ending}.${label}`;
  }

  if (shot.outcome === "PARTIAL_DEFENSE") {
    const label = random() < 0.12 ? " Tiro preso per metà." : "";
    const ending =
      shotDefinition.key === "BRICOLLA"
        ? "ma la forza è quella cercata e l'avversaria si ferma a ridosso del castello"
        : shotDefinition.key === "EBREA"
          ? "e dopo il contatto di sponda l'avversaria termina la corsa protetta dal castello"
        : selectTemplate(
            [
              "ma la misura è precisa e il castello resta a protezione",
              "però la rimanenza costringe l'avversario a cercare la sponda",
              "ma almeno porta le bilie in una posizione difensiva",
            ],
            random
          );

    return `${shot.shotName}: ${scoringPhrase}, ${ending}.${label}`;
  }

  const measureError =
    shotDefinition.key === "BRICOLLA"
      ? "La forza non è quella cercata: l'avversaria corre troppo oltre il castello e resta visibile."
      : shotDefinition.key === "EBREA"
        ? "La battente trova la sponda, ma non accompagna l'avversaria nelle passate cercate sul castello."
      : shotDefinition.key === "TRE_SPONDE_CALCIO" ||
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

  return `${shot.shotName}: ${measureError}`;
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
    "EBREA",
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

  if (shot.key === "EBREA") return `sull'${name}`;

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
  const option = selectNinePinScoreOption(
    "GORIZIANA",
    shot,
    points,
    random
  );
  const pinFall = getNinePinFallDescription(option, "GORIZIANA");
  const isFilotto =
    shot.family === "DIRECT" &&
    points === 30 &&
    option.outerPins === 2 &&
    option.innerPins === 2 &&
    option.redPin &&
    option.pallinoContact === "NONE";

  if (isFilotto) {
    return "trova il filotto: due esterni, due interni e il rosso valgono 30 punti";
  }

  if (option.pinPoints === 0) {
    return `trova soltanto il pallino da ${option.pallinoPoints}`;
  }

  if (shot.family === "CUSHION") {
    const pinScore = `${pinFall}: ${option.basePinPoints} punti di birilli che la sponda raddoppia a ${option.pinPoints}`;

    return option.pallinoPoints > 0
      ? `${pinScore}; l'arrivo sul pallino aggiunge ${option.pallinoPoints}, totale ${points}`
      : `${pinScore}, totale ${points}`;
  }

  return option.pallinoPoints > 0
    ? `${pinFall} per ${option.pinPoints} punti; il pallino aggiunge ${option.pallinoPoints}, totale ${points}`
    : `${pinFall}, per un totale di ${points} punti`;
}

function getTuttiDoppiScoringPhrase(
  shot: ShotDefinition,
  points: number,
  random: () => number
) {
  const option = selectNinePinScoreOption(
    "TUTTI_DOPPI",
    shot,
    points,
    random
  );
  const pinFall = getNinePinFallDescription(option, "TUTTI_DOPPI");
  const isFilotto =
    shot.family === "DIRECT" &&
    points === 60 &&
    option.outerPins === 2 &&
    option.innerPins === 2 &&
    option.redPin &&
    option.pallinoContact === "NONE";

  if (isFilotto) {
    return "trova il filotto: due esterni, due interni e il rosso valgono 60 punti a Tutti Doppi";
  }

  if (option.pinPoints === 0) {
    return `trova soltanto il pallino da ${option.pallinoPoints}`;
  }

  return option.pallinoPoints > 0
    ? `${pinFall} per ${option.pinPoints} punti di birilli; il pallino aggiunge ${option.pallinoPoints}, totale ${points}`
    : `${pinFall}, per un totale di ${points} punti`;
}

function getNinePinFallDescription(
  option: NinePinScoreOption,
  specialty: "GORIZIANA" | "TUTTI_DOPPI"
) {
  if (option.pinPoints === 0) return "non cadono birilli";

  const multiplier = specialty === "TUTTI_DOPPI" ? 2 : 1;

  if (option.redAlone) {
    return `cade soltanto il rosso da ${30 * multiplier}`;
  }

  const parts: string[] = [];

  if (option.outerPins > 0) {
    parts.push(
      `${getPinCountLabel(option.outerPins, "esterno", "esterni")} da ${2 * multiplier}`
    );
  }

  if (option.innerPins > 0) {
    parts.push(
      `${getPinCountLabel(option.innerPins, "interno", "interni")} da ${8 * multiplier}`
    );
  }

  if (option.redPin) parts.push(`il rosso da ${10 * multiplier}`);

  const fallenPins =
    option.outerPins + option.innerPins + (option.redPin ? 1 : 0);

  return `${fallenPins === 1 ? "cade" : "cadono"} ${joinItalianList(parts)}`;
}

function getPinCountLabel(count: number, singular: string, plural: string) {
  if (count === 1) return `un ${singular}`;
  if (count === 2) return `due ${plural}`;
  if (count === 3) return `tre ${plural}`;
  return `quattro ${plural}`;
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
