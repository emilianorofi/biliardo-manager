import {
  ArrowLeft,
  BarChart3,
  CircleDot,
  Medal,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentClubId } from "@/lib/current-club";
import { INDIVIDUAL_MATCH_STAGES } from "@/lib/individual-tournament-calendar";
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
  const [clubId, match] = await Promise.all([
    getCurrentClubId(),
    prisma.individualTournamentMatch.findFirst({
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
            nationality: true,
            clubId: true,
          },
        },
        playerTwo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nationality: true,
            clubId: true,
          },
        },
        games: {
          orderBy: {
            order: "asc",
          },
        },
      },
    }),
  ]);

  if (!match || !match.playerOne || !match.playerTwo) {
    notFound();
  }

  const playerOne = match.playerOne;
  const playerTwo = match.playerTwo;
  const reconstructed = match.games.some((game) => game.reconstructed);

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
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              {match.tournament.season.name} · {formatStage(match.stage)}
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">
              Incontro {match.position}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {match.tournament.name} · {formatDateTime(match.playedAt ?? match.scheduledAt)}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
              Risultato finale
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {match.playerOneWins}–{match.playerTwoWins}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-2">
        <PlayerSummary
          player={playerOne}
          score={match.playerOneWins}
          winner={match.winnerPlayerId === playerOne.id}
          managed={playerOne.clubId === clubId}
          returnQuery={playerReturnQuery}
        />
        <PlayerSummary
          player={playerTwo}
          score={match.playerTwoWins}
          winner={match.winnerPlayerId === playerTwo.id}
          managed={playerTwo.clubId === clubId}
          returnQuery={playerReturnQuery}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col justify-between gap-2 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" />
              <h2 className="text-lg font-black text-white">Dettaglio prove</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Specialità, vincitore e valutazione della prestazione.
            </p>
          </div>

          {reconstructed && (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-amber-300">
              Storico ricostruito
            </span>
          )}
        </div>

        {match.games.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {match.games.map((game) => {
              const playerOneWon = game.winnerSide === "PLAYER_ONE";

              return (
                <article
                  key={game.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[110px_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"
                >
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                      Prova {game.order}
                    </p>
                    <p className="mt-1 text-xs font-black text-amber-300">
                      {formatSpecialty(game.specialty)}
                    </p>
                  </div>

                  <PerformanceValue
                    name={`${playerOne.firstName} ${playerOne.lastName}`}
                    rating={game.playerOnePerformanceRating}
                    winner={playerOneWon}
                    align="right"
                  />

                  <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-[10px] font-black text-zinc-600 md:flex">
                    VS
                  </div>

                  <PerformanceValue
                    name={`${playerTwo.firstName} ${playerTwo.lastName}`}
                    rating={game.playerTwoPerformanceRating}
                    winner={!playerOneWon}
                  />
                </article>
              );
            })}
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

type MatchPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  clubId: number | null;
};

function PlayerSummary({
  player,
  score,
  winner,
  managed,
  returnQuery,
}: {
  player: MatchPlayer;
  score: number;
  winner: boolean;
  managed: boolean;
  returnQuery: string;
}) {
  return (
    <article
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
        managed
          ? "border-amber-400/30 bg-amber-400/5"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            winner
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {winner ? <Trophy size={21} /> : <Medal size={21} />}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
            {winner ? "Vincitore" : "Sconfitto"}
          </p>
          <Link
            href={`/players/${player.id}?${returnQuery}`}
            className="mt-1 block truncate font-black text-white transition hover:text-amber-200"
          >
            {player.nationality} {player.firstName} {player.lastName}
          </Link>
        </div>
      </div>

      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-black ${
          winner
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-zinc-800 text-zinc-500"
        }`}
      >
        {score}
      </span>
    </article>
  );
}

function PerformanceValue({
  name,
  rating,
  winner,
  align = "left",
}: {
  name: string;
  rating: number;
  winner: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "md:text-right" : ""}>
      <p
        className={`truncate text-xs font-black ${
          winner ? "text-emerald-300" : "text-zinc-400"
        }`}
      >
        {name}
      </p>
      <p className="mt-1 text-[10px] text-zinc-600">
        Prestazione {rating.toFixed(2)}
      </p>
    </div>
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
