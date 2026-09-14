export type FixtureStoryGame = {
  order: number;
  specialty: string;
  gameType: string;
  winnerSide: string;
  homePoints: number;
  awayPoints: number;
  playerPerformances: Array<{
    appearance: {
      side: string;
      playerFirstName: string;
      playerLastName: string;
    };
  }>;
};

export type FixtureStoryPassage = {
  title: string;
  label: string;
  score: string;
  text: string;
};

type FixtureSide = "HOME" | "AWAY";

type ScoreMoment = {
  game: FixtureStoryGame;
  winnerSide: FixtureSide;
  home: number;
  away: number;
};

export function buildFixtureStory({
  homeName,
  awayName,
  homeScore,
  awayScore,
  games,
}: {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  games: FixtureStoryGame[];
}) {
  let runningHomeScore = 0;
  let runningAwayScore = 0;
  const scoreTimeline: ScoreMoment[] = [];

  const passages: FixtureStoryPassage[] = games.map((game) => {
    const beforeHomeScore = runningHomeScore;
    const beforeAwayScore = runningAwayScore;
    const winnerSide: FixtureSide =
      game.winnerSide === "HOME" ? "HOME" : "AWAY";
    const homePlayers = getSideNames(game, "HOME");
    const awayPlayers = getSideNames(game, "AWAY");
    const winnerPlayers = getSideNames(game, winnerSide);
    const winnerIsPair = getSidePlayerCount(game, winnerSide) > 1;
    const winningClub = winnerSide === "HOME" ? homeName : awayName;

    if (winnerSide === "HOME") runningHomeScore += 1;
    else runningAwayScore += 1;

    scoreTimeline.push({
      game,
      winnerSide,
      home: runningHomeScore,
      away: runningAwayScore,
    });

    const storyContext = {
      game,
      totalGames: games.length,
      homePlayers,
      awayPlayers,
      winnerPlayers,
      winnerIsPair,
      winningClub,
      homeName,
      awayName,
      winnerSide,
      beforeHomeScore,
      beforeAwayScore,
      runningHomeScore,
      runningAwayScore,
    };

    return {
      title: buildPassageTitle(storyContext),
      label: `Prova ${game.order} · ${formatGameType(game.gameType)} · ${formatSpecialty(game.specialty)}`,
      score: `${runningHomeScore}–${runningAwayScore}`,
      text: buildPassageText(storyContext),
    };
  });

  return {
    passages,
    closing: buildClosingStory({
      homeName,
      awayName,
      homeScore,
      awayScore,
      scoreTimeline,
    }),
  };
}

type PassageContext = {
  game: FixtureStoryGame;
  totalGames: number;
  homePlayers: string;
  awayPlayers: string;
  winnerPlayers: string;
  winnerIsPair: boolean;
  winningClub: string;
  homeName: string;
  awayName: string;
  winnerSide: FixtureSide;
  beforeHomeScore: number;
  beforeAwayScore: number;
  runningHomeScore: number;
  runningAwayScore: number;
};

function buildPassageTitle(context: PassageContext) {
  const {
    game,
    totalGames,
    winnerPlayers,
    winnerIsPair,
    winnerSide,
    beforeHomeScore,
    beforeAwayScore,
    runningHomeScore,
    runningAwayScore,
  } = context;
  const finalGame = game.order === totalGames;
  const scoreIsTied = runningHomeScore === runningAwayScore;
  const scoreWasTied = beforeHomeScore === beforeAwayScore;
  const winnerWasLeading =
    winnerSide === "HOME"
      ? beforeHomeScore > beforeAwayScore
      : beforeAwayScore > beforeHomeScore;
  const finalGameWinnerWonFixture =
    winnerSide === "HOME"
      ? runningHomeScore > runningAwayScore
      : runningAwayScore > runningHomeScore;

  if (game.order === 1) {
    return `${winnerPlayers} ${agree(winnerIsPair, "accende", "accendono")} la sfida`;
  }
  if (finalGame && scoreIsTied) {
    return `${winnerPlayers} ${agree(winnerIsPair, "salva", "salvano")} il pareggio`;
  }
  if (scoreIsTied) {
    return `${winnerPlayers} ${agree(winnerIsPair, "rimette", "rimettono")} tutto in equilibrio`;
  }
  if (finalGame && finalGameWinnerWonFixture) {
    return `${winnerPlayers} ${agree(winnerIsPair, "mette", "mettono")} il sigillo`;
  }
  if (finalGame) {
    return `${winnerPlayers} ${agree(winnerIsPair, "firma", "firmano")} l'ultimo punto`;
  }
  if (scoreWasTied) {
    return `${winnerPlayers} ${agree(winnerIsPair, "prende", "prendono")} il comando`;
  }
  if (winnerWasLeading) {
    return `${winnerPlayers} ${agree(winnerIsPair, "prova", "provano")} la fuga`;
  }
  return `${winnerPlayers} ${agree(winnerIsPair, "tiene", "tengono")} viva la sfida`;
}

function buildPassageText(context: PassageContext) {
  const {
    game,
    totalGames,
    homePlayers,
    awayPlayers,
    homeName,
    awayName,
    winnerPlayers,
    winnerIsPair,
    winningClub,
    winnerSide,
    beforeHomeScore,
    beforeAwayScore,
    runningHomeScore,
    runningAwayScore,
  } = context;
  const loserSide: FixtureSide = winnerSide === "HOME" ? "AWAY" : "HOME";
  const loserPlayers = winnerSide === "HOME" ? awayPlayers : homePlayers;
  const loserIsPair = getSidePlayerCount(game, loserSide) > 1;
  const winningPoints =
    winnerSide === "HOME" ? game.homePoints : game.awayPoints;
  const losingPoints =
    winnerSide === "HOME" ? game.awayPoints : game.homePoints;
  const beforeScore = `${beforeHomeScore}–${beforeAwayScore}`;
  const currentScore = `${runningHomeScore}–${runningAwayScore}`;
  const finalGame = game.order === totalGames;
  const scoreIsTied = runningHomeScore === runningAwayScore;
  const scoreWasTied = beforeHomeScore === beforeAwayScore;
  const winnerWasLeading =
    winnerSide === "HOME"
      ? beforeHomeScore > beforeAwayScore
      : beforeAwayScore > beforeHomeScore;
  const finalGameWinnerWonFixture =
    winnerSide === "HOME"
      ? runningHomeScore > runningAwayScore
      : runningAwayScore > runningHomeScore;

  const opening = buildPassageOpening({
    game,
    homePlayers,
    awayPlayers,
    homeName,
    awayName,
    beforeScore,
  });
  const performance = buildPerformanceStory({
    game,
    winnerPlayers,
    loserPlayers,
    winnerIsPair,
    loserIsPair,
    winningPoints,
    losingPoints,
  });

  let consequence: string;
  if (finalGame && scoreIsTied) {
    consequence = `${winningClub} trova così il ${currentScore} proprio sull'ultimo tavolo: una risposta che salva il pareggio.`;
  } else if (scoreIsTied) {
    consequence = `La risposta vale il ${currentScore}: l'incontro torna in equilibrio e ricomincia da capo.`;
  } else if (finalGame && finalGameWinnerWonFixture) {
    consequence = `È il punto che consegna a ${winningClub} l'incontro per ${currentScore}.`;
  } else if (finalGame) {
    consequence = `${winningClub} si prende l'ultima prova, ma il ${currentScore} lascia l'incontro a ${winnerSide === "HOME" ? awayName : homeName}.`;
  } else if (game.order === 1) {
    consequence = `Il primo segnale della serata è di ${winningClub}, che scatta sul ${currentScore}.`;
  } else if (scoreWasTied) {
    consequence = `${winningClub} mette il naso avanti e porta il confronto sul ${currentScore}.`;
  } else if (winnerWasLeading) {
    consequence = `${winningClub} allunga sul ${currentScore} e prova a far scappare l'incontro.`;
  } else {
    consequence = `${winningClub} accorcia sul ${currentScore} e tiene aperto il confronto.`;
  }

  return `${opening} ${performance} ${consequence}`;
}

function buildPassageOpening({
  game,
  homePlayers,
  awayPlayers,
  homeName,
  awayName,
  beforeScore,
}: {
  game: FixtureStoryGame;
  homePlayers: string;
  awayPlayers: string;
  homeName: string;
  awayName: string;
  beforeScore: string;
}) {
  const specialty = formatSpecialty(game.specialty);

  if (game.order === 1) {
    return `La serata si apre con ${homeName} che schiera ${homePlayers}; dall'altra parte ${awayName} risponde con ${awayPlayers}. Sono loro a rompere il ghiaccio nella prova di ${specialty}.`;
  }
  if (game.order === 2) {
    return `Dopo il primo punto, ${homeName} si affida a ${homePlayers}; ${awayName} manda al tavolo ${awayPlayers}.`;
  }
  if (game.order === 3) {
    return `Sul ${beforeScore} la sfida entra nel vivo: ${homePlayers} e ${awayPlayers} si prendono il tavolo per la prova di ${specialty}.`;
  }
  if (game.order === 4) {
    return `La quarta prova può cambiare l'inerzia della serata. ${homeName} punta su ${homePlayers}, mentre ${awayName} risponde con ${awayPlayers}.`;
  }
  if (game.order === 5) {
    return `Si entra nel tratto finale sul ${beforeScore}: ${homePlayers} e ${awayPlayers} aprono le prove di ${specialty}.`;
  }
  return `Tutto passa dall'ultima prova. Sul ${beforeScore}, ${homeName} sceglie ${homePlayers} e ${awayName} risponde con ${awayPlayers}.`;
}

function buildPerformanceStory({
  game,
  winnerPlayers,
  loserPlayers,
  winnerIsPair,
  loserIsPair,
  winningPoints,
  losingPoints,
}: {
  game: FixtureStoryGame;
  winnerPlayers: string;
  loserPlayers: string;
  winnerIsPair: boolean;
  loserIsPair: boolean;
  winningPoints: number;
  losingPoints: number;
}) {
  const marginRatio = (winningPoints - losingPoints) / getSpecialtyTarget(game.specialty);
  const result = `${winningPoints}–${losingPoints}`;

  if (marginRatio <= 0.12) {
    return `La partita resta in bilico fino in fondo; ${winnerPlayers} ${agree(winnerIsPair, "trova", "trovano")} la freddezza necessaria e ${agree(winnerIsPair, "chiude", "chiudono")} ${result}.`;
  }
  if (marginRatio <= 0.3) {
    return `${loserPlayers} ${agree(loserIsPair, "resta", "restano")} in corsa, ma ${winnerPlayers} ${agree(winnerIsPair, "cambia", "cambiano")} passo nel momento giusto e ${agree(winnerIsPair, "chiude", "chiudono")} ${result}.`;
  }
  return `${winnerPlayers} ${agree(winnerIsPair, "prende", "prendono")} progressivamente il controllo e non ${agree(winnerIsPair, "lascia", "lasciano")} spazio alla rimonta: ${result}.`;
}

function buildClosingStory({
  homeName,
  awayName,
  homeScore,
  awayScore,
  scoreTimeline,
}: {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  scoreTimeline: ScoreMoment[];
}) {
  const homeLed = scoreTimeline.some((moment) => moment.home > moment.away);
  const awayLed = scoreTimeline.some((moment) => moment.away > moment.home);
  const finalMoment = scoreTimeline.at(-1);

  if (homeScore === awayScore) {
    const lastWinnerNames = finalMoment
      ? getSideNames(finalMoment.game, finalMoment.winnerSide)
      : "I protagonisti dell'ultima prova";
    const lastWinnerIsPair = finalMoment
      ? getSidePlayerCount(finalMoment.game, finalMoment.winnerSide) > 1
      : true;
    const flow =
      homeLed && awayLed
        ? "Il comando cambia mano, ma nessuno riesce a trattenerlo fino in fondo."
        : `${homeLed ? homeName : awayName} prova a far scappare l'incontro, ma ${homeLed ? awayName : homeName} non lo lascia andare.`;

    return `${flow} ${lastWinnerNames} ${agree(lastWinnerIsPair, "trova", "trovano")} il punto del ${homeScore}–${awayScore} nell'ultima prova e ${agree(lastWinnerIsPair, "completa", "completano")} la rimonta. Un pareggio che racconta bene una serata combattuta, rimasta viva fino all'ultimo tavolo.`;
  }

  const winningSide: FixtureSide = homeScore > awayScore ? "HOME" : "AWAY";
  const winningName = winningSide === "HOME" ? homeName : awayName;
  const losingName = winningSide === "HOME" ? awayName : homeName;
  const winnerTrailed = scoreTimeline.some((moment) =>
    winningSide === "HOME" ? moment.home < moment.away : moment.away < moment.home
  );
  const decisiveMoment = scoreTimeline.find((moment) =>
    winningSide === "HOME" ? moment.home === 4 : moment.away === 4
  );
  const decisiveNames = decisiveMoment
    ? getSideNames(decisiveMoment.game, winningSide)
    : winningName;
  const decisiveIsPair = decisiveMoment
    ? getSidePlayerCount(decisiveMoment.game, winningSide) > 1
    : false;
  const pathToVictory = winnerTrailed
    ? "capace di reagire quando l'incontro sembrava girare dall'altra parte"
    : "capace di costruire il vantaggio senza perdere il controllo della serata";

  return `Il ${homeScore}–${awayScore} premia ${winningName}, ${pathToVictory}. La svolta definitiva arriva nella prova ${decisiveMoment?.game.order ?? scoreTimeline.length}: ${decisiveNames} ${agree(decisiveIsPair, "porta", "portano")} il quarto punto e ${agree(decisiveIsPair, "rende", "rendono")} il vantaggio irraggiungibile. ${losingName} lotta fino alla fine, ma deve lasciare l'incontro agli avversari.`;
}

function getSideNames(game: FixtureStoryGame, side: FixtureSide) {
  const names = game.playerPerformances
    .filter((performance) => performance.appearance.side === side)
    .map(
      (performance) =>
        `${performance.appearance.playerFirstName} ${performance.appearance.playerLastName}`
    );

  return names.length > 0 ? names.join(" e ") : "Formazione non disponibile";
}

function getSidePlayerCount(game: FixtureStoryGame, side: FixtureSide) {
  return game.playerPerformances.filter(
    (performance) => performance.appearance.side === side
  ).length;
}

function agree(isPlural: boolean, singular: string, plural: string) {
  return isPlural ? plural : singular;
}

function getSpecialtyTarget(specialty: string) {
  if (specialty === "ITALIANA") return 80;
  if (specialty === "GORIZIANA") return 400;
  if (specialty === "TUTTI_DOPPI") return 600;
  return 100;
}

function formatGameType(gameType: string) {
  return gameType === "SINGLES" ? "Singolo" : "Coppia";
}

function formatSpecialty(specialty: string) {
  if (specialty === "ITALIANA") return "Italiana";
  if (specialty === "GORIZIANA") return "Goriziana";
  if (specialty === "TUTTI_DOPPI") return "Tutti Doppi";
  return specialty;
}
