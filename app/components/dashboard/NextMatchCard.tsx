import Link from "next/link";

import { getCurrentClubId } from "@/lib/current-club";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

import { prisma } from "@/lib/prisma";

export default async function NextMatchCard() {
  const clubId = await getCurrentClubId();
  const [league, formation] =
    await Promise.all([
      prisma.league.findFirst({
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          id: "desc",
        },

        include: {
          fixtures: {
            where: {
              OR: [
                {
                  homeClubId:
                    clubId,
                },
                {
                  awayClubId:
                    clubId,
                },
              ],
            },

            orderBy: {
              round: "asc",
            },

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
      }),

      prisma.formation.findUnique({
        where: {
          clubId:
            clubId,
        },
      }),
    ]);

  if (!league) {
    return (
      <section className="flex h-full flex-col rounded-2xl border border-emerald-900/60 bg-[#15261f] p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
          Campionato
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Nessuna partita disponibile
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Non esiste ancora un campionato attivo.
        </p>
      </section>
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

  const playableRound =
    totalRounds > 0
      ? getNextPlayableRound(
          league.currentRound,
          totalRounds
        )
      : null;

  const fixture =
    playableRound === null
      ? null
      : league.fixtures.find(
          (currentFixture) =>
            currentFixture.round ===
            playableRound
        ) ?? null;
  const latestPlayedFixture = [...league.fixtures]
    .filter((candidate) => candidate.status === "PLAYED")
    .sort((first, second) => second.round - first.round)[0];

  const formationComplete =
    formation?.slotAPlayerId !== null &&
    formation?.slotAPlayerId !== undefined &&
    formation?.slotBPlayerId !== null &&
    formation?.slotBPlayerId !== undefined &&
    formation?.slotCPlayerId !== null &&
    formation?.slotCPlayerId !== undefined;

  if (!fixture) {
    return (
      <section className="flex h-full flex-col rounded-2xl border border-emerald-900/60 bg-[#15261f] p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
          {league.name}
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Campionato concluso
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Tutte le giornate del campionato sono state completate.
        </p>

        <Link
          href="/campionato"
          className="mt-6 inline-flex w-fit rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-black text-amber-300 transition hover:bg-amber-400/20"
        >
          Vedi la classifica finale
        </Link>

        {latestPlayedFixture && (
          <Link
            href={`/campionato/incontri/${latestPlayedFixture.id}`}
            className="mt-3 inline-flex w-fit rounded-xl border border-emerald-800 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Apri l&apos;ultimo referto
          </Link>
        )}
      </section>
    );
  }

  const isHome =
    fixture.homeClubId ===
    clubId;

  const matchPlayed =
    fixture.status ===
    "PLAYED";

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
        <div className="flex flex-col justify-between gap-3 border-b border-emerald-900/60 p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            {league.name}
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            Partita della giornata
          </h2>
        </div>

        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-amber-300">
            Giornata {fixture.round}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatFixtureDate(
              fixture.scheduledAt
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <ClubSide
            name={
              fixture.homeClub.name
            }
            shortName={
              fixture.homeClub.shortName
            }
            city={
              fixture.homeClub.city
            }
            isUser={
              fixture.homeClubId ===
              clubId
            }
          />

          <div className="min-w-24 text-center">
            {matchPlayed ? (
              <>
                <p className="text-3xl font-black text-amber-300">
                  {fixture.homeScore}
                  {" – "}
                  {fixture.awayScore}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Risultato finale
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-black text-slate-500">
                  VS
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isHome
                    ? "In casa"
                    : "In trasferta"}
                </p>
              </>
            )}
          </div>

          <ClubSide
            name={
              fixture.awayClub.name
            }
            shortName={
              fixture.awayClub.shortName
            }
            city={
              fixture.awayClub.city
            }
            isUser={
              fixture.awayClubId ===
              clubId
            }
            align="right"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-emerald-900/50 pt-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center justify-between rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Formazione
            </span>

            <span className={`text-sm font-black ${formationComplete ? "text-emerald-300" : "text-amber-300"}`}>
              {formationComplete ? "Completa" : "Da preparare"}
            </span>
          </div>

          {matchPlayed ? (
            <Link
              href={`/campionato/incontri/${fixture.id}`}
              className="flex-1 rounded-xl bg-amber-400 px-4 py-2.5 text-center text-sm font-black text-[#122018] transition hover:bg-amber-300"
            >
              Apri il referto
            </Link>
          ) : (
            <Link
              href="/formation"
              className="flex-1 rounded-xl bg-amber-400 px-4 py-2.5 text-center text-sm font-black text-[#122018] transition hover:bg-amber-300"
            >
              Prepara la formazione
            </Link>
          )}

          <Link
            href={
              latestPlayedFixture
                ? `/campionato/incontri/${latestPlayedFixture.id}`
                : "/campionato"
            }
            className="flex-1 rounded-xl border border-emerald-800 px-4 py-2.5 text-center text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            {latestPlayedFixture ? "Ultimo referto" : "Vai al campionato"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClubSide({
  name,
  shortName,
  city,
  isUser,
  align = "left",
}: {
  name: string;
  shortName: string;
  city: string;
  isUser: boolean;
  align?: "left" | "right";
}) {
  const alignment =
    align === "right"
      ? "items-end text-right"
      : "items-start text-left";

  return (
    <div
      className={`flex min-w-0 flex-col ${alignment}`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-black ${
          isUser
            ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
            : "border-emerald-900/60 bg-emerald-950/50 text-emerald-300"
        }`}
      >
        {shortName}
      </div>

      <p
        className={`mt-2 text-sm font-black ${
          isUser
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {name}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {city}
        {isUser
          ? " · La tua squadra"
          : ""}
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
