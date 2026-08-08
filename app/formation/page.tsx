import FormationBoard from "../components/formation/FormationBoard";

import { getCurrentClubId } from "@/lib/current-club";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export default async function FormationPage() {
  const clubId = await getCurrentClubId();
  const league =
    await prisma.league.findFirst({
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
              },
            },

            awayClub: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

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

  const nextPlayableRound =
    league && totalRounds > 0
      ? getNextPlayableRound(
          league.currentRound,
          totalRounds
        )
      : null;

  const currentFixture =
    nextPlayableRound === null
      ? null
      : league?.fixtures.find(
          (fixture) =>
            fixture.round ===
            nextPlayableRound
        ) ?? null;

  const opponent =
    currentFixture
      ? currentFixture.homeClubId ===
        clubId
        ? currentFixture.awayClub
        : currentFixture.homeClub
      : null;

  const roundLabel =
    nextPlayableRound === null
      ? "Campionato"
      : `Giornata ${nextPlayableRound}`;

  const description =
    !league
      ? "Non esiste ancora un campionato attivo."
      : nextPlayableRound === null
        ? "Il campionato è terminato."
        : !currentFixture
          ? "Non è stato trovato l'incontro della tua squadra."
          : currentFixture.status ===
              "PLAYED"
            ? `Incontro già giocato: ${currentFixture.homeClub.name} ${currentFixture.homeScore ?? 0} – ${currentFixture.awayScore ?? 0} ${currentFixture.awayClub.name}.`
            : `Prossimo incontro contro ${opponent?.name ?? "avversario da definire"}. Assegna tre giocatori agli slot A, B e C.`;

  return (
    <main className="space-y-4">
      <header className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            {roundLabel}
          </p>

          <h1 className="mt-1 text-3xl font-black text-white">
            Prepara la formazione
          </h1>
        </div>

        <p className="max-w-2xl text-sm leading-5 text-slate-400 lg:text-right">
          {description}
        </p>
      </header>

      <FormationBoard />
    </main>
  );
}
