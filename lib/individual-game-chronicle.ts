import {
  MATCH_SHOT_SCORES,
  MATCH_TARGET_POINTS,
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
  phase: "OPENING" | "MIDDLE" | "FINISH";
  commentary: string;
  highlight: "NONE" | "MISS" | "LEAD_CHANGE" | "BIG_SHOT" | "WINNER";
};

const CHRONICLE_ATTEMPTS: Record<MatchSpecialty, number> = {
  ITALIANA: 13,
  GORIZIANA: 16,
  TUTTI_DOPPI: 18,
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
  const narrativeRandom = createSeededRandom(
    gameId * 193 + playerOneScore * 29 + playerTwoScore * 43
  );
  const playerOneAttempts = CHRONICLE_ATTEMPTS[specialty];
  const playerTwoAttempts =
    winnerSide === "PLAYER_ONE"
      ? CHRONICLE_ATTEMPTS[specialty] - 1
      : CHRONICLE_ATTEMPTS[specialty];
  const playerOneShots = distributeScore({
    total: playerOneScore,
    attempts: playerOneAttempts,
    allowedScores,
    requireLastScore: winnerSide === "PLAYER_ONE",
    minimumMisses: 2,
    random,
  });
  const playerTwoShots = distributeScore({
    total: playerTwoScore,
    attempts: playerTwoAttempts,
    allowedScores,
    requireLastScore: winnerSide === "PLAYER_TWO",
    minimumMisses: 2,
    random,
  });
  const chronicle: Array<
    Omit<IndividualChronicleShot, "phase" | "commentary" | "highlight">
  > = [];
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

  return chronicle.map((shot, index) => {
    const previousShot = chronicle[index - 1];
    const previousPlayerOneTotal = previousShot?.playerOneTotal ?? 0;
    const previousPlayerTwoTotal = previousShot?.playerTwoTotal ?? 0;
    const isFinalShot = index === chronicle.length - 1;
    const phase = getChroniclePhase(index, chronicle.length);
    const narrative = buildShotNarrative({
      specialty,
      shot,
      previousPlayerOneTotal,
      previousPlayerTwoTotal,
      isFinalShot,
      random: narrativeRandom,
    });

    return {
      ...shot,
      phase,
      ...narrative,
    };
  });
}

function distributeScore({
  total,
  attempts,
  allowedScores,
  requireLastScore,
  minimumMisses,
  random,
}: {
  total: number;
  attempts: number;
  allowedScores: readonly number[];
  requireLastScore: boolean;
  minimumMisses: number;
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

    const missProbability = Math.max(
      0.14,
      remainingMisses / (remainingAttempts + 1)
    );
    const canMiss = feasibleScores.includes(0);
    const shouldMiss = canMiss && random() < missProbability;
    const scoringOptions = feasibleScores.filter((score) => score > 0);
    const average = remaining / Math.max(1, remainingAttempts + 1);
    const desiredScore = average * (0.75 + random() * 0.5);
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

    if (leader && currentLeader && leader !== currentLeader) {
      leadChanges += 1;
    }

    if (leader) currentLeader = leader;

    const winnerDeficit =
      winnerSide === "PLAYER_ONE"
        ? shot.playerTwoTotal - shot.playerOneTotal
        : shot.playerOneTotal - shot.playerTwoTotal;
    winnerMaximumDeficit = Math.max(winnerMaximumDeficit, winnerDeficit);
  }

  const targetPoints = MATCH_TARGET_POINTS[specialty];
  const zeroPointShots = chronicle.filter((shot) => shot.points === 0).length;
  const biggestShot = Math.max(...chronicle.map((shot) => shot.points));
  const finalScore = `${finalShot.playerOneTotal}–${finalShot.playerTwoTotal}`;
  const comeback = winnerMaximumDeficit >= targetPoints * 0.15;
  let opening: string;

  if (comeback) {
    opening = `${winnerName} resta freddo nel momento più difficile e costruisce la rimonta tiro dopo tiro.`;
  } else if (leadChanges >= 3) {
    opening = `Il comando cambia ${leadChanges} volte prima dello strappo decisivo di ${winnerName}.`;
  } else {
    opening = `${winnerName} costruisce il successo con pazienza, alternando misura, difesa e accelerazioni.`;
  }

  const middle = isBigShot(specialty, biggestShot)
    ? `Il colpo più pesante vale ${biggestShot} punti, ma la differenza nasce soprattutto nella continuità.`
    : `${zeroPointShots} tiri non muovono il punteggio: la posizione conta quanto l'attacco.`;

  return `${opening} ${middle} Il tiro decisivo da ${finalShot.points} punti fissa il ${finalScore}.`;
}

function getChroniclePhase(index: number, totalShots: number) {
  if (index < Math.ceil(totalShots * 0.25)) return "OPENING" as const;
  if (index >= Math.floor(totalShots * 0.75)) return "FINISH" as const;
  return "MIDDLE" as const;
}

function buildShotNarrative({
  specialty,
  shot,
  previousPlayerOneTotal,
  previousPlayerTwoTotal,
  isFinalShot,
  random,
}: {
  specialty: MatchSpecialty;
  shot: Omit<
    IndividualChronicleShot,
    "phase" | "commentary" | "highlight"
  >;
  previousPlayerOneTotal: number;
  previousPlayerTwoTotal: number;
  isFinalShot: boolean;
  random: () => number;
}) {
  const previousLeader = getLeader(
    previousPlayerOneTotal,
    previousPlayerTwoTotal
  );
  const currentLeader = getLeader(
    shot.playerOneTotal,
    shot.playerTwoTotal
  );
  const tied =
    shot.playerOneTotal === shot.playerTwoTotal &&
    shot.playerOneTotal > 0 &&
    previousPlayerOneTotal !== previousPlayerTwoTotal;
  const leadChanged =
    previousLeader !== null &&
    currentLeader !== null &&
    previousLeader !== currentLeader;
  const previousDeficit =
    shot.playerSide === "PLAYER_ONE"
      ? previousPlayerTwoTotal - previousPlayerOneTotal
      : previousPlayerOneTotal - previousPlayerTwoTotal;
  const currentDeficit =
    shot.playerSide === "PLAYER_ONE"
      ? shot.playerTwoTotal - shot.playerOneTotal
      : shot.playerOneTotal - shot.playerTwoTotal;
  let commentary = selectShotCommentary(specialty, shot.points, random);
  let highlight: IndividualChronicleShot["highlight"] = "NONE";

  if (shot.points === 0) highlight = "MISS";
  if (isBigShot(specialty, shot.points)) highlight = "BIG_SHOT";

  if (tied) {
    commentary += selectTemplate(
      [
        " Aggancio perfetto: il tabellone torna in parità.",
        " Tutto da rifare: i due giocatori sono di nuovo appaiati.",
      ],
      random
    );
    highlight = "LEAD_CHANGE";
  } else if (leadChanged) {
    commentary += selectTemplate(
      [
        " Sorpasso: cambia il comando della partita.",
        " Controsorpasso immediato: nessuno riesce a scappare.",
        " Nuovo ribaltamento, con il pubblico dentro la partita.",
        " Il margine era sottile e ora il comando passa di mano.",
      ],
      random
    );
    highlight = "LEAD_CHANGE";
  } else if (
    previousDeficit > MATCH_TARGET_POINTS[specialty] * 0.12 &&
    currentDeficit > 0 &&
    currentDeficit <= previousDeficit * 0.65
  ) {
    commentary += " Lo svantaggio si accorcia e la pressione sale.";
  }

  if (isFinalShot) {
    commentary += " È il colpo che chiude la partita.";
    highlight = "WINNER";
  }

  return { commentary, highlight };
}

function selectShotCommentary(
  specialty: MatchSpecialty,
  points: number,
  random: () => number
) {
  if (points === 0) {
    return selectTemplate(
      [
        "Cerca il castello, ma la traiettoria sfila: nessun punto e tavolo all'avversario.",
        "Tiro soprattutto difensivo: il punteggio non si muove, la posizione però resta scomoda.",
        "La misura non è quella voluta e i birilli restano fermi.",
        "Prova a forzare l'angolo, senza trovare il passaggio giusto sul castello.",
      ],
      random
    );
  }

  const band = getShotBand(specialty, points);
  const templates: Record<MatchSpecialty, Record<typeof band, string[]>> = {
    ITALIANA: {
      LOW: [
        "Tocco sottile sul castello: pochi punti e grande attenzione alla misura.",
        "Gioca semplice, raccoglie il necessario e lascia una posizione controllata.",
        "Impatto leggero sui birilli: bottino contenuto, ma nessun rischio inutile.",
      ],
      MEDIUM: [
        "Esecuzione pulita: buona quantità e biglia avversaria accompagnata lontano.",
        "Trova bene il primo impatto e dà ritmo alla propria rimonta.",
        "Tiro preciso, con il giusto equilibrio tra punti e difesa.",
      ],
      HIGH: [
        "Gran passaggio sul castello: il parziale cambia improvvisamente velocità.",
        "Colpo di qualità, pieno e ben misurato: arriva un bottino pesante.",
        "La biglia entra con l'angolo giusto e il castello si apre.",
      ],
      EXCEPTIONAL: [
        "Tutto il castello: esecuzione perfetta e massimo raccolto possibile.",
        "Una giocata da applausi, precisa dall'impatto fino all'ultimo birillo.",
      ],
    },
    GORIZIANA: {
      LOW: [
        "Passaggio controllato: qualche birillo e posizione ancora tutta da costruire.",
        "Preferisce la misura alla forza e raccoglie un piccolo vantaggio.",
        "Tiro prudente, utile soprattutto per non concedere una replica comoda.",
      ],
      MEDIUM: [
        "Impatto pieno sul castello: un buon bottino senza perdere il controllo.",
        "Trova una linea efficace e aggiunge punti importanti al proprio parziale.",
        "La quantità è corretta: esecuzione concreta e tavolo ben gestito.",
      ],
      HIGH: [
        "Serie pesante sui birilli: il pubblico si accende e la partita cambia tono.",
        "Colpo coraggioso e ben riuscito, con un parziale che pesa sull'incontro.",
        "Il castello viene attraversato in pieno: accelerazione improvvisa.",
      ],
      EXCEPTIONAL: [
        "Una giocata spettacolare: il castello esplode e arriva un punteggio enorme.",
        "Tiro da fuoriclasse, potenza e precisione si incontrano alla perfezione.",
      ],
    },
    TUTTI_DOPPI: {
      LOW: [
        "Sfrutta il doppio conteggio con prudenza, senza forzare la posizione.",
        "Pochi birilli coinvolti, ma il tiro resta ordinato e ben misurato.",
        "Giocata essenziale: qualche punto e biglia avversaria tenuta a distanza.",
      ],
      MEDIUM: [
        "Il doppio conteggio premia una traiettoria pulita e ben costruita.",
        "Buon impatto sul castello: il parziale cresce con regolarità.",
        "Esecuzione solida, senza eccessi ma con un risultato importante.",
      ],
      HIGH: [
        "Tiro pesante: i punti doppi fanno impennare il tabellone.",
        "Grande lettura dell'angolo e raccolto consistente sul castello.",
        "Accelera nel momento giusto con una giocata di notevole difficoltà.",
      ],
      EXCEPTIONAL: [
        "Colpo devastante a tutti doppi: il parziale viene completamente riscritto.",
        "Una bordata da applausi, trasformata in un bottino eccezionale.",
      ],
    },
  };

  return selectTemplate(templates[specialty][band], random);
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
  const thresholds: Record<MatchSpecialty, number> = {
    ITALIANA: 13,
    GORIZIANA: 60,
    TUTTI_DOPPI: 72,
  };

  return points >= thresholds[specialty];
}

function getLeader(
  playerOneTotal: number,
  playerTwoTotal: number
): IndividualChroniclePlayerSide | null {
  if (playerOneTotal === playerTwoTotal) return null;
  return playerOneTotal > playerTwoTotal ? "PLAYER_ONE" : "PLAYER_TWO";
}

function selectTemplate(templates: readonly string[], random: () => number) {
  return templates[Math.floor(random() * templates.length)] ?? templates[0];
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