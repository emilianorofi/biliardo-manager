import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateIndividualGameScore,
  rankIndividualTournamentPlayers,
  shuffleIndividualDraw,
  simulateIndividualBestOfThree,
  type IndividualMatchPlayer,
} from "../lib/individual-match-engine";
import {
  buildIndividualGameClosing,
  buildIndividualGameBroadcast,
  buildIndividualGameChronicle,
  buildIndividualGameIntroduction,
  buildIndividualGameSummary,
  selectIndividualChronicleHighlights,
} from "../lib/individual-game-chronicle";
import { MATCH_SHOT_SCORES } from "../lib/match-engine";

test("qualifica esattamente i primi 256 giocatori per overall", () => {
  const players = Array.from({ length: 260 }, (_, index) =>
    createPlayer(index + 1, index + 1)
  );
  const qualified = rankIndividualTournamentPlayers(players);

  assert.equal(qualified.length, 256);
  assert.equal(qualified[0].player.id, 260);
  assert.equal(qualified[0].ranking, 1);
  assert.equal(qualified[255].player.id, 5);
});

test("il sorteggio cambia l'ordine senza perdere partecipanti", () => {
  const draw = shuffleIndividualDraw([1, 2, 3, 4], () => 0);

  assert.deepEqual(draw, [2, 3, 4, 1]);
  assert.deepEqual([...draw].sort((a, b) => a - b), [1, 2, 3, 4]);
});

test("un incontro individuale termina appena un giocatore vince due prove", () => {
  const randomValues = [0, 0.99, 0];
  let randomIndex = 0;
  const result = simulateIndividualBestOfThree(
    createPlayer(1, 70),
    createPlayer(2, 70),
    "ITALIANA",
    () => randomValues[randomIndex++]
  );

  assert.equal(result.winnerPlayerId, 1);
  assert.equal(result.loserPlayerId, 2);
  assert.equal(result.playerOneWins, 2);
  assert.equal(result.playerTwoWins, 1);
  assert.deepEqual(
    result.games.map((game) => ({
      order: game.order,
      specialty: game.specialty,
      winnerSide: game.winnerSide,
      winnerPlayerId: game.winnerPlayerId,
    })),
    [
      {
        order: 1,
        specialty: "ITALIANA",
        winnerSide: "PLAYER_ONE",
        winnerPlayerId: 1,
      },
      {
        order: 2,
        specialty: "ITALIANA",
        winnerSide: "PLAYER_TWO",
        winnerPlayerId: 2,
      },
      {
        order: 3,
        specialty: "ITALIANA",
        winnerSide: "PLAYER_ONE",
        winnerPlayerId: 1,
      },
    ]
  );
  assert.deepEqual(
    result.games.map((game) => [
      game.playerOnePerformanceRating,
      game.playerTwoPerformanceRating,
    ]),
    [
      [70, 70],
      [70, 70],
      [70, 70],
    ]
  );
  assert.deepEqual(
    result.games.map((game) => [game.playerOneScore, game.playerTwoScore]),
    [
      [80, 62],
      [75, 80],
      [80, 62],
    ]
  );
  assert.equal(randomIndex, 3);
});

test("usa il traguardo punti previsto da ogni specialità", () => {
  assert.deepEqual(
    calculateIndividualGameScore({
      specialty: "ITALIANA",
      winnerSide: "PLAYER_ONE",
      playerOnePerformanceRating: 80,
      playerTwoPerformanceRating: 70,
      randomValue: 0.5,
    }),
    { playerOneScore: 80, playerTwoScore: 66 }
  );
  assert.deepEqual(
    calculateIndividualGameScore({
      specialty: "GORIZIANA",
      winnerSide: "PLAYER_TWO",
      playerOnePerformanceRating: 70,
      playerTwoPerformanceRating: 80,
      randomValue: 0.5,
    }),
    { playerOneScore: 330, playerTwoScore: 400 }
  );
  assert.deepEqual(
    calculateIndividualGameScore({
      specialty: "TUTTI_DOPPI",
      winnerSide: "PLAYER_ONE",
      playerOnePerformanceRating: 80,
      playerTwoPerformanceRating: 70,
      randomValue: 0.5,
    }),
    { playerOneScore: 600, playerTwoScore: 492 }
  );
});

test("conserva i punteggi ammessi per ogni singolo tiro", () => {
  assert.deepEqual(MATCH_SHOT_SCORES.ITALIANA, [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ]);
  assert.deepEqual(MATCH_SHOT_SCORES.GORIZIANA, [
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
    38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 60, 64, 68, 72, 76, 80, 84, 88,
    92, 96, 100, 104, 108, 112,
  ]);
  assert.deepEqual(MATCH_SHOT_SCORES.TUTTI_DOPPI, [
    4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72,
    76, 80, 84, 88, 92, 96, 100, 104, 108, 112,
  ]);
});

test("costruisce una cronaca alternata con punteggi e totali corretti", () => {
  const chronicle = buildIndividualGameChronicle(
    withChroniclePlayers({
      gameId: 510,
      specialty: "GORIZIANA",
      winnerSide: "PLAYER_TWO",
      playerOneScore: 324,
      playerTwoScore: 400,
    })
  );

  assert.ok(chronicle.length >= 44);
  assert.equal(chronicle.at(-1)!.order, chronicle.length);
  assert.equal(chronicle.at(-1)!.scoringSide, "PLAYER_TWO");
  assert.equal(chronicle.at(-1)!.playerOneTotal, 324);
  assert.equal(chronicle.at(-1)!.playerTwoTotal, 400);
  assert.equal(chronicle.at(-1)!.phase, "FINISH");
  assert.equal(chronicle.at(-1)!.highlight, "WINNER");
  assert.match(
    chronicle.at(-1)!.commentary,
    /tiro della chiusura|chiude la partita/
  );

  for (const [index, shot] of chronicle.entries()) {
    assert.equal(shot.order, index + 1);
    assert.equal(
      shot.scoringSide,
      index % 2 === 0 ? "PLAYER_ONE" : "PLAYER_TWO"
    );
    assert.ok(
      shot.points === 0 || MATCH_SHOT_SCORES.GORIZIANA.includes(shot.points)
    );
    assert.equal(shot.points % 2, 0);
    assert.ok(shot.shotName.length > 3);
    assert.ok(shot.commentary.length > 20);
  }
});

test("chiude ogni specialità con il tiro del vincitore", () => {
  const cases = [
    {
      gameId: 1,
      specialty: "ITALIANA" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 80,
      playerTwoScore: 65,
    },
    {
      gameId: 2,
      specialty: "GORIZIANA" as const,
      winnerSide: "PLAYER_TWO" as const,
      playerOneScore: 324,
      playerTwoScore: 400,
    },
    {
      gameId: 3,
      specialty: "TUTTI_DOPPI" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 600,
      playerTwoScore: 492,
    },
  ];

  for (const game of cases) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers(game)
    );
    const finalShot = chronicle.at(-1)!;
    const allowedScores = MATCH_SHOT_SCORES[game.specialty];

    assert.equal(finalShot.scoringSide, game.winnerSide);
    assert.ok(finalShot.points > 0);
    assert.ok(allowedScores.includes(finalShot.points));
    assert.equal(finalShot.playerOneTotal, game.playerOneScore);
    assert.equal(finalShot.playerTwoTotal, game.playerTwoScore);
    assert.ok(chronicle.filter((shot) => shot.points === 0).length >= 4);

    for (const shot of chronicle) {
      assert.ok(shot.points === 0 || allowedScores.includes(shot.points));
      assert.ok(shot.playerOneTotal <= game.playerOneScore);
      assert.ok(shot.playerTwoTotal <= game.playerTwoScore);
    }
  }
});

test("privilegia i punteggi bassi e produce un vero racconto", () => {
  const games = [
    {
      gameId: 11,
      specialty: "ITALIANA" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 80,
      playerTwoScore: 65,
      commonScoreMaximum: 10,
    },
    {
      gameId: 510,
      specialty: "GORIZIANA" as const,
      winnerSide: "PLAYER_TWO" as const,
      playerOneScore: 324,
      playerTwoScore: 400,
      commonScoreMaximum: 40,
    },
    {
      gameId: 33,
      specialty: "TUTTI_DOPPI" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 600,
      playerTwoScore: 492,
      commonScoreMaximum: 48,
    },
  ];

  for (const game of games) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers(game)
    );
    const scoringShots = chronicle.filter((shot) => shot.points > 0);
    const commonShots = scoringShots.filter(
      (shot) => shot.points <= game.commonScoreMaximum
    );
    const summary = buildIndividualGameSummary({
      chronicle,
      winnerSide: game.winnerSide,
      winnerName: "Giocatore vincente",
      specialty: game.specialty,
    });

    assert.ok(commonShots.length / scoringShots.length >= 0.75);
    assert.ok(
      scoringShots.every(
        (shot) => MATCH_SHOT_SCORES[game.specialty].includes(shot.points)
      )
    );
    assert.match(summary, /Giocatore vincente/);
    assert.match(summary, /tiro decisivo/);
  }
});

test("usa le caratteristiche reali per scegliere i tiri", () => {
  const directSpecialist = {
    ...createPlayer(1, 55),
    diretto: 98,
    sponde: 8,
  };
  const cushionSpecialist = {
    ...createPlayer(1, 55),
    diretto: 8,
    sponde: 98,
  };
  const opponent = createPlayer(2, 55);
  let directChoices = 0;
  let cushionChoices = 0;

  for (let gameId = 700; gameId < 720; gameId += 1) {
    const common = {
      gameId,
      specialty: "TUTTI_DOPPI" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 600,
      playerTwoScore: 480,
      playerOnePerformanceRating: 75,
      playerTwoPerformanceRating: 65,
      playerTwo: opponent,
    };
    const directChronicle = buildIndividualGameChronicle({
      ...common,
      playerOne: directSpecialist,
    });
    const cushionChronicle = buildIndividualGameChronicle({
      ...common,
      playerOne: cushionSpecialist,
    });

    directChoices += directChronicle.filter(
      (shot) =>
        shot.playerSide === "PLAYER_ONE" && shot.shotFamily === "DIRECT"
    ).length;
    cushionChoices += cushionChronicle.filter(
      (shot) =>
        shot.playerSide === "PLAYER_ONE" && shot.shotFamily === "DIRECT"
    ).length;
  }

  assert.ok(directChoices > cushionChoices);
});

test("assegna all'avversario i punti di falli e passaggi della propria", () => {
  let adverseShotFound = false;

  for (let gameId = 800; gameId < 850 && !adverseShotFound; gameId += 1) {
    const weakPlayer = createPlayer(1, 10);
    const chronicle = buildIndividualGameChronicle({
      ...withChroniclePlayers({
        gameId,
        specialty: "ITALIANA" as const,
        winnerSide: "PLAYER_ONE" as const,
        playerOneScore: 80,
        playerTwoScore: 64,
      }),
      playerTwo: weakPlayer,
    });
    const adverseShot = chronicle.find(
      (shot) => shot.playerSide !== shot.scoringSide
    );

    if (adverseShot) {
      adverseShotFound = true;
      assert.ok(adverseShot.points >= 2);
      assert.ok(
        adverseShot.outcome === "FOUL" ||
          adverseShot.outcome === "OWN_BALL_PINS"
      );
      assert.match(adverseShot.commentary, /avversario/);
    }
  }

  assert.equal(adverseShotFound, true);
});

test("attribuisce i 3 punti dell'Italiana soltanto al pallino", () => {
  let threePointShots = 0;

  for (let gameId = 900; gameId < 930; gameId += 1) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers({
        gameId,
        specialty: "ITALIANA" as const,
        winnerSide: "PLAYER_ONE" as const,
        playerOneScore: 80,
        playerTwoScore: 65,
      })
    );

    for (const shot of chronicle.filter((item) => item.points === 3)) {
      threePointShots += 1;
      assert.equal(shot.shotName, "Giocata sul pallino");
      assert.match(shot.commentary, /pallino/);
      assert.doesNotMatch(shot.commentary, /unici 3 punti/);
      assert.doesNotMatch(shot.commentary, /Raddrizzo|Traversino/);
    }

    for (const shot of chronicle.filter(
      (item) => item.points > 0 && item.points % 2 === 1
    )) {
      assert.match(shot.commentary, /pallino/);
    }
  }

  assert.ok(threePointShots > 0);
});

test("rispetta il conteggio semplice e doppio della Goriziana", () => {
  let directOnlyScores = 0;
  let cushionOnlyScores = 0;

  for (let gameId = 930; gameId < 960; gameId += 1) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers({
        gameId,
        specialty: "GORIZIANA" as const,
        winnerSide: "PLAYER_TWO" as const,
        playerOneScore: 324,
        playerTwoScore: 400,
      })
    );

    for (const shot of chronicle) {
      if (shot.points % 4 === 2) {
        directOnlyScores += 1;
        assert.equal(shot.shotFamily, "DIRECT");
      }

      if (shot.points > 56) {
        cushionOnlyScores += 1;
        assert.equal(shot.shotFamily, "CUSHION");
      }
    }
  }

  assert.ok(directOnlyScores > 0);
  assert.ok(cushionOnlyScores > 0);
});

test("associa i tiri dell'Italiana alle realizzazioni più frequenti", () => {
  const preferredScores: Record<string, readonly number[]> = {
    Raddrizzo: [8, 10, 11, 12, 13, 14],
    Rovescio: [8, 10, 11, 12, 13, 14],
    "Traversino piano": [2, 5, 6, 8, 11, 12],
    "Traversino a più passate": [4, 7, 8, 10, 11, 12],
    Giro: [4, 6, 7, 8, 9, 10, 11],
    Girone: [4, 6, 7, 8, 9, 10, 11],
    "Angolo di prima": [2, 4, 5, 6, 7, 8, 9, 10],
    "Angolo di seconda": [2, 4, 5, 6, 7, 8, 9, 10],
    Striscio: [2, 4, 5, 6, 7, 8, 9],
    Candela: [2, 5, 8, 11],
    "Sponda-biglia": [2, 4, 5, 6, 7, 8, 9, 10],
    Bricolla: [2, 4, 5, 6, 7, 8, 9, 10, 11, 13],
    Garuffa: [2, 5, 6, 8, 9, 11],
    "Mezza garuffa": [2, 5, 6, 8, 9, 11],
    Gancio: [2, 4, 5, 6, 7, 8, 9, 10],
    Parabola: [2, 4, 5, 6, 7, 8, 9, 10],
    "Tre sponde di calcio": [2, 4, 5, 6, 7, 8, 9, 10, 11],
    "Cinque sponde di calcio": [2, 4, 5, 6, 7, 8, 9, 10, 11],
  };
  let associatedShots = 0;
  let preferredRealizations = 0;

  for (let gameId = 1000; gameId < 1040; gameId += 1) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers({
        gameId,
        specialty: "ITALIANA" as const,
        winnerSide: "PLAYER_ONE" as const,
        playerOneScore: 80,
        playerTwoScore: 65,
      })
    );

    for (const shot of chronicle) {
      const scores = preferredScores[shot.shotName];

      if (shot.points === 0 || shot.playerSide !== shot.scoringSide || !scores) {
        continue;
      }

      associatedShots += 1;
      if (scores.includes(shot.points)) preferredRealizations += 1;
    }
  }

  assert.ok(associatedShots > 500);
  assert.ok(preferredRealizations / associatedShots >= 0.9);
});

test("usa completo e preso per metà soltanto ogni tanto", () => {
  let labeledShots = 0;
  let totalShots = 0;

  for (let gameId = 1040; gameId < 1080; gameId += 1) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers({
        gameId,
        specialty: "ITALIANA" as const,
        winnerSide: "PLAYER_TWO" as const,
        playerOneScore: 68,
        playerTwoScore: 80,
      })
    );

    totalShots += chronicle.length;
    labeledShots += chronicle.filter((shot) =>
      /Tiro completo|Tiro preso per metà/.test(shot.commentary)
    ).length;
  }

  assert.ok(labeledShots > 0);
  assert.ok(labeledShots / totalShots < 0.15);
});

test("calcola falli e pallino dell'Italiana soltanto con valori pari", () => {
  const weakPlayer = createPlayer(1, 5);
  let fouls = 0;
  let foulsWithPallino = 0;

  for (let gameId = 1080; gameId < 1180; gameId += 1) {
    const chronicle = buildIndividualGameChronicle({
      ...withChroniclePlayers({
        gameId,
        specialty: "ITALIANA" as const,
        winnerSide: "PLAYER_ONE" as const,
        playerOneScore: 80,
        playerTwoScore: 65,
      }),
      playerTwo: weakPlayer,
    });

    for (const shot of chronicle.filter((item) => item.outcome === "FOUL")) {
      fouls += 1;
      assert.equal(shot.points % 2, 0);
      assert.doesNotMatch(shot.commentary, /3 punti del pallino/);

      if (shot.commentary.includes("pallino")) {
        foulsWithPallino += 1;
        assert.match(shot.commentary, /2 punti per il pallino/);
      }
    }
  }

  assert.ok(fouls > 20);
  assert.ok(foulsWithPallino > 0);
});

test("limita i realizzi dei tiri dell'Italiana a una sola passata", () => {
  const onePassShots = new Set([
    "Raddrizzo",
    "Rovescio",
    "Traversino piano",
    "Giro",
    "Girone",
    "Angolo di prima",
    "Angolo di seconda",
    "Striscio",
    "Candela",
    "Sponda-biglia",
    "Bricolla",
    "Garuffa",
    "Mezza garuffa",
    "Gancio",
    "Parabola",
    "Tre sponde di calcio",
    "Cinque sponde di calcio",
  ]);
  let sixPointSinglePasses = 0;
  let garuffaShots = 0;

  for (let gameId = 1180; gameId < 1280; gameId += 1) {
    const chronicle = buildIndividualGameChronicle(
      withChroniclePlayers({
        gameId,
        specialty: "ITALIANA" as const,
        winnerSide: "PLAYER_ONE" as const,
        playerOneScore: 80,
        playerTwoScore: 67,
      })
    );

    for (const shot of chronicle) {
      if (onePassShots.has(shot.shotName)) {
        assert.notEqual(shot.points, 15);
        assert.notEqual(shot.points, 16);
        assert.doesNotMatch(shot.commentary, /cadono tre laterali/);
        assert.doesNotMatch(shot.commentary, /attraversa tutto il castello/);
        assert.doesNotMatch(shot.commentary, /punti per \d+ punti/);
      }

      if (
        (shot.shotName === "Gancio" ||
          shot.shotName === "Tre sponde di calcio") &&
        shot.points === 6 &&
        shot.playerSide === shot.scoringSide
      ) {
        sixPointSinglePasses += 1;
        assert.match(
          shot.commentary,
          /rosso cade insieme a un birillo laterale|pallino/
        );
      }

      if (
        shot.shotName === "Garuffa" ||
        shot.shotName === "Mezza garuffa"
      ) {
        garuffaShots += 1;
        assert.ok(shot.points <= 12);
      }
    }
  }

  assert.ok(sixPointSinglePasses > 0);
  assert.ok(garuffaShots > 50);
});

test("racconta il tiro decisivo senza lasciare aperta la partita", () => {
  const chronicle = buildIndividualGameChronicle({
    ...withChroniclePlayers({
      gameId: 1300,
      specialty: "ITALIANA" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 80,
      playerTwoScore: 72,
    }),
    playerOneName: "Mario Rossi",
    playerTwoName: "Luca Bianchi",
  });
  const finalShot = chronicle.at(-1)!;

  assert.equal(finalShot.highlight, "WINNER");
  assert.match(finalShot.commentary, /Mario Rossi/);
  assert.match(finalShot.commentary, /tiro della chiusura/);
  assert.match(finalShot.commentary, /partita termina qui/);
  assert.doesNotMatch(
    finalShot.commentary,
    /replica possibile|partita ancora apertissima|cambio al comando/
  );
});

test("seleziona da venti a venticinque momenti chiave", () => {
  const chronicle = buildIndividualGameChronicle(
    withChroniclePlayers({
      gameId: 1301,
      specialty: "GORIZIANA" as const,
      winnerSide: "PLAYER_TWO" as const,
      playerOneScore: 336,
      playerTwoScore: 400,
    })
  );
  const highlights = selectIndividualChronicleHighlights({
    chronicle,
    gameId: 1301,
  });

  assert.ok(highlights.length >= 20);
  assert.ok(highlights.length <= 25);
  assert.equal(highlights.at(-1)!.order, chronicle.at(-1)!.order);
  assert.equal(highlights.at(-1)!.highlight, "WINNER");

  for (let index = 1; index < highlights.length; index += 1) {
    assert.ok(highlights[index - 1].order < highlights[index].order);
  }
});

test("trasforma i momenti chiave in una telecronaca che segue la partita", () => {
  const chronicle = buildIndividualGameChronicle({
    ...withChroniclePlayers({
      gameId: 1447,
      specialty: "ITALIANA" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 80,
      playerTwoScore: 74,
    }),
    playerOneName: "Andrea Quarta",
    playerTwoName: "Matteo Gualemi",
  });
  const broadcast = buildIndividualGameBroadcast({
    chronicle,
    gameId: 1447,
    specialty: "ITALIANA",
    playerOneName: "Andrea Quarta",
    playerTwoName: "Matteo Gualemi",
  });
  const fullStory = broadcast.map((shot) => shot.commentary).join(" ");
  const sentenceOpenings = new Set(
    broadcast.map((shot) => shot.commentary.split(".")[0])
  );
  const finalMoment = broadcast.at(-1)!;

  assert.ok(broadcast.length >= 20);
  assert.ok(broadcast.length <= 25);
  assert.ok(broadcast.every((shot) => shot.technicalCommentary.length > 0));
  assert.match(fullStory, /Andrea Quarta/);
  assert.match(fullStory, /Matteo Gualemi/);
  assert.ok(sentenceOpenings.size >= 10);
  assert.equal(finalMoment.highlight, "WINNER");
  assert.match(finalMoment.commentary, /Andrea Quarta/);
  assert.match(
    finalMoment.commentary,
    /ce l'ha fatta|punto che vale la partita|sentenza finale/
  );
  assert.doesNotMatch(
    finalMoment.commentary,
    /replica possibile|partita ancora apertissima|cambio al comando/
  );
});

test("costruisce presentazione ed epilogo in più righe", () => {
  const chronicle = buildIndividualGameChronicle({
    ...withChroniclePlayers({
      gameId: 1302,
      specialty: "TUTTI_DOPPI" as const,
      winnerSide: "PLAYER_ONE" as const,
      playerOneScore: 600,
      playerTwoScore: 488,
    }),
    playerOneName: "Mario Rossi",
    playerTwoName: "Luca Bianchi",
  });
  const introduction = buildIndividualGameIntroduction({
    venue: "La Sala Centrale · Tavolo 1",
    tournamentName: "Torneo Tutti Doppi",
    stageLabel: "Semifinale",
    specialty: "TUTTI_DOPPI",
    playerOneName: "Mario Rossi",
    playerTwoName: "Luca Bianchi",
    playerOneRanking: 4,
    playerTwoRanking: 11,
    playerOneOverall: 88,
    playerTwoOverall: 85,
  });
  const closing = buildIndividualGameClosing({
    chronicle,
    specialty: "TUTTI_DOPPI",
    winnerSide: "PLAYER_ONE",
    playerOneName: "Mario Rossi",
    playerTwoName: "Luca Bianchi",
    gameOrder: 1,
  });

  assert.equal(introduction.length, 6);
  assert.equal(closing.length, 6);
  assert.match(introduction.join(" "), /Mario Rossi/);
  assert.match(introduction.join(" "), /numero 4 del ranking/);
  assert.match(introduction.join(" "), /Sala Centrale/);
  assert.match(closing.join(" "), /Mario Rossi/);
  assert.match(closing.join(" "), /600–488/);
});

function createPlayer(id: number, rating: number): IndividualMatchPlayer {
  return {
    id,
    precisione: rating,
    diretto: rating,
    sponde: rating,
    tattica: rating,
    mentalita: rating,
    difesa: rating,
    realizzazione: rating,
    creativita: rating,
    misura: rating,
    form: 5,
    morale: 5,
    experience: 0,
  };
}

function withChroniclePlayers<
  T extends {
    gameId: number;
    specialty: "ITALIANA" | "GORIZIANA" | "TUTTI_DOPPI";
    winnerSide: "PLAYER_ONE" | "PLAYER_TWO";
    playerOneScore: number;
    playerTwoScore: number;
  },
>(game: T) {
  return {
    ...game,
    playerOnePerformanceRating: 72,
    playerTwoPerformanceRating: 76,
    playerOne: createPlayer(1, 72),
    playerTwo: createPlayer(2, 76),
  };
}
