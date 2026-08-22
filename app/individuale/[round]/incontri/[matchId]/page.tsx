import { ArrowLeft, ChevronDown, CircleDot, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  buildIndividualGameChronicle,
  buildIndividualGameSummary,
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
        },
      },
      playerOne: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      playerTwo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
              Seleziona una partita per leggere la cronaca tiro per tiro.
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
                const chronicle = buildIndividualGameChronicle({
                  gameId: game.id,
                  specialty: game.specialty as MatchSpecialty,
                  winnerSide: playerOneWon ? "PLAYER_ONE" : "PLAYER_TWO",
                  playerOneScore: game.playerOneScore,
                  playerTwoScore: game.playerTwoScore,
                });
                const winnerSide = playerOneWon
                  ? "PLAYER_ONE"
                  : "PLAYER_TWO";
                const winnerName = playerOneWon
                  ? `${playerOne.firstName} ${playerOne.lastName}`
                  : `${playerTwo.firstName} ${playerTwo.lastName}`;
                const gameSummary = buildIndividualGameSummary({
                  chronicle,
                  winnerSide,
                  winnerName,
                  specialty: game.specialty as MatchSpecialty,
                });

                return (
                  <details key={game.id} className="group">
                    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center gap-3 px-4 py-4 marker:content-none sm:grid-cols-[minmax(0,1fr)_130px_minmax(0,1fr)] [&::-webkit-details-marker]:hidden">
                      <p
                        className={`text-right text-3xl font-black tabular-nums ${
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
                          Cronaca
                          <ChevronDown
                            size={12}
                            className="transition group-open:rotate-180"
                          />
                        </span>
                      </div>

                      <p
                        className={`text-3xl font-black tabular-nums ${
                          playerOneWon ? "text-zinc-500" : "text-emerald-300"
                        }`}
                      >
                        {game.playerTwoScore}
                      </p>
                    </summary>

                    <div className="border-t border-zinc-800 bg-zinc-950/35 px-3 pb-4 pt-3 sm:px-4">
                      <div className="mb-4 rounded-xl border border-amber-400/15 bg-amber-300/[0.04] px-4 py-3">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">
                          <Sparkles size={14} />
                          La partita in breve
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-300">
                          {gameSummary}
                        </p>
                      </div>

                      <div className="grid grid-cols-[52px_minmax(0,1fr)_48px_72px] gap-2 border-b border-zinc-800 px-2 pb-2 text-[9px] font-black uppercase tracking-wider text-zinc-600 sm:grid-cols-[70px_minmax(0,1fr)_70px_96px] sm:gap-3">
                        <span>Tiro</span>
                        <span>Cronaca</span>
                        <span className="text-right">Punti</span>
                        <span className="text-right">Parziale</span>
                      </div>

                      <ol className="divide-y divide-zinc-800/70">
                        {chronicle.map((shot, shotIndex) => {
                          const isPlayerOne =
                            shot.playerSide === "PLAYER_ONE";
                          const isFinalShot =
                            shotIndex === chronicle.length - 1;
                          const playerName = isPlayerOne
                            ? `${playerOne.firstName} ${playerOne.lastName}`
                            : `${playerTwo.firstName} ${playerTwo.lastName}`;

                          const previousPhase =
                            chronicle[shotIndex - 1]?.phase;
                          const startsNewPhase =
                            previousPhase !== shot.phase;

                          return (
                            <li key={shot.order}>
                              {startsNewPhase ? (
                                <div className="border-b border-zinc-800/70 bg-zinc-900/60 px-2 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400/70">
                                  {formatChroniclePhase(shot.phase)}
                                </div>
                              ) : null}

                              <div className="grid grid-cols-[52px_minmax(0,1fr)_48px_72px] items-start gap-2 px-2 py-3 text-xs sm:grid-cols-[70px_minmax(0,1fr)_70px_96px] sm:gap-3 sm:text-sm">
                                <span className="pt-0.5 font-bold text-zinc-600">
                                  {shot.order}
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className={`font-black ${
                                      isFinalShot
                                        ? "text-emerald-300"
                                        : shot.highlight === "LEAD_CHANGE" ||
                                            shot.highlight === "BIG_SHOT"
                                          ? "text-amber-200"
                                          : "text-zinc-300"
                                    }`}
                                  >
                                    {playerName}
                                  </p>
                                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-zinc-500 sm:text-xs">
                                    {shot.commentary}
                                  </p>
                                </div>
                                <span
                                  className={`pt-0.5 text-right font-black tabular-nums ${
                                    shot.points > 0
                                      ? "text-amber-300"
                                      : "text-zinc-600"
                                  }`}
                                >
                                  {shot.points > 0 ? `+${shot.points}` : "0"}
                                </span>
                                <span
                                  className={`pt-0.5 text-right font-black tabular-nums ${
                                    isFinalShot ? "text-white" : "text-zinc-400"
                                  }`}
                                >
                                  {shot.playerOneTotal}–{shot.playerTwoTotal}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
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

function formatChroniclePhase(value: "OPENING" | "MIDDLE" | "FINISH") {
  if (value === "OPENING") return "Avvio";
  if (value === "MIDDLE") return "Fase centrale";
  return "Finale";
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