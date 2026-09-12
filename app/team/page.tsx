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

import { getCurrentClubId } from "@/lib/current-club";
import { prisma } from "@/lib/prisma";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const clubId = await getCurrentClubId();
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
    include: {
      players: true,
    },
  });

  if (!club) {
    throw new Error("Club principale non disponibile.");
  }

  const players = club.players.map((player) => ({
    ...player,
    overall: calculateOverall(player),
  }));

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
    .sort(
      (first, second) =>
        second.overall - first.overall
    )
    .slice(0, 5);

  return (
    <main className="space-y-4">
      <header className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-[linear-gradient(135deg,#183129_0%,#12231d_68%,#101e19_100%)] p-5 shadow-xl shadow-black/10 sm:px-6 sm:py-5">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${club.primaryColor}, ${club.secondaryColor})`,
          }}
        />

        <div
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: club.secondaryColor }}
        />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-xl font-black text-white shadow-xl shadow-black/20"
              style={{
                background: `linear-gradient(145deg, ${club.primaryColor}, ${club.secondaryColor})`,
              }}
            >
              {club.shortName}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Il tuo club
              </p>

              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {club.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
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

          <div className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Star size={20} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reputazione
              </p>

              <p className="mt-0.5 text-xl font-black text-amber-300">
                {club.reputation}/100
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
          <div className="flex items-center justify-between gap-4 border-b border-emerald-900/60 px-4 py-3.5 sm:px-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Prima squadra
              </p>

              <h2 className="mt-0.5 text-xl font-black text-white">
                Rosa
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {players.length} giocatori · Overall medio{" "}
                {averageOverall} · Età media {averageAge}
              </p>
            </div>

            <Link
              href="/players"
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-[#122018] transition hover:bg-amber-300"
            >
              Rosa completa
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-emerald-900/40 px-3 py-1 sm:px-4">
            {topPlayers.map((player) => (
              <RosterPlayerCard
                key={player.id}
                player={player}
                primaryColor={club.primaryColor}
                secondaryColor={club.secondaryColor}
              />
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-4 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
              Staff tecnico
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              Struttura sportiva
            </h2>

            <div className="mt-4 space-y-3">
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

          <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 sm:p-5">
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
      className={`rounded-2xl border px-4 py-3.5 ${style.border} ${style.background}`}
    >
      <div className={`flex items-center gap-2 ${style.text}`}>
        {icon}

        <p className="text-xs font-black uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className={`mt-2 text-xl font-black ${style.text}`}>
        {value}
      </p>
    </article>
  );
}

function RosterPlayerCard({
  player,
  primaryColor,
  secondaryColor,
}: {
  player: {
    id: number;
    firstName: string;
    lastName: string;
    nationality: string;
    age: number;
    form: number;
    morale: number;
    overall: number;
    style: string[];
  };
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group relative flex items-center gap-3 px-3 py-3 transition duration-200 hover:bg-emerald-950/45 sm:px-4"
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`,
        }}
      />

      <PlayerPortrait player={player} className="aspect-[2/3] w-16 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-white transition group-hover:text-amber-200">
          {player.firstName} {player.lastName}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-500">
          {player.nationality} · {player.age} anni
        </p>
      </div>

      <p className="hidden w-28 truncate text-[10px] font-bold uppercase tracking-wide text-emerald-300/80 lg:block">
        {player.style[0] ?? "Completo"}
      </p>

      <div className="hidden items-center gap-5 sm:flex">
        <RosterStatus label="Forma" value={`${player.form}/10`} />
        <RosterStatus label="Morale" value={`${player.morale}/10`} />
      </div>

      <div className="shrink-0 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-base font-black text-amber-300">
          {player.overall}
        </div>
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-amber-300"
      />
    </Link>
  );
}

function RosterStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-12 text-center">
      <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </span>

      <span className="mt-0.5 block text-xs font-black text-slate-300">
        {value}
      </span>
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
  const attributes = [
    player.precisione,
    player.diretto,
    player.sponde,
    player.tattica,
    player.mentalita,
    player.difesa,
    player.realizzazione,
    player.creativita,
    player.misura,
  ];

  return Math.round(
    attributes.reduce(
      (total, attribute) => total + attribute,
      0
    ) / attributes.length
  );
}
