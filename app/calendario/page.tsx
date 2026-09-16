import {
  CalendarDays,
  Dumbbell,
  Flag,
  GraduationCap,
  Medal,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import {
  getSeasonWeekDate,
  INDIVIDUAL_TOURNAMENT_DEFINITIONS,
} from "@/lib/individual-tournament-calendar";
import { NATIONS_CUP_LEAGUE_ROUND } from "@/lib/nations-cup";
import { prisma } from "@/lib/prisma";
import { addRomeDaysAtTime, ROME_TIME_ZONE } from "@/lib/rome-calendar";
import {
  SPECIALTY_CUP_NAME,
  SPECIALTY_CUP_SEASON_WEEK,
} from "@/lib/specialty-cup-calendar";

export const dynamic = "force-dynamic";

const SEASON_WEEKS = 15;

export default async function CalendarioPage() {
  const league = await prisma.league.findFirst({
    where: {
      level: 1,
      groupCode: "A",
      season: {
        status: { in: ["PREPARATION", "ACTIVE", "COMPLETED"] },
      },
    },
    orderBy: { season: { number: "desc" } },
    select: {
      currentRound: true,
      season: { select: { name: true } },
      fixtures: {
        orderBy: [{ round: "asc" }, { id: "asc" }],
        select: { round: true, scheduledAt: true },
      },
    },
  });

  if (!league) {
    return <CalendarUnavailable />;
  }

  const roundDates = new Map<number, Date>();
  for (const fixture of league.fixtures) {
    if (!roundDates.has(fixture.round)) {
      roundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  if (roundDates.size < 14) {
    return <CalendarUnavailable />;
  }

  const weeks = Array.from({ length: SEASON_WEEKS }, (_, index) => {
    const week = index + 1;
    const friday = getSeasonWeekDate(roundDates, week)!;
    const tournament = INDIVIDUAL_TOURNAMENT_DEFINITIONS.find(
      (candidate) => candidate.leagueRound === week
    );
    const isNationsCup = week === NATIONS_CUP_LEAGUE_ROUND;
    const isSpecialtyCup = week === SPECIALTY_CUP_SEASON_WEEK;

    return {
      week,
      friday,
      monday: addRomeDaysAtTime(friday, -4, 12),
      tuesday: addRomeDaysAtTime(friday, -3, 21),
      tournament,
      isNationsCup,
      isSpecialtyCup,
    };
  });

  return (
    <main className="space-y-4 text-zinc-100">
      <header className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[linear-gradient(135deg,#283126_0%,#15271f_58%,#101d18_100%)] px-5 py-5 shadow-xl shadow-black/15">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            <CalendarDays size={15} />
            {league.season.name}
          </div>
          <h1 className="mt-2 text-3xl font-black text-white">
            Calendario stagionale completo
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
            Tutte le quindici settimane in un’unica pagina: aggiornamento e
            allenamento, accademia, campionato e competizioni del fine settimana.
          </p>
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {weeks.map((item) => {
          const completed = item.week <= league.currentRound;
          const weekendLabel = item.isNationsCup
            ? "Coppa delle Nazioni"
            : item.isSpecialtyCup
              ? SPECIALTY_CUP_NAME
              : item.tournament?.name ?? "Fine settimana libero";

          return (
            <article
              key={item.week}
              className={`overflow-hidden rounded-2xl border bg-zinc-900 ${
                item.week >= 14
                  ? "border-amber-400/30"
                  : completed
                    ? "border-emerald-500/25"
                    : "border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Settimana {item.week}
                  </p>
                  <h2 className="mt-0.5 font-black text-white">
                    {formatWeek(item.friday)}
                  </h2>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase ${
                  completed
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-700 text-zinc-500"
                }`}>
                  {completed ? "Disputata" : "In programma"}
                </span>
              </div>

              <div className="divide-y divide-zinc-800/80">
                <CalendarEvent icon={<Dumbbell size={15} />} day="Lunedì" time={formatTime(item.monday)} label="Allenamento e aggiornamento settimanale" />
                <CalendarEvent icon={<GraduationCap size={15} />} day="Martedì" time={formatTime(item.tuesday)} label="Accademia" />
                <CalendarEvent
                  icon={<Trophy size={15} />}
                  day="Venerdì"
                  time={item.week <= 14 ? formatTime(item.friday) : "—"}
                  label={item.week <= 14 ? `Campionato · giornata ${item.week}` : "Pausa campionato"}
                />
                <CalendarEvent
                  icon={item.isNationsCup ? <Flag size={15} /> : <Medal size={15} />}
                  day="Weekend"
                  time="Sab–Dom"
                  label={weekendLabel}
                  href={
                    item.isNationsCup
                      ? "/coppa-nazioni"
                      : item.isSpecialtyCup
                        ? "/coppa-specialita"
                        : item.tournament
                          ? `/individuale/${item.week}`
                          : undefined
                  }
                  highlight={Boolean(
                    item.isNationsCup || item.isSpecialtyCup || item.tournament
                  )}
                />
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function CalendarEvent({
  icon,
  day,
  time,
  label,
  href,
  highlight = false,
}: {
  icon: React.ReactNode;
  day: string;
  time: string;
  label: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className={highlight ? "text-amber-300" : "text-emerald-400"}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
          {day} · {time}
        </p>
        <p className={`mt-0.5 truncate text-xs font-bold ${highlight ? "text-amber-200" : "text-zinc-300"}`}>
          {label}
        </p>
      </div>
    </div>
  );

  return href ? <Link href={href} className="block transition hover:bg-white/[0.03]">{content}</Link> : content;
}

function CalendarUnavailable() {
  return (
    <main className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-100">
      <CalendarDays className="mx-auto text-zinc-600" size={32} />
      <h1 className="mt-3 text-2xl font-black text-white">Calendario non disponibile</h1>
      <p className="mt-2 text-sm text-zinc-400">La stagione deve essere generata prima di poter mostrare le quindici settimane.</p>
    </main>
  );
}

function formatWeek(friday: Date) {
  const monday = addRomeDaysAtTime(friday, -4, 12);
  const sunday = addRomeDaysAtTime(friday, 2, 16);
  const formatter = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(monday)} – ${formatter.format(sunday)}`;
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
