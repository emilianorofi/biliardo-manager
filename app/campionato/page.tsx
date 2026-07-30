import Link from "next/link";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

import {
  createLeagueTable,
} from "@/lib/league-table";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export default async function CampionatoPage() {
  const league =
    await prisma.league.findFirst({
      where: {
        status: {
          in: [
            "PREPARATION",
            "ACTIVE",
            "COMPLETED",
          ],
        },
      },

      orderBy: {
        id: "desc",
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
      <main className="min-h-screen bg-[#0a0a0a] px-4 py-10 text-zinc-100">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="text-sm font-medium text-[#d4af37] hover:text-[#f0c14b]"
          >
            ← Torna alla home
          </Link>

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#111111] p-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              Campionato non disponibile
            </h1>

            <p className="mt-3 text-zinc-400">
              Non esiste ancora un campionato da mostrare.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const totalRounds =
    league.fixtures.reduce(
      (
        highestRound,
        fixture
      ) =>
        Math.max(
          highestRound,
          fixture.round
        ),
      0
    );

  const nextPlayableRound =
    totalRounds === 0
      ? null
      : getNextPlayableRound(
          league.currentRound,
          totalRounds
        );

  const currentFixtures =
    nextPlayableRound === null
      ? []
      : league.fixtures.filter(
          (fixture) =>
            fixture.round ===
            nextPlayableRound
        );

  const table =
    createLeagueTable(
      league.entries.map(
        (entry) => ({
          clubId:
            entry.clubId,

          clubName:
            entry.club.name,

          played:
            entry.played,

          won:
            entry.won,

          drawn:
            entry.drawn,

          lost:
            entry.lost,

          pointsFor:
            entry.pointsFor,

          pointsAgainst:
            entry.pointsAgainst,

          points:
            entry.points,
        })
      )
    );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <header className="border-b border-white/5 bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-[#d4af37] hover:text-[#f0c14b]"
            >
              ← Biliardo Manager
            </Link>

            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Campionato
            </h1>
          </div>

          <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-2 text-right">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Stagione
            </p>

            <p className="font-semibold text-[#f0c14b]">
              {league.season.name}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Campionato"
            value={league.name}
          />

          <InfoCard
            label="Stato"
            value={
              league.status === "ACTIVE"
                ? "In corso"
                : league.status === "COMPLETED"
                  ? "Concluso"
                  : "Preparazione"
            }
          />

          <InfoCard
            label="Giornate completate"
            value={`${league.currentRound} / ${totalRounds}`}
          />

          <InfoCard
            label="Prossima giornata"
            value={
              nextPlayableRound === null
                ? "Terminato"
                : `${nextPlayableRound}`
            }
          />
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <section className="rounded-2xl border border-white/10 bg-[#111111]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-xl font-bold text-white">
                {nextPlayableRound === null
                  ? "Campionato concluso"
                  : `Giornata ${nextPlayableRound}`}
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                {nextPlayableRound === null
                  ? "Tutti gli incontri sono stati giocati."
                  : `${currentFixtures.filter(
                      (fixture) =>
                        fixture.status ===
                        "PLAYED"
                    ).length} incontri giocati su ${currentFixtures.length}`}
              </p>
            </div>

            <div className="divide-y divide-white/5">
              {currentFixtures.map(
                (fixture) => (
                  <article
                    key={fixture.id}
                    className="px-5 py-5"
                  >
                    <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        Incontro {fixture.id}
                      </span>

                      <span>
                        {formatFixtureDate(
                          fixture.scheduledAt
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {fixture.homeClub.name}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {fixture.homeClub.city}
                        </p>
                      </div>

                      <div className="min-w-20 text-center">
                        {fixture.status ===
                        "PLAYED" ? (
                          <p className="text-xl font-bold text-[#f0c14b]">
                            {fixture.homeScore}
                            {" – "}
                            {fixture.awayScore}
                          </p>
                        ) : (
                          <p className="rounded-lg border border-white/10 bg-[#181818] px-3 py-2 text-xs font-semibold text-zinc-400">
                            Da giocare
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {fixture.awayClub.name}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {fixture.awayClub.city}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )}

              {currentFixtures.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-zinc-400">
                  Nessun incontro da giocare.
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-xl font-bold text-white">
                Classifica
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Aggiornata dopo gli ultimi risultati registrati
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-[#181818] text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 text-center">
                      Pos.
                    </th>

                    <th className="px-4 py-3 text-left">
                      Squadra
                    </th>

                    <th className="px-3 py-3 text-center">
                      G
                    </th>

                    <th className="px-3 py-3 text-center">
                      V
                    </th>

                    <th className="px-3 py-3 text-center">
                      N
                    </th>

                    <th className="px-3 py-3 text-center">
                      P
                    </th>

                    <th className="px-3 py-3 text-center">
                      PF
                    </th>

                    <th className="px-3 py-3 text-center">
                      PS
                    </th>

                    <th className="px-3 py-3 text-center">
                      Diff.
                    </th>

                    <th className="px-4 py-3 text-center">
                      Punti
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {table.map(
                    (entry) => (
                      <tr
                        key={entry.clubId}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4 text-center font-bold text-[#d4af37]">
                          {entry.position}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">
                            {entry.clubName}
                          </p>
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.played}
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.won}
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.drawn}
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.lost}
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.pointsFor}
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.pointsAgainst}
                        </td>

                        <td className="px-3 py-4 text-center text-zinc-300">
                          {entry.pointsDifference > 0
                            ? `+${entry.pointsDifference}`
                            : entry.pointsDifference}
                        </td>

                        <td className="px-4 py-4 text-center text-base font-bold text-[#f0c14b]">
                          {entry.points}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type InfoCardProps = {
  label: string;
  value: string;
};

function InfoCard({
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function formatFixtureDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "Europe/Rome",
    }
  ).format(date);
}