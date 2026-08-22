import {
  CalendarDays,
  Clock3,
  Globe2,
  Medal,
  Shuffle,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  buildIndividualTournamentCalendar,
  INDIVIDUAL_TOURNAMENT_STAGES,
  type IndividualTournamentType,
} from "@/lib/individual-tournament-calendar";
import { prisma } from "@/lib/prisma";
import { ROME_TIME_ZONE } from "@/lib/rome-calendar";

export const dynamic = "force-dynamic";

export default async function IndividualePage() {
  const referenceLeague = await prisma.league.findFirst({
    where: {
      level: 1,
      groupCode: "A",
      season: {
        status: {
          in: ["PREPARATION", "ACTIVE", "COMPLETED"],
        },
      },
    },
    orderBy: {
      season: {
        number: "desc",
      },
    },
    select: {
      currentRound: true,
      season: {
        select: {
          name: true,
          status: true,
        },
      },
      fixtures: {
        orderBy: [
          { round: "asc" },
          { id: "asc" },
        ],
        select: {
          round: true,
          scheduledAt: true,
        },
      },
    },
  });

  if (!referenceLeague) {
    return <IndividualUnavailable />;
  }

  const roundDates = new Map<number, Date>();

  for (const fixture of referenceLeague.fixtures) {
    if (!roundDates.has(fixture.round)) {
      roundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  if (roundDates.size !== 14) {
    return <IndividualUnavailable />;
  }

  const calendar = buildIndividualTournamentCalendar(roundDates);
  const now = new Date();
  const featuredTournament =
    calendar.find((tournament) => tournament.finalAt >= now) ??
    calendar[calendar.length - 1];
  const nextStage = featuredTournament.stages.find(
    (stage) => stage.scheduledAt > now
  );
  const weekendStatus = getWeekendStatus(
    featuredTournament.drawAt,
    featuredTournament.finalAt,
    now
  );

  return (
    <main className="space-y-4 text-zinc-100">
      <header className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[linear-gradient(135deg,#283126_0%,#15271f_58%,#101d18_100%)] px-5 py-5 shadow-xl shadow-black/15">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              <Medal size={14} />
              Circuito ufficiale
            </div>

            <h1 className="mt-2 text-3xl font-black text-white">
              Individuale
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
              I migliori 256 giocatori del mondo si affrontano in quattordici
              appuntamenti collegati alle giornate di campionato.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[390px]">
            <HeroStat label="Partecipanti" value="256" />
            <HeroStat label="Tornei" value="14" />
            <HeroStat label="Formula" value="2 su 3" highlight />
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#14251e]">
          <div className="flex flex-col justify-between gap-3 border-b border-emerald-900/60 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                Prossimo appuntamento
              </p>

              <h2 className="mt-1 text-xl font-black text-white">
                {featuredTournament.name}
              </h2>
            </div>

            <StatusBadge status={weekendStatus} />
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <InfoBlock
              icon={<CalendarDays size={18} />}
              label="Fine settimana"
              value={formatWeekend(
                featuredTournament.drawAt,
                featuredTournament.finalAt
              )}
            />
            <InfoBlock
              icon={<Target size={18} />}
              label="Specialità"
              value={featuredTournament.specialty}
            />
            <InfoBlock
              icon={<Clock3 size={18} />}
              label="Prossimo evento"
              value={
                nextStage
                  ? `${nextStage.label} · ${formatDateTime(nextStage.scheduledAt)}`
                  : "Torneo concluso"
              }
            />
          </div>

          <div className="border-t border-emerald-900/60 bg-black/10 px-4 py-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {featuredTournament.stages.map((stage) => (
                <div
                  key={stage.key}
                  className={`rounded-xl border px-3 py-2 ${
                    stage.scheduledAt <= now
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-zinc-700/80 bg-zinc-950/20"
                  }`}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                    {stage.dayLabel}
                  </p>
                  <p className="mt-0.5 text-xs font-black text-white">
                    {stage.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-300">
                    {formatTime(stage.scheduledAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              Regole principali
            </p>
            <h2 className="mt-1 text-lg font-black text-white">
              Accesso automatico
            </h2>
          </div>

          <div className="space-y-3 p-4">
            <RuleRow
              icon={<Users size={18} />}
              title="Primi 256 overall"
              description="Nessuna iscrizione manuale da parte del manager."
            />
            <RuleRow
              icon={<Shuffle size={18} />}
              title="Sorteggio completamente casuale"
              description="Il tabellone viene definito una sola volta il sabato alle 10:00."
            />
            <RuleRow
              icon={<Trophy size={18} />}
              title="Incontri al meglio delle tre"
              description="Servono due prove vinte per superare ogni turno."
            />
            <RuleRow
              icon={<Globe2 size={18} />}
              title="Europeo e Mondiale"
              description="Le prime due specialità sono sorteggiate; l'eventuale terza è quella mancante."
            />
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col justify-between gap-2 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
              {referenceLeague.season.name}
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Calendario dei tornei
            </h2>
          </div>

          <p className="text-xs font-semibold text-zinc-500">
            Campionato alla giornata {referenceLeague.currentRound}
          </p>
        </div>

        <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {calendar.map((tournament) => (
            <TournamentCard
              key={tournament.leagueRound}
              tournament={tournament}
              now={now}
              featured={
                tournament.leagueRound === featuredTournament.leagueRound
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {(["Sabato", "Domenica"] as const).map((day) => (
          <div
            key={day}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
          >
            <div className="border-b border-zinc-800 px-4 py-3">
              <h2 className="font-black text-white">{day}</h2>
            </div>

            <div className="divide-y divide-zinc-800">
              {INDIVIDUAL_TOURNAMENT_STAGES.filter(
                (stage) => stage.dayLabel === day
              ).map((stage) => (
                <div
                  key={stage.key}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm font-semibold text-zinc-300">
                    {stage.label}
                  </span>
                  <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-black text-amber-300">
                    {formatStageTime(stage.hour, stage.minute)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function IndividualUnavailable() {
  return (
    <main className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-100">
      <Medal className="mx-auto text-zinc-600" size={34} />
      <h1 className="mt-3 text-2xl font-black text-white">
        Circuito individuale non disponibile
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Il calendario verrà pubblicato insieme alla stagione ufficiale.
      </p>
    </main>
  );
}

function HeroStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-black ${
          highlight ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-900/60 bg-[#183129] p-3">
      <div className="flex items-center gap-2 text-emerald-400">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-black leading-5 text-white">{value}</p>
    </div>
  );
}

function RuleRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950/20 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TournamentWeekendStatus }) {
  const tone =
    status === "In corso"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : status === "Concluso"
        ? "border-zinc-700 bg-zinc-800 text-zinc-400"
        : "border-amber-400/30 bg-amber-400/10 text-amber-300";

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
}

function TournamentCard({
  tournament,
  now,
  featured,
}: {
  tournament: ReturnType<typeof buildIndividualTournamentCalendar>[number];
  now: Date;
  featured: boolean;
}) {
  const status = getWeekendStatus(
    tournament.drawAt,
    tournament.finalAt,
    now
  );

  return (
    <article
      className={`rounded-xl border p-3 transition ${
        featured
          ? "border-amber-400/40 bg-amber-400/5"
          : "border-zinc-800 bg-zinc-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
            Giornata {tournament.leagueRound}
          </p>
          <h3 className="mt-1 text-sm font-black text-white">
            {tournament.name}
          </h3>
        </div>

        <TournamentMark type={tournament.type} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-zinc-800 pt-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
            Sorteggio
          </p>
          <p className="mt-0.5 text-xs font-bold text-zinc-300">
            {formatDateTime(tournament.drawAt)}
          </p>
        </div>

        <span
          className={`text-[10px] font-black ${
            status === "In corso"
              ? "text-emerald-400"
              : status === "Concluso"
                ? "text-zinc-600"
                : "text-amber-300"
          }`}
        >
          {status}
        </span>
      </div>
    </article>
  );
}

function TournamentMark({ type }: { type: IndividualTournamentType }) {
  const international = type === "EUROPEO" || type === "MONDIALE";

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        international
          ? "bg-sky-400/10 text-sky-300"
          : "bg-emerald-400/10 text-emerald-300"
      }`}
    >
      {international ? <Globe2 size={16} /> : <Target size={16} />}
    </div>
  );
}

type TournamentWeekendStatus = "Programmato" | "In corso" | "Concluso";

function getWeekendStatus(drawAt: Date, finalAt: Date, now: Date) {
  if (now < drawAt) {
    return "Programmato" satisfies TournamentWeekendStatus;
  }

  if (now <= finalAt) {
    return "In corso" satisfies TournamentWeekendStatus;
  }

  return "Concluso" satisfies TournamentWeekendStatus;
}

function formatWeekend(drawAt: Date, finalAt: Date) {
  const saturday = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(drawAt);
  const sunday = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(finalAt);

  return `${saturday} – ${sunday}`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
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

function formatStageTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
