import { getCurrentClubId } from "@/lib/current-club";
import { getNextPlayableRound } from "@/lib/league-round";
import { createLeagueTable } from "@/lib/league-table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LeagueSelector from "./LeagueSelector";

export const dynamic = "force-dynamic";

type CampionatoPageProps = {
  searchParams: Promise<{
    league?: string | string[];
  }>;
};

export default async function CampionatoPage({
  searchParams,
}: CampionatoPageProps) {
  const clubId = await getCurrentClubId();
  const managedLeague = await prisma.league.findFirst({
    where: {
      status: {
        in: ["PREPARATION", "ACTIVE", "COMPLETED"],
      },
      entries: {
        some: {
          clubId,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      seasonId: true,
    },
  });

  if (!managedLeague) {
    return (
      <main className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-100">
        <h1 className="text-2xl font-black text-white">
          Campionato non disponibile
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          La tua squadra non è ancora iscritta a un campionato.
        </p>
      </main>
    );
  }

  const availableLeagues = await prisma.league.findMany({
    where: {
      seasonId: managedLeague.seasonId,
      status: {
        in: ["PREPARATION", "ACTIVE", "COMPLETED"],
      },
    },
    orderBy: [
      { level: "asc" },
      { groupCode: "asc" },
    ],
    select: {
      id: true,
      name: true,
      level: true,
      groupCode: true,
    },
  });
  const requestedLeagueValue = (await searchParams).league;
  const requestedLeagueId = Number.parseInt(
    Array.isArray(requestedLeagueValue)
      ? (requestedLeagueValue[0] ?? "")
      : (requestedLeagueValue ?? ""),
    10
  );
  const selectedLeagueId = availableLeagues.some(
    (candidate) => candidate.id === requestedLeagueId
  )
    ? requestedLeagueId
    : managedLeague.id;
  const league = await prisma.league.findUnique({
    where: {
      id: selectedLeagueId,
    },
    include: {
      season: true,
      entries: {
        include: {
          club: {
            select: {
              id: true,
              name: true,
              shortName: true,
              city: true,
            },
          },
        },
      },
      fixtures: {
        orderBy: [
          {
            round: "asc",
          },
          {
            id: "asc",
          },
        ],
        include: {
          homeClub: {
            select: {
              id: true,
              name: true,
              shortName: true,
              city: true,
            },
          },
          awayClub: {
            select: {
              id: true,
              name: true,
              shortName: true,
              city: true,
            },
          },
        },
      },
    },
  });

  if (!league) {
    return (
      <main className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-100">
        <h1 className="text-2xl font-black text-white">
          Campionato non disponibile
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Non esiste ancora un campionato da mostrare.
        </p>
      </main>
    );
  }

  const totalRounds = league.fixtures.reduce(
    (highestRound, fixture) => Math.max(highestRound, fixture.round),
    0
  );

  const nextPlayableRound =
    totalRounds === 0
      ? null
      : getNextPlayableRound(league.currentRound, totalRounds);

  const displayedRound =
    nextPlayableRound ?? (totalRounds > 0 ? totalRounds : null);

  const currentFixtures =
    displayedRound === null
      ? []
      : league.fixtures.filter(
          (fixture) => fixture.round === displayedRound
        );

  const isManagedLeague = league.id === managedLeague.id;
  const recentClubFixtures = league.fixtures
    .filter(
      (fixture) =>
        fixture.status === "PLAYED" &&
        (!isManagedLeague ||
          fixture.homeClub.id === clubId ||
          fixture.awayClub.id === clubId)
    )
    .sort(
      (first, second) =>
        second.round - first.round ||
        second.scheduledAt.getTime() - first.scheduledAt.getTime()
    )
    .slice(0, 3);

  const playedRounds = Array.from(
    new Set(
      league.fixtures
        .filter((fixture) => fixture.status === "PLAYED")
        .map((fixture) => fixture.round)
    )
  ).sort((first, second) => second - first);

  const table = createLeagueTable(
    league.entries.map((entry) => ({
      clubId: entry.clubId,
      clubName: entry.club.name,
      played: entry.played,
      won: entry.won,
      drawn: entry.drawn,
      lost: entry.lost,
      pointsFor: entry.pointsFor,
      pointsAgainst: entry.pointsAgainst,
      points: entry.points,
    }))
  );

  const statusLabel =
    league.status === "ACTIVE"
      ? "In corso"
      : league.status === "COMPLETED"
        ? "Concluso"
        : "Preparazione";

  return (
    <main className="space-y-4 text-zinc-100">
      <header className="relative overflow-hidden rounded-2xl border border-emerald-900/60 bg-[linear-gradient(135deg,#183129_0%,#12231d_68%,#101e19_100%)] px-5 py-4 shadow-lg shadow-black/10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              Competizione ufficiale
            </p>

            <h1 className="mt-1 text-3xl font-black text-white">
              {league.name}
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              {league.season.name} · {statusLabel}
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <LeagueSelector
              leagues={availableLeagues}
              selectedLeagueId={league.id}
              managedLeagueId={managedLeague.id}
            />

            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 lg:text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                {league.status === "COMPLETED"
                  ? "Stagione"
                  : "Prossimo turno"}
              </p>

              <p className="mt-1 text-lg font-black text-amber-300">
                {league.status === "COMPLETED"
                  ? "Campionato concluso"
                  : displayedRound === null
                    ? "Da definire"
                    : `Giornata ${displayedRound}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.82fr)_minmax(0,1.45fr)]">
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                Calendario
              </p>

              <h2 className="mt-0.5 text-lg font-black text-white">
                {displayedRound === null
                  ? "Nessuna giornata"
                  : league.status === "COMPLETED"
                    ? `Ultima giornata · ${displayedRound}`
                    : `Giornata ${displayedRound}`}
              </h2>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {currentFixtures.map((fixture) => (
              <FixtureRow
                key={fixture.id}
                fixture={fixture}
                currentClubId={clubId}
              />
            ))}

            {currentFixtures.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                Nessun incontro disponibile.
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 bg-zinc-950/20">
            <div className="px-4 py-2">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Ultimi risultati
              </p>
            </div>

            <div className="divide-y divide-zinc-800 border-t border-zinc-800">
              {recentClubFixtures.map((fixture) => (
                <RecentResultRow
                  key={`recent-${fixture.id}`}
                  fixture={fixture}
                  currentClubId={clubId}
                />
              ))}

              {recentClubFixtures.length === 0 && (
                <p className="px-4 py-4 text-xs text-zinc-500">
                  Nessun risultato precedente.
                </p>
              )}
            </div>

            <details className="group border-t border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[11px] font-bold text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200">
                Consulta tutti i risultati
                <span className="text-base text-zinc-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="max-h-[32rem] overflow-y-auto border-t border-zinc-800 bg-zinc-950/25">
                {playedRounds.map((round) => (
                  <div key={round}>
                    <p className="border-b border-zinc-800 bg-zinc-950/40 px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                      Giornata {round}
                    </p>

                    <div className="divide-y divide-zinc-800">
                      {league.fixtures
                        .filter(
                          (fixture) =>
                            fixture.round === round &&
                            fixture.status === "PLAYED"
                        )
                        .map((fixture) => (
                          <FixtureRow
                            key={`history-${fixture.id}`}
                            fixture={fixture}
                            currentClubId={clubId}
                          />
                        ))}
                    </div>
                  </div>
                ))}

                {playedRounds.length === 0 && (
                  <p className="px-4 py-5 text-center text-xs text-zinc-500">
                    Il campionato non ha ancora risultati.
                  </p>
                )}
              </div>
            </details>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                Posizioni
              </p>

              <h2 className="mt-0.5 text-lg font-black text-white">
                Classifica
              </h2>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-xs">
              <thead className="bg-zinc-950/45 text-[9px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-center">Pos.</th>
                  <th className="px-3 py-2 text-left">Squadra</th>
                  <th className="px-2 py-2 text-center">G</th>
                  <th className="px-2 py-2 text-center">V</th>
                  <th className="px-2 py-2 text-center">N</th>
                  <th className="px-2 py-2 text-center">P</th>
                  <th className="px-2 py-2 text-center">PF–PS</th>
                  <th className="px-2 py-2 text-center">Diff.</th>
                  <th className="px-3 py-2 text-center">Punti</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {table.map((entry) => {
                  const isCurrentClub = entry.clubId === clubId;

                  return (
                    <tr
                      key={entry.clubId}
                      className={`transition hover:bg-white/[0.03] ${
                        isCurrentClub ? "bg-emerald-500/10" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black ${
                            entry.position === 1
                              ? "bg-amber-400 text-[#122018]"
                              : isCurrentClub
                                ? "bg-emerald-500 text-white"
                                : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {entry.position}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <p
                          className={`truncate font-bold ${
                            isCurrentClub ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {entry.clubName}
                        </p>
                      </td>

                      <td className="px-2 py-2 text-center text-zinc-300">{entry.played}</td>
                      <td className="px-2 py-2 text-center text-zinc-300">{entry.won}</td>
                      <td className="px-2 py-2 text-center text-zinc-300">{entry.drawn}</td>
                      <td className="px-2 py-2 text-center text-zinc-300">{entry.lost}</td>
                      <td className="px-2 py-2 text-center text-zinc-400">
                        {entry.pointsFor}–{entry.pointsAgainst}
                      </td>
                      <td className="px-2 py-2 text-center text-zinc-400">
                        {entry.pointsDifference > 0
                          ? `+${entry.pointsDifference}`
                          : entry.pointsDifference}
                      </td>
                      <td className="px-3 py-2 text-center text-sm font-black text-amber-300">
                        {entry.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

type Fixture = {
  id: number;
  status: string;
  scheduledAt: Date;
  homeScore: number | null;
  awayScore: number | null;
  homeClub: {
    id: number;
    name: string;
    shortName: string;
    city: string;
  };
  awayClub: {
    id: number;
    name: string;
    shortName: string;
    city: string;
  };
};

function FixtureRow({
  fixture,
  currentClubId,
}: {
  fixture: Fixture;
  currentClubId: number;
}) {
  const homeIsCurrent = fixture.homeClub.id === currentClubId;
  const awayIsCurrent = fixture.awayClub.id === currentClubId;

  return (
    <article
      className={`px-4 py-3 ${
        homeIsCurrent || awayIsCurrent ? "bg-emerald-500/5" : ""
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center gap-2">
        <ClubName
          name={fixture.homeClub.name}
          shortName={fixture.homeClub.shortName}
          isCurrent={homeIsCurrent}
        />

        <div className="text-center">
          {fixture.status === "PLAYED" ? (
            <p className="text-xl font-black text-amber-300">
              {fixture.homeScore} – {fixture.awayScore}
            </p>
          ) : (
            <p className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[9px] font-bold uppercase text-zinc-400">
              Da giocare
            </p>
          )}

          <p className="mt-1 text-[9px] text-zinc-600">
            {formatFixtureDate(fixture.scheduledAt)}
          </p>
        </div>

        <ClubName
          name={fixture.awayClub.name}
          shortName={fixture.awayClub.shortName}
          isCurrent={awayIsCurrent}
          align="right"
        />
      </div>

      {fixture.status === "PLAYED" && (
        <div className="mt-2 flex justify-center">
          <Link
            href={`/campionato/incontri/${fixture.id}`}
            className="text-[10px] font-black uppercase tracking-wider text-amber-300 transition hover:text-amber-200"
          >
            Apri il referto →
          </Link>
        </div>
      )}
    </article>
  );
}

function ClubName({
  name,
  shortName,
  isCurrent,
  align = "left",
}: {
  name: string;
  shortName: string;
  isCurrent: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <p
        className={`truncate text-xs font-bold ${
          isCurrent ? "text-emerald-300" : "text-white"
        }`}
      >
        {name}
      </p>

      <p className="mt-0.5 text-[9px] uppercase tracking-wide text-zinc-600">
        {shortName}
      </p>
    </div>
  );
}

function RecentResultRow({
  fixture,
  currentClubId,
}: {
  fixture: Fixture;
  currentClubId: number;
}) {
  const homeIsCurrent = fixture.homeClub.id === currentClubId;
  const awayIsCurrent = fixture.awayClub.id === currentClubId;

  return (
    <article className="px-4 py-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center gap-2">
        <p
          className={`truncate text-[11px] font-semibold ${
            homeIsCurrent ? "text-emerald-400/80" : "text-zinc-400"
          }`}
        >
          {fixture.homeClub.name}
        </p>

        <div className="text-center">
          <p className="text-xl font-black leading-none text-amber-300">
            {fixture.homeScore} – {fixture.awayScore}
          </p>

          <p className="mt-1 text-[8px] text-zinc-600">
            {formatFixtureDate(fixture.scheduledAt)}
          </p>
        </div>

        <p
          className={`truncate text-right text-[11px] font-semibold ${
            awayIsCurrent ? "text-emerald-400/80" : "text-zinc-400"
          }`}
        >
          {fixture.awayClub.name}
        </p>
      </div>

      <div className="mt-2 text-center">
        <Link
          href={`/campionato/incontri/${fixture.id}`}
          className="text-[9px] font-black uppercase tracking-wider text-amber-300/80 transition hover:text-amber-200"
        >
          Referto completo →
        </Link>
      </div>
    </article>
  );
}

function formatFixtureDate(date: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(date);
}
