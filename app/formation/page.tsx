import FormationBoard from "../components/formation/FormationBoard";

import {
  USER_CLUB_ID,
} from "@/lib/game-config";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export default async function FormationPage() {
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
                  USER_CLUB_ID,
              },
              {
                awayClubId:
                  USER_CLUB_ID,
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
        USER_CLUB_ID
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
    <main className="space-y-7">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
          {roundLabel}
        </p>

        <h1 className="mt-2 text-4xl font-black text-white">
          Prepara la formazione
        </h1>

        <p className="mt-2 max-w-3xl text-slate-400">
          {description}
        </p>
      </header>

      <FormationBoard />
    </main>
  );
}