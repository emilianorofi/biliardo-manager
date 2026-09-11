import { ArrowLeft, ChevronDown, CircleDot, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  buildIndividualGameClosing,
  buildIndividualGameBroadcast,
  buildIndividualGameChronicle,
  buildIndividualGameIntroduction,
} from "@/lib/individual-game-chronicle";
import { INDIVIDUAL_MATCH_STAGES } from "@/lib/individual-tournament-calendar";
import type { MatchSpecialty } from "@/lib/match-engine";
import { prisma } from "@/lib/prisma";
import { ROME_TIME_ZONE } from "@/lib/rome-calendar";

export const dynamic = "force-dynamic";

type IndividualMatchDetailPageProps = {
  params: Promise<{
    round: string;
    matchId: string;
  }>;
  searchParams: Promise<{
    stage?: string | string[];
  }>;
};

export default async function IndividualMatchDetailPage({
  params,
  searchParams,
}: IndividualMatchDetailPageProps) {
  const [{ round, matchId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const leagueRound = Number.parseInt(round, 10);
  const individualMatchId = Number.parseInt(matchId, 10);

  if (!Number.isInteger(leagueRound) || !Number.isInteger(individualMatchId)) {
    notFound();
  }

  const stageValue = Array.isArray(query.stage) ? query.stage[0] : query.stage;
  const backHref = `/individuale/${leagueRound}${
    stageValue ? `?stage=${stageValue}` : ""
  }`;
  const playerReturnQuery =
    `from=individuale&round=${leagueRound}${
      stageValue ? `&stage=${stageValue}` : ""
    }`;
  const match = await prisma.individualTournamentMatch.findFirst({
    where: {
      id: individualMatchId,
      tournament: {
        leagueRound,
        season: {
          status: {
            in: ["PREPARATION", "ACTIVE", "COMPLETED"],
          },
        },
      },
    },
    include: {
      tournament: {
        include: {
          season: {
            select: {
              name: true,
            },
          },
          entries: {
            select: {
              playerId: true,
              rankingAtDraw: true,
              overallAtDraw: true,
            },
          },
        },
      },
      playerOne: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          precisione: true,
          diretto: true,
          sponde: true,
          tattica: true,
          mentalita: true,
          difesa: true,
          realizzazione: true,
          creativita: true,
          misura: true,
          form: true,
          morale: true,
          experience: true,
        },
      },
      playerTwo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          precisione: true,
          diretto: true,
          sponde: true,
          tattica: true,
          mentalita: true,
          difesa: true,
          realizzazione: true,
          creativita: true,
          misura: true,
          form: true,
          morale: true,
          experience: true,
        },
      },
      games: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!match || !match.playerOne || !match.playerTwo) {
    notFound();
  }

  const playerOne = match.playerOne;
  const playerTwo = match.playerTwo;
  const playerOneName = `${playerOne.firstName} ${playerOne.lastName}`;
  const playerTwoName = `${playerTwo.firstName} ${playerTwo.lastName}`;
  const playerOneEntry = match.tournament.entries.find(
    (entry) => entry.playerId === playerOne.id
  );
  const playerTwoEntry = match.tournament.entries.find(
    (entry) => entry.playerId === playerTwo.id
  );
  const venue = getIndividualVenue(match.id);

  return (
    <main className="space-y-4 text-zinc-100">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-amber-300"
      >
        <ArrowLeft size={15} />
        Torna al tabellone
      </Link>

      <header className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[linear-gradient(135deg,#293127_0%,#16271f_60%,#101d18_100%)] px-5 py-5">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                {match.tournament.season.name} · {formatStage(match.stage)}
              </p>
              <h1 className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xl font-black text-white sm:text-3xl">
                <Link
                  href={`/players/${playerOne.id}?${playerReturnQuery}`}
                  className="transition hover:text-amber-200"
                >
                  {playerOne.firstName} {playerOne.lastName}
                </Link>
                <span className="text-base font-bold text-zinc-500">
                  contro
                </span>
                <Link
                  href={`/players/${playerTwo.id}?${playerReturnQuery}`}
                  className="transition hover:text-amber-200"
                >
                  {playerTwo.firstName} {playerTwo.lastName}
                </Link>
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Incontro {match.position} · {match.tournament.name} ·{" "}
                {formatDateTime(match.playedAt ?? match.scheduledAt)}
              </p>
            </div>

            <div className="shrink-0 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                Risultato finale
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {match.playerOneWins}–{match.playerTwoWins}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <CircleDot size={18} className="text-emerald-400" />
              <h2 className="text-lg font-black text-white">Partite</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Seleziona una partita per leggere presentazione, momenti chiave ed
              epilogo.
            </p>
          </div>
        </div>

        {match.games.length > 0 ? (
          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center gap-3 border-b border-zinc-800 bg-zinc-950/40 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_130px_minmax(0,1fr)]">
              <Link
                href={`/players/${playerOne.id}?${playerReturnQuery}`}
                className="truncate text-right text-xs font-black text-white transition hover:text-amber-200 sm:text-sm"
              >
                {playerOne.firstName} {playerOne.lastName}
              </Link>
              <p className="text-center text-[9px] font-black uppercase tracking-wider text-zinc-600">
                contro
              </p>
              <Link
                href={`/players/${playerTwo.id}?${playerReturnQuery}`}
                className="truncate text-xs font-black text-white transition hover:text-amber-200 sm:text-sm"
              >
                {playerTwo.firstName} {playerTwo.lastName}
              </Link>
            </div>

            <div className="divide-y divide-zinc-800">
              {match.games.map((game) => {
                const playerOneWon = game.winnerSide === "PLAYER_ONE";
                const previousGames = match.games.filter(
                  (candidate) => candidate.order < game.order
                );
                const gamesThroughCurrent = match.games.filter(
                  (candidate) => candidate.order <= game.order
                );
                const playerOneWinsBefore = previousGames.filter(
                  (candidate) => candidate.winnerSide === "PLAYER_ONE"
                ).length;
                const playerTwoWinsBefore = previousGames.filter(
                  (candidate) => candidate.winnerSide === "PLAYER_TWO"
                ).length;
                const playerOneWinsAfter = gamesThroughCurrent.filter(
                  (candidate) => candidate.winnerSide === "PLAYER_ONE"
                ).length;
                const playerTwoWinsAfter = gamesThroughCurrent.filter(
                  (candidate) => candidate.winnerSide === "PLAYER_TWO"
                ).length;
                const isDecisiveGame =
                  playerOneWinsAfter === 2 || playerTwoWinsAfter === 2;
                const isTournamentFinal = match.stage === "FINAL";
                const chronicle = buildIndividualGameChronicle({
                  gameId: game.id,
                  specialty: game.specialty as MatchSpecialty,
                  winnerSide: playerOneWon ? "PLAYER_ONE" : "PLAYER_TWO",
                  playerOneScore: game.playerOneScore,
                  playerTwoScore: game.playerTwoScore,
                  playerOnePerformanceRating:
                    game.playerOnePerformanceRating,
                  playerTwoPerformanceRating:
                    game.playerTwoPerformanceRating,
                  playerOne,
                  playerTwo,
                  playerOneName,
                  playerTwoName,
                });
                const winnerSide = playerOneWon
                  ? "PLAYER_ONE"
                  : "PLAYER_TWO";
                const introduction = buildIndividualGameIntroduction({
                  gameId: game.id,
                  gameOrder: game.order,
                  matchPlayerOneWinsBefore: playerOneWinsBefore,
                  matchPlayerTwoWinsBefore: playerTwoWinsBefore,
                  isTournamentFinal,
                  venue,
                  tournamentName: match.tournament.name,
                  stageLabel: formatStage(match.stage),
                  specialty: game.specialty as MatchSpecialty,
                  playerOneName,
                  playerTwoName,
                  playerOneRanking: playerOneEntry?.rankingAtDraw,
                  playerTwoRanking: playerTwoEntry?.rankingAtDraw,
                  playerOneOverall: playerOneEntry?.overallAtDraw,
                  playerTwoOverall: playerTwoEntry?.overallAtDraw,
                  playerOne,
                  playerTwo,
                });
                const featuredChronicle = buildIndividualGameBroadcast({
                  chronicle,
                  gameId: game.id,
                  specialty: game.specialty as MatchSpecialty,
                  playerOneName,
                  playerTwoName,
                  playerOne,
                  playerTwo,
                  playerOnePerformanceRating:
                    game.playerOnePerformanceRating,
                  playerTwoPerformanceRating:
                    game.playerTwoPerformanceRating,
                  gameOrder: game.order,
                  matchPlayerOneWins: playerOneWinsAfter,
                  matchPlayerTwoWins: playerTwoWinsAfter,
                  isDecisiveGame,
                  isTournamentFinal,
                });
                const closing = buildIndividualGameClosing({
                  chronicle,
                  specialty: game.specialty as MatchSpecialty,
                  winnerSide,
                  playerOneName,
                  playerTwoName,
                  gameOrder: game.order,
                  matchPlayerOneWins: playerOneWinsAfter,
                  matchPlayerTwoWins: playerTwoWinsAfter,
                  isDecisiveGame,
                  isTournamentFinal,
                  tournamentName: match.tournament.name,
                });
                const closingTitle = isDecisiveGame
                  ? isTournamentFinal
                    ? "Il campione"
                    : "Verdetto dell'incontro"
                  : `Verso la partita ${game.order + 1}`;

                return (
                  <details key={game.id} className="group">
                    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center gap-3 px-4 py-4 marker:content-none sm:grid-cols-[minmax(0,1fr)_130px_minmax(0,1fr)] [&::-webkit-details-marker]:hidden">
                      <p
                        className={`whitespace-nowrap text-right text-3xl font-black tabular-nums ${
                          playerOneWon ? "text-emerald-300" : "text-zinc-500"
                        }`}
                      >
                        {game.playerOneScore}
                      </p>

                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          Partita {game.order}
                        </p>
                        <p className="mt-1 text-[10px] font-black text-amber-300 sm:text-xs">
                          {formatSpecialty(game.specialty)}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500">
                          Incontro {playerOneWinsAfter}–{playerTwoWinsAfter}
                          <ChevronDown
                            size={12}
                            className="transition group-open:rotate-180"
                          />
                        </span>
                      </div>

                      <p
                        className={`whitespace-nowrap text-3xl font-black tabular-nums ${
                          playerOneWon ? "text-zinc-500" : "text-emerald-300"
                        }`}
                      >
                        {game.playerTwoScore}
                      </p>
                    </summary>

                    <div className="border-t border-zinc-800 bg-zinc-950/35 px-3 pb-4 pt-3 sm:px-4">
                      <div className="mb-4 rounded-xl border border-amber-400/15 bg-amber-300/[0.04] px-4 py-3">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">
                          <Sparkles aria-hidden="true" size={14} />
                          Presentazione
                        </div>
                        <div className="mt-2 space-y-1.5 text-sm font-medium leading-relaxed text-zinc-300">
                          {introduction.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 flex items-end justify-between gap-3 px-1">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                            Il racconto
                          </p>
                          <p className="mt-1 text-sm font-black text-white">
                            La storia della partita
                          </p>
                        </div>
                        <p className="text-right text-[10px] font-bold text-zinc-600">
                          {featuredChronicle.length} passaggi
                        </p>
                      </div>

                      <ol className="space-y-4">
                        {featuredChronicle.map((shot) => {
                          const isPlayerOne =
                            shot.playerSide === "PLAYER_ONE";
                          const isFinalShot = shot.highlight === "WINNER";
                          const playerName = isPlayerOne
                            ? `${playerOne.firstName} ${playerOne.lastName}`
                            : `${playerTwo.firstName} ${playerTwo.lastName}`;
                          const pointsAwardedToOpponent =
                            shot.playerSide !== shot.scoringSide;
                          const scoringPlayerName =
                            shot.scoringSide === "PLAYER_ONE"
                              ? `${playerOne.firstName} ${playerOne.lastName}`
                              : `${playerTwo.firstName} ${playerTwo.lastName}`;

                          return (
                            <li key={shot.order}>
                              <article
                                className={`rounded-xl border px-4 py-4 ${
                                  isFinalShot
                                    ? "border-emerald-400/30 bg-emerald-300/[0.07]"
                                    : shot.showShotDetail &&
                                        (shot.highlight === "LEAD_CHANGE" ||
                                          shot.highlight === "BIG_SHOT")
                                      ? "border-amber-400/20 bg-amber-300/[0.04]"
                                      : "border-zinc-800 bg-zinc-900/35"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p
                                      className={`text-sm font-black sm:text-base ${
                                        isFinalShot
                                          ? "text-emerald-300"
                                          : shot.showShotDetail &&
                                              (shot.highlight === "LEAD_CHANGE" ||
                                                shot.highlight === "BIG_SHOT")
                                            ? "text-amber-200"
                                            : "text-zinc-200"
                                      }`}
                                    >
                                      {shot.storyTitle ?? "La partita continua"}
                                    </p>
                                    <p
                                      className={`mt-1 text-[10px] font-black tabular-nums ${
                                        isFinalShot
                                          ? "text-emerald-200"
                                          : "text-zinc-500"
                                      }`}
                                    >
                                      {shot.playerOneTotal}–{shot.playerTwoTotal}
                                    </p>
                                    {shot.showShotDetail ? (
                                      <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-emerald-400/70">
                                        {pointsAwardedToOpponent
                                          ? `Errore di ${playerName}`
                                          : playerName}{" "}
                                        · {shot.shotName}
                                      </p>
                                    ) : null}
                                  </div>
                                  {shot.showShotDetail ? (
                                    <span
                                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black tabular-nums ${
                                        shot.points > 0
                                          ? "border-amber-400/20 bg-amber-300/[0.06] text-amber-300"
                                          : "border-zinc-800 text-zinc-600"
                                      }`}
                                    >
                                      {shot.points > 0 ? (
                                        <>
                                          +{shot.points}
                                          {pointsAwardedToOpponent ? (
                                            <span className="ml-1 text-[8px] leading-tight text-rose-300/80">
                                              a {scoringPlayerName}
                                            </span>
                                          ) : null}
                                        </>
                                      ) : (
                                        "0"
                                      )}
                                    </span>
                                  ) : null}
                                </div>

                                <p className="mt-3 text-sm font-medium leading-7 text-zinc-300">
                                  {shot.commentary}
                                </p>
                              </article>
                            </li>
                          );
                        })}
                      </ol>

                      <div
                        className={`mt-4 rounded-xl border px-4 py-3 ${
                          isTournamentFinal && isDecisiveGame
                            ? "border-amber-400/25 bg-amber-300/[0.06]"
                            : isDecisiveGame
                              ? "border-emerald-400/15 bg-emerald-300/[0.04]"
                              : "border-sky-400/15 bg-sky-300/[0.04]"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] ${
                            isTournamentFinal && isDecisiveGame
                              ? "text-amber-300"
                              : isDecisiveGame
                                ? "text-emerald-300"
                                : "text-sky-300"
                          }`}
                        >
                          <Sparkles aria-hidden="true" size={14} />
                          {closingTitle}
                        </div>
                        <div className="mt-2 space-y-1.5 text-sm font-medium leading-relaxed text-zinc-300">
                          {closing.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <CircleDot className="mx-auto text-zinc-700" size={30} />
            <p className="mt-3 font-bold text-white">
              Dettaglio non disponibile
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Le singole prove non sono ancora state registrate.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function formatStage(value: string) {
  return (
    INDIVIDUAL_MATCH_STAGES.find((stage) => stage.key === value)?.label ??
    value
  );
}

function formatSpecialty(value: string) {
  if (value === "TUTTI_DOPPI") return "Tutti Doppi";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getIndividualVenue(matchId: number) {
  const venues = [
    "La Sala Centrale · Tavolo 1",
    "La Sala Federale · Tavolo 2",
    "L'Arena del Circuito · Tavolo 3",
    "La Sala Verde · Tavolo 4",
    "La Sala Masters · Tavolo 5",
  ];

  return venues[Math.abs(matchId) % venues.length];
}
