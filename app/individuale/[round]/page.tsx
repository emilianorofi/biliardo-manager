import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Medal,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";

import { getCurrentClubId } from "@/lib/current-club";
import {
  INDIVIDUAL_MATCH_STAGES,
  INDIVIDUAL_TOURNAMENT_DEFINITIONS,
} from "@/lib/individual-tournament-calendar";
import { prisma } from "@/lib/prisma";
import { ROME_TIME_ZONE } from "@/lib/rome-calendar";

export const dynamic = "force-dynamic";

type IndividualBracketPageProps = {
  params: Promise<{
    round: string;
  }>;
  searchParams: Promise<{
    stage?: string | string[];
  }>;
};

export default async function IndividualBracketPage({
  params,
  searchParams,
}: IndividualBracketPageProps) {
  const leagueRound = Number.parseInt((await params).round, 10);
  const definition = INDIVIDUAL_TOURNAMENT_DEFINITIONS.find(
    (tournament) => tournament.leagueRound === leagueRound
  );

  if (!definition) {
    notFound();
  }

  const [clubId, season] = await Promise.all([
    getCurrentClubId(),
    prisma.season.findFirst({
      where: {
        status: {
          in: ["PREPARATION", "ACTIVE", "COMPLETED"],
        },
      },
      orderBy: {
        number: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!season) {
    notFound();
  }

  const tournament = await prisma.individualTournament.findUnique({
    where: {
      seasonId_leagueRound: {
        seasonId: season.id,
        leagueRound,
      },
    },
    include: {
      championPlayer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nationality: true,
          age: true,
          clubId: true,
        },
      },
      entries: {
        select: {
          playerId: true,
          rankingAtDraw: true,
          overallAtDraw: true,
          drawPosition: true,
        },
      },
      matches: {
        orderBy: [
          { stageOrder: "asc" },
          { position: "asc" },
        ],
        include: {
          playerOne: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationality: true,
              age: true,
              clubId: true,
            },
          },
          playerTwo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationality: true,
              age: true,
              clubId: true,
            },
          },
        },
      },
    },
  });

  if (!tournament) {
    return (
      <BracketPending
        tournamentName={definition.name}
        seasonName={season.name}
      />
    );
  }

  const availableStageKeys = new Set(
    tournament.matches.map((match) => match.stage)
  );
  const requestedStageValue = (await searchParams).stage;
  const requestedStage = Array.isArray(requestedStageValue)
    ? requestedStageValue[0]
    : requestedStageValue;
  const fallbackStage =
    [...INDIVIDUAL_MATCH_STAGES]
      .reverse()
      .find((stage) => availableStageKeys.has(stage.key))?.key ??
    "ROUND_OF_256";
  const selectedStage = availableStageKeys.has(requestedStage ?? "")
    ? requestedStage!
    : fallbackStage;
  const selectedStageDefinition = INDIVIDUAL_MATCH_STAGES.find(
    (stage) => stage.key === selectedStage
  );
  const selectedMatches = tournament.matches.filter(
    (match) => match.stage === selectedStage
  );
  const entryByPlayerId = new Map(
    tournament.entries.map((entry) => [entry.playerId, entry])
  );
  const playedMatches = tournament.matches.filter(
    (match) =>
      match.status === "PLAYED" ||
      match.status === "WALKOVER"
  ).length;

  return (
    <main className="space-y-4 text-zinc-100">
      <Link
        href="/individuale"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-amber-300"
      >
        <ArrowLeft size={15} />
        Torna al calendario individuale
      </Link>

      <header className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[linear-gradient(135deg,#293127_0%,#16271f_60%,#101d18_100%)] px-5 py-5">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              {season.name} · Giornata {leagueRound}
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">
              {tournament.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Tabellone a eliminazione diretta · {tournament.specialty}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
            <HeaderStat label="Partecipanti" value={tournament.entries.length} />
            <HeaderStat label="Incontri giocati" value={playedMatches} />
            <HeaderStat
              label="Stato"
              value={formatTournamentStatus(tournament.status)}
              highlight
            />
          </div>
        </div>
      </header>

      {tournament.championPlayer && (
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Link href={`/players/${tournament.championPlayer.id}`}>
              <PlayerPortrait player={tournament.championPlayer} className="aspect-[2/3] w-24" />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Campione
              </p>
              <Link href={`/players/${tournament.championPlayer.id}`} className="mt-1 block text-lg font-black text-white transition hover:text-amber-200 hover:underline">
                {tournament.championPlayer.nationality} {tournament.championPlayer.firstName} {tournament.championPlayer.lastName}
              </Link>
            </div>
          </div>

          <Link
            href={`/players/${tournament.championPlayer.id}`}
            className="inline-flex items-center gap-1 text-xs font-black text-amber-300 hover:text-amber-200"
          >
            Scheda giocatore <ChevronRight size={15} />
          </Link>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <Medal size={18} className="text-emerald-400" />
            <h2 className="text-lg font-black text-white">Tabellone</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Seleziona un turno per consultare tutti gli accoppiamenti.
          </p>
        </div>

        <div className="overflow-x-auto border-b border-zinc-800 bg-zinc-950/20 p-3">
          <div className="flex min-w-max gap-2">
            {INDIVIDUAL_MATCH_STAGES.map((stage) => {
              const matches = tournament.matches.filter(
                (match) => match.stage === stage.key
              );
              const available = matches.length > 0;
              const active = stage.key === selectedStage;

              return available ? (
                <Link
                  key={stage.key}
                  href={`/individuale/${leagueRound}?stage=${stage.key}`}
                  className={`rounded-xl border px-3 py-2 transition ${
                    active
                      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-emerald-500/30 hover:text-white"
                  }`}
                >
                  <p className="text-xs font-black">{stage.label}</p>
                  <p className="mt-0.5 text-[9px] opacity-60">
                    {matches.length} incontri
                  </p>
                </Link>
              ) : (
                <div
                  key={stage.key}
                  className="cursor-not-allowed rounded-xl border border-zinc-800/70 px-3 py-2 text-zinc-700"
                >
                  <p className="text-xs font-black">{stage.label}</p>
                  <p className="mt-0.5 text-[9px]">Da definire</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
              Turno selezionato
            </p>
            <h3 className="mt-1 font-black text-white">
              {selectedStageDefinition?.label ?? selectedStage}
            </h3>
          </div>

          {selectedMatches[0] && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CalendarDays size={14} />
              {formatDateTime(selectedMatches[0].scheduledAt)}
            </div>
          )}
        </div>

        {selectedMatches.length > 0 ? (
          <div className="grid gap-2 p-4 lg:grid-cols-2 2xl:grid-cols-3">
            {selectedMatches.map((match) => (
              <BracketMatchCard
                key={match.id}
                match={match}
                playerOneEntry={
                  match.playerOneId
                    ? entryByPlayerId.get(match.playerOneId)
                    : undefined
                }
                playerTwoEntry={
                  match.playerTwoId
                    ? entryByPlayerId.get(match.playerTwoId)
                    : undefined
                }
                currentClubId={clubId}
                leagueRound={leagueRound}
                selectedStage={selectedStage}
              />
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Clock3 className="mx-auto text-zinc-700" size={32} />
            <p className="mt-3 font-bold text-white">Turno non ancora definito</p>
            <p className="mt-1 text-sm text-zinc-500">
              Gli accoppiamenti appariranno dopo il turno precedente.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function BracketPending({
  tournamentName,
  seasonName,
}: {
  tournamentName: string;
  seasonName: string;
}) {
  return (
    <main className="space-y-4 text-zinc-100">
      <Link
        href="/individuale"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300"
      >
        <ArrowLeft size={15} />
        Torna al calendario individuale
      </Link>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-14 text-center">
        <Clock3 className="mx-auto text-amber-300" size={36} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-emerald-400">
          {seasonName}
        </p>
        <h1 className="mt-2 text-2xl font-black text-white">
          {tournamentName}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
          Il tabellone verrà pubblicato automaticamente con il sorteggio del
          sabato alle 10:00.
        </p>
      </section>
    </main>
  );
}

type BracketPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  age: number;
  clubId: number | null;
};

type BracketMatch = {
  id: number;
  position: number;
  status: string;
  scheduledAt: Date;
  playerOneId: number | null;
  playerTwoId: number | null;
  winnerPlayerId: number | null;
  playerOneWins: number;
  playerTwoWins: number;
  playerOne: BracketPlayer | null;
  playerTwo: BracketPlayer | null;
};

type BracketEntry = {
  rankingAtDraw: number;
  overallAtDraw: number;
  drawPosition: number;
};

function BracketMatchCard({
  match,
  playerOneEntry,
  playerTwoEntry,
  currentClubId,
  leagueRound,
  selectedStage,
}: {
  match: BracketMatch;
  playerOneEntry?: BracketEntry;
  playerTwoEntry?: BracketEntry;
  currentClubId: number;
  leagueRound: number;
  selectedStage: string;
}) {
  const playerReturnQuery =
    `from=individuale&round=${leagueRound}&stage=${selectedStage}`;
  const concluded =
    match.status === "PLAYED" || match.status === "WALKOVER";
  const statusLabel =
    match.status === "WALKOVER"
      ? "Passaggio del turno"
      : match.status === "PLAYED"
        ? "Concluso"
        : formatTime(match.scheduledAt);

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/25">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
          Incontro {match.position}
        </span>
        <span
          className={`text-[9px] font-black uppercase tracking-wider ${
            concluded ? "text-emerald-400" : "text-amber-300"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="divide-y divide-zinc-800">
        <BracketPlayerRow
          player={match.playerOne}
          entry={playerOneEntry}
          score={match.playerOneWins}
          winner={
            match.winnerPlayerId !== null &&
            match.winnerPlayerId === match.playerOneId
          }
          vacant={match.status === "WALKOVER" && !match.playerOne}
          currentClubId={currentClubId}
          returnQuery={playerReturnQuery}
        />
        <BracketPlayerRow
          player={match.playerTwo}
          entry={playerTwoEntry}
          score={match.playerTwoWins}
          winner={
            match.winnerPlayerId !== null &&
            match.winnerPlayerId === match.playerTwoId
          }
          vacant={match.status === "WALKOVER" && !match.playerTwo}
          currentClubId={currentClubId}
          returnQuery={playerReturnQuery}
        />
      </div>

      {match.status === "PLAYED" && (
        <Link
          href={`/individuale/${leagueRound}/incontri/${match.id}?stage=${selectedStage}`}
          className="flex items-center justify-center gap-1 border-t border-zinc-800 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-400/5 hover:text-amber-200"
        >
          Dettagli incontro <ChevronRight size={13} />
        </Link>
      )}
    </article>
  );
}

function BracketPlayerRow({
  player,
  entry,
  score,
  winner,
  vacant,
  currentClubId,
  returnQuery,
}: {
  player: BracketPlayer | null;
  entry?: BracketEntry;
  score: number;
  winner: boolean;
  vacant: boolean;
  currentClubId: number;
  returnQuery: string;
}) {
  const managedPlayer = player?.clubId === currentClubId;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2.5 ${
        managedPlayer ? "bg-amber-400/5" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {player ? (
          <Link href={`/players/${player.id}?${returnQuery}`} aria-label={`Apri la scheda di ${player.firstName} ${player.lastName}`}>
            <PlayerPortrait player={player} className="aspect-[2/3] w-11 shrink-0" />
          </Link>
        ) : <span className="w-11 text-center text-sm">·</span>}
        <div className="min-w-0">
          {player ? (
            <Link
              href={`/players/${player.id}?${returnQuery}`}
              className={`block truncate text-xs font-black transition hover:text-amber-200 ${
                winner ? "text-emerald-300" : "text-zinc-300"
              }`}
            >
              {player.firstName} {player.lastName}
            </Link>
          ) : (
            <p className="truncate text-xs font-black text-zinc-300">
              {vacant ? "Posto vacante" : "Da definire"}
            </p>
          )}
          {entry && (
            <p className="mt-0.5 text-[9px] text-zinc-600">
              Ranking #{entry.rankingAtDraw} · OVR {Math.round(entry.overallAtDraw)}
            </p>
          )}
        </div>
      </div>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
          winner
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-zinc-800 text-zinc-500"
        }`}
      >
        {score}
      </span>
    </div>
  );
}

function HeaderStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-black ${
          highlight ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatTournamentStatus(status: string) {
  if (status === "COMPLETED") return "Concluso";
  if (status === "IN_PROGRESS") return "In corso";
  if (status === "DRAWN") return "Sorteggiato";
  return "Programmato";
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

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
