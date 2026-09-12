import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  Coins,
  LogOut,
  Trophy,
  Users,
} from "lucide-react";

import { logoutManager } from "@/app/auth/actions";
import ClubCrest from "@/app/components/onboarding/ClubCrest";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";
import { requireAuthenticatedManager } from "@/lib/auth";
import { createLeagueTable } from "@/lib/league-table";
import {
  isClubCrestStyle,
  type ClubCrestStyle,
} from "@/lib/onboarding/club-rules";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClubCreatedPage() {
  const manager = await requireAuthenticatedManager();

  if (manager.clubId === null) {
    redirect("/onboarding");
  }

  const [club, leagueEntry] = await Promise.all([
    prisma.club.findUnique({
      where: {
        id: manager.clubId,
      },
      include: {
        players: {
          orderBy: [{ age: "desc" }, { id: "asc" }],
        },
      },
    }),
    prisma.leagueEntry.findFirst({
      where: {
        clubId: manager.clubId,
      },
      orderBy: {
        league: {
          season: {
            number: "desc",
          },
        },
      },
      include: {
        league: {
          include: {
            entries: {
              include: {
                club: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!club) {
    throw new Error("Club del manager non disponibile.");
  }

  const crestStyle: ClubCrestStyle = isClubCrestStyle(
    club.crestStyle
  )
    ? club.crestStyle
    : "CLASSIC";
  const players = club.players.map((player) => ({
    ...player,
    overall: calculateOverall(player),
  }));
  const averageOverall = Math.round(
    players.reduce(
      (total, player) => total + player.overall,
      0
    ) / players.length
  );
  const ranking = leagueEntry
    ? createLeagueTable(
        leagueEntry.league.entries.map((entry) => ({
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
      )
    : [];
  const inheritedPosition = ranking.find(
    (entry) => entry.clubId === club.id
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(251,191,36,0.13),transparent)]" />

      <div className="relative mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-amber-400/20 bg-[#111a16] p-6 shadow-2xl shadow-black/30 sm:p-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <ClubCrest
              style={crestStyle}
              primaryColor={club.primaryColor}
              secondaryColor={club.secondaryColor}
            />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Club fondato con successo
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                {club.name}
              </h1>
              <p className="mt-3 text-zinc-400">
                {manager.name}, la tua nuova avventura a{" "}
                {club.city} comincia adesso.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Coins size={20} />}
              label="Bilancio"
              value={formatCurrency(club.balance)}
            />
            <SummaryCard
              icon={<Users size={20} />}
              label="Rosa"
              value={`${players.length} giocatori`}
            />
            <SummaryCard
              icon={<Trophy size={20} />}
              label="Overall medio"
              value={String(averageOverall)}
            />
            <SummaryCard
              icon={<CalendarCheck size={20} />}
              label="Posizione ereditata"
              value={
                inheritedPosition
                  ? `${inheritedPosition.position}ª · ${inheritedPosition.points} pt`
                  : "Da definire"
              }
            />
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-900/60 bg-[#111a16] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Rosa iniziale
              </p>
              <h2 className="mt-1 text-2xl font-black">
                I tuoi primi cinque giocatori
              </h2>
            </div>
            {leagueEntry ? (
              <p className="text-sm text-zinc-500">
                {leagueEntry.league.name}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {players.map((player) => (
              <article
                key={player.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/players/${player.id}`} aria-label={`Apri la scheda di ${player.firstName} ${player.lastName}`}>
                    <PlayerPortrait player={player} className="aspect-[4/5] w-20" />
                  </Link>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 font-black text-amber-300">
                    {player.overall}
                  </span>
                </div>
                <p className="mt-4 font-black text-white">
                  <Link href={`/players/${player.id}`} className="transition hover:text-amber-200 hover:underline">
                    {player.firstName} {player.lastName}
                  </Link>
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {player.age} anni · {player.style[0]}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-5 rounded-2xl border border-sky-400/15 bg-sky-400/5 p-4 text-sm leading-6 text-sky-200/80">
            I precedenti giocatori della squadra IA sono stati
            trasferiti tra gli svincolati con il timer di 105
            giorni. Tu hai ricevuto una rosa completamente
            nuova e personale.
          </p>
        </section>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111a16] p-5 sm:flex-row">
          <form action={logoutManager}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-white"
            >
              <LogOut size={17} />
              Esci
            </button>
          </form>

          <Link
            href="/team"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-black text-[#122018] transition hover:bg-amber-300"
          >
            Entra nel club
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="text-amber-300">{icon}</span>
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function calculateOverall(player: {
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
}) {
  const total =
    player.precisione +
    player.diretto +
    player.sponde +
    player.tattica +
    player.mentalita +
    player.difesa +
    player.realizzazione +
    player.creativita +
    player.misura;

  return Math.round(total / 9);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
