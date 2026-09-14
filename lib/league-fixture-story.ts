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

  const passages: FixtureStoryPassage[] = games.map((game) => {
    const homePlayers = getSideNames(game, "HOME");
    const awayPlayers = getSideNames(game, "AWAY");
    const homeWon = game.winnerSide === "HOME";
    const winnerPlayers = homeWon ? homePlayers : awayPlayers;
    const winningClub = homeWon ? homeName : awayName;

    if (homeWon) runningHomeScore += 1;
    else runningAwayScore += 1;

    return {
      title: `Il punto di ${winnerPlayers}`,
      label: `Prova ${game.order} · ${formatGameType(game.gameType)} · ${formatSpecialty(game.specialty)}`,
      score: `${runningHomeScore}–${runningAwayScore}`,
      text: `${homePlayers} contro ${awayPlayers}. Vittoria ${game.homePoints}–${game.awayPoints} per ${winnerPlayers}: il punto va a ${winningClub} e il risultato dell'incontro diventa ${runningHomeScore}–${runningAwayScore}.`,
    };
  });

  const finalGame = games.at(-1);
  const lastWinnerNames = finalGame
    ? getSideNames(finalGame, finalGame.winnerSide === "HOME" ? "HOME" : "AWAY")
    : null;
  const closing =
    homeScore === awayScore
      ? `Dopo tutte le sei prove, ${homeName} e ${awayName} chiudono sul ${homeScore}–${awayScore}. ${lastWinnerNames ?? "I protagonisti dell'ultima prova"} firma l'ultimo punto e completa un incontro nel quale nessuna delle due squadre riesce a prendere definitivamente il comando.`
      : `${homeScore > awayScore ? homeName : awayName} vince l'incontro ${homeScore}–${awayScore}. Le sei prove raccontano il successo attraverso i giocatori che hanno conquistato ogni punto, fino al verdetto definitivo.`;

  return { passages, closing };
}

function getSideNames(game: FixtureStoryGame, side: "HOME" | "AWAY") {
  const names = game.playerPerformances
    .filter((performance) => performance.appearance.side === side)
    .map(
      (performance) =>
        `${performance.appearance.playerFirstName} ${performance.appearance.playerLastName}`
    );

  return names.length > 0 ? names.join(" e ") : "Formazione non disponibile";
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
