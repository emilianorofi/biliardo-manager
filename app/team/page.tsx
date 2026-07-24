import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  GraduationCap,
  MapPin,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { clubs } from "@/app/data/clubs";
import { players } from "@/app/data/players";

export default function TeamPage() {
  const club = clubs[0];

  if (!club) {
    throw new Error("Club principale non disponibile.");
  }

  const weeklyResult =
    club.weeklyIncome - club.weeklyExpenses;

  const averageOverall =
    players.length > 0
      ? Math.round(
          players.reduce(
            (total, player) => total + player.overall,
            0
          ) / players.length
        )
      : 0;

  const averageAge =
    players.length > 0
      ? (
          players.reduce(
            (total, player) => total + player.age,
            0
          ) / players.length
        ).toFixed(1)
      : "0";

  const topPlayers = [...players]
    .sort((first, second) => second.overall - first.overall)
    .slice(0, 5);

  return (
    <main className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-[#15261f] p-6 sm:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-amber-400/30 bg-amber-400/10 text-3xl font-black text-amber-300">
              {club.shortName}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Il tuo club
              </p>

              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                {club.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {club.city}, {club.country}
                </span>

                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {formatNumber(club.fans)} tifosi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Star size={24} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reputazione
              </p>

              <p className="mt-1 text-2xl font-black text-amber-300">
                {club.reputation}/100
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Bilancio"
          value={formatCurrency(club.balance)}
          icon={<WalletCards size={22} />}
          tone="amber"
        />

        <SummaryCard
          label="Entrate settimanali"
          value={formatCurrency(club.weeklyIncome)}
          icon={<TrendingUp size={22} />}
          tone="emerald"
        />

        <SummaryCard
          label="Uscite settimanali"
          value={formatCurrency(club.weeklyExpenses)}
          icon={<TrendingDown size={22} />}
          tone="red"
        />

        <SummaryCard
          label="Risultato settimanale"
          value={formatSignedCurrency(weeklyResult)}
          icon={
            weeklyResult >= 0 ? (
              <TrendingUp size={22} />
            ) : (
              <TrendingDown size={22} />
            )
          }
          tone={weeklyResult >= 0 ? "emerald" : "red"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
          <div className="flex items-center justify-between gap-4 border-b border-emerald-900/60 p-5 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Prima squadra
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Rosa
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {players.length} giocatori · Overall medio{" "}
                {averageOverall} · Età media {averageAge}
              </p>
            </div>

            <Link
              href="/players"
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-[#122018] transition hover:bg-amber-300"
            >
              Rosa completa
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-emerald-900/40">
            {topPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-emerald-950/40 sm:px-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950/70 font-black text-emerald-300">
                  {player.firstName.charAt(0)}
                  {player.lastName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">
                    {player.firstName} {player.lastName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {player.nationality} · {player.age} anni
                  </p>
                </div>

                <div className="hidden gap-6 text-center sm:flex">
                  <PlayerValue
                    label="Forma"
                    value={`${player.form}/10`}
                  />

                  <PlayerValue
                    label="Morale"
                    value={`${player.morale}/10`}
                  />
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-lg font-black text-amber-300">
                  {player.overall}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
              Staff tecnico
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              Struttura sportiva
            </h2>

            <div className="mt-6 space-y-4">
              <StaffLevel
                label="Allenatore prima squadra"
                description={`Efficienza ${getTrainerEfficiency(
                  club.trainerLevel
                )}%`}
                level={club.trainerLevel}
                icon={<Dumbbell size={21} />}
              />

              <StaffLevel
                label="Responsabile Accademia"
                description="Sviluppo e valutazione dei giovani"
                level={club.youthCoachLevel}
                icon={<GraduationCap size={21} />}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Situazione economica
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              Andamento settimanale
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Il club produce attualmente un risultato settimanale
              di{" "}
              <strong
                className={
                  weeklyResult >= 0
                    ? "text-emerald-300"
                    : "text-red-300"
                }
              >
                {formatSignedCurrency(weeklyResult)}
              </strong>
              .
            </p>

            <Link
              href="/finance"
              className="mt-5 inline-flex items-center gap-2 font-bold text-amber-300 transition hover:text-amber-200"
            >
              Apri le finanze
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "amber" | "emerald" | "red";
}) {
  const tones = {
    amber: {
      border: "border-amber-400/25",
      background: "bg-amber-400/5",
      text: "text-amber-300",
    },
    emerald: {
      border: "border-emerald-500/25",
      background: "bg-emerald-500/5",
      text: "text-emerald-300",
    },
    red: {
      border: "border-red-500/25",
      background: "bg-red-500/5",
      text: "text-red-300",
    },
  };

  const style = tones[tone];

  return (
    <article
      className={`rounded-2xl border p-5 ${style.border} ${style.background}`}
    >
      <div className={`flex items-center gap-2 ${style.text}`}>
        {icon}

        <p className="text-xs font-black uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className={`mt-3 text-2xl font-black ${style.text}`}>
        {value}
      </p>
    </article>
  );
}

function PlayerValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-300">
        {value}
      </p>
    </div>
  );
}

function StaffLevel({
  label,
  description,
  level,
  icon,
}: {
  label: string;
  description: string;
  level: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-emerald-900/50 bg-emerald-950/35 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-white">{label}</p>

            <span className="text-sm font-black text-amber-300">
              Livello {level}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full ${
              index < level
                ? "bg-amber-400"
                : "bg-emerald-950"
            }`}
          />
        ))}
      </div>
    </article>
  );
}

function getTrainerEfficiency(level: number) {
  const efficiencyByLevel = {
    1: 60,
    2: 70,
    3: 80,
    4: 90,
    5: 100,
  };

  return efficiencyByLevel[
    level as keyof typeof efficiencyByLevel
  ];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedCurrency(value: number) {
  const formatted = formatCurrency(Math.abs(value));

  if (value > 0) return `+ ${formatted}`;
  if (value < 0) return `- ${formatted}`;

  return formatted;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("it-IT").format(value);
}