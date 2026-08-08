import { getCurrentClubId } from "@/lib/current-club";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

import { prisma } from "@/lib/prisma";

export default async function DashboardHeader() {
  const clubId = await getCurrentClubId();
  const [club, league] =
    await Promise.all([
      prisma.club.findUnique({
        where: {
          id:
            clubId,
        },

        select: {
          name:
            true,
        },
      }),

      prisma.league.findFirst({
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
          id:
            "desc",
        },

        include: {
          season:
            true,

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
              round:
                "asc",
            },

            include: {
              homeClub: {
                select: {
                  id:
                    true,

                  name:
                    true,
                },
              },

              awayClub: {
                select: {
                  id:
                    true,

                  name:
                    true,
                },
              },
            },
          },
        },
      }),
    ]);

  const totalRounds =
    league?.fixtures.reduce(
      (
        highestRound,
        fixture
      ) =>
        Math.max(
          highestRound,
          fixture.round
        ),
      0
    ) ?? 0;

  const playableRound =
    league &&
    totalRounds > 0
      ? getNextPlayableRound(
          league.currentRound,
          totalRounds
        )
      : null;

  const fixture =
    playableRound === null
      ? null
      : league?.fixtures.find(
          (currentFixture) =>
            currentFixture.round ===
            playableRound
        ) ?? null;

  const opponent =
    fixture
      ? fixture.homeClubId ===
        clubId
        ? fixture.awayClub
        : fixture.homeClub
      : null;

  const roundLabel =
    playableRound === null
      ? league?.status ===
          "COMPLETED"
        ? "Campionato concluso"
        : "Giornata da definire"
      : `Giornata ${playableRound}`;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-6 sm:px-8 sm:py-7">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Biliardo Manager
          </p>

          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            {club?.name ??
              "Squadra non disponibile"}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            <span>
              🏆 Prima Squadra
            </span>

            <span>
              {league?.season.name ??
                "Stagione da definire"}
            </span>

            <span>
              {roundLabel}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-600/15 px-6 py-4 text-left lg:text-right">
          <div className="text-xs font-bold uppercase tracking-wider text-green-400">
            {fixture?.status ===
            "PLAYED"
              ? "Ultima partita"
              : "Prossima partita"}
          </div>

          <div className="mt-2 text-2xl font-bold text-white">
            {opponent?.name ??
              "Nessun avversario"}
          </div>

          <div className="mt-1 text-sm text-zinc-400">
            {fixture
              ? formatFixtureDate(
                  fixture.scheduledAt
                )
              : "Data non disponibile"}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatFixtureDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      weekday:
        "long",

      day:
        "2-digit",

      month:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "Europe/Rome",
    }
  ).format(date);
}
