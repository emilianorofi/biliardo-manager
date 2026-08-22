import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Player } from "../../types/player";
import PlayerPortrait from "./PlayerPortrait";
import { getNationalityDisplay } from "@/lib/nationalities";

type LatestPerformance = {
  playedAt: string;
  opponentClubName: string;
  teamScore: number;
  opponentScore: number;
  formationSlot: string;
  performanceRating: number;
};

type Props = {
  player: Player;
  clubColors?: {
    primary: string;
    secondary: string;
  };
  latestPerformance?: LatestPerformance | null;
  globalRanking?: number | null;
};

const attributeLabels: {
  key: keyof Player["attributes"];
  label: string;
}[] = [
  { key: "precisione", label: "Precisione" },
  { key: "diretto", label: "Diretto" },
  { key: "sponde", label: "Sponde" },
  { key: "tattica", label: "Tattica" },
  { key: "mentalita", label: "Mentalità" },
  { key: "difesa", label: "Difesa" },
  { key: "realizzazione", label: "Realizzazione" },
  { key: "creativita", label: "Creatività" },
  { key: "misura", label: "Misura" },
];

export default function PlayerListCard({
  player,
  clubColors = {
    primary: "#10b981",
    secondary: "#fbbf24",
  },
  latestPerformance = null,
  globalRanking = null,
}: Props) {
  const fullName = `${player.firstName} ${player.lastName}`;
  const nationality = getNationalityDisplay(player.nationality);

  return (
    <article className="relative overflow-hidden rounded-xl border border-emerald-900/60 bg-[linear-gradient(145deg,#183129_0%,#12231d_60%,#101e19_100%)] shadow-sm shadow-black/15 transition hover:border-emerald-700/70">
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background: `linear-gradient(180deg, ${clubColors.primary}, ${clubColors.secondary})`,
        }}
      />

      <div className="grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[110px_minmax(0,1fr)] lg:grid-cols-[124px_minmax(0,1fr)]">
        <div className="flex items-start justify-center border-r border-emerald-900/45 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(0,0,0,0.18))] p-2">
          <PlayerPortrait
            player={player}
            className="aspect-[2/3] w-full"
          />
        </div>

        <div className="min-w-0 px-3 py-2.5">
          <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/players/${player.id}`}
                  className="truncate text-base font-black text-emerald-200 transition hover:text-amber-200 hover:underline"
                >
                  {fullName}
                </Link>
                <span className="rounded bg-amber-300/10 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                  OVR {player.overall}
                </span>
              </div>

              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                  <CountryFlag
                    flag={nationality.flag}
                    label={nationality.label}
                  />
                  {nationality.label}
                </span>
                <span aria-hidden="true">·</span>
                <span>{player.age} anni</span>
                <span aria-hidden="true">·</span>
                <span>
                  {player.style.length > 0
                    ? player.style.join(" · ")
                    : "Stile da definire"}
                </span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className="rounded-md border border-sky-400/15 bg-sky-400/10 px-2 py-1 text-[10px] font-black text-sky-300"
                title="Il ranking globale sarà determinato dalle partite ufficiali."
              >
                Ranking {globalRanking ? `#${globalRanking}` : "N.C."}
              </span>
              <Link
                href={`/players/${player.id}`}
                className="flex items-center gap-1 rounded-md border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-[10px] font-bold text-slate-400 transition hover:border-amber-400/35 hover:text-amber-200"
              >
                Scheda
                <ArrowUpRight size={11} />
              </Link>
            </div>
          </header>

          <div className="mt-2 grid gap-3 border-t border-emerald-900/40 pt-2 lg:grid-cols-[0.8fr_1.45fr_0.85fr]">
          <section>
            <SectionLabel>Profilo</SectionLabel>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 lg:grid-cols-1">
              <DataRow label="Età" value={`${player.age} anni`} />
              <DataRow
                label="Valore"
                value={formatCurrency(player.value)}
                highlight
              />
              <DataRow
                label="Stipendio"
                value={formatCurrency(player.salary)}
              />
              <DataRow label="Forma" value={`${player.form}/10`} />
              <DataRow label="Morale" value={`${player.morale}/10`} />
              <DataRow label="Esperienza" value={player.experience} />
            </div>
          </section>

          <section>
            <SectionLabel>Caratteristiche</SectionLabel>
            <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3">
              {attributeLabels.map((attribute) => (
                <AttributeValue
                  key={attribute.key}
                  label={attribute.label}
                  value={player.attributes[attribute.key]}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Specialità e rendimento</SectionLabel>
            <div className="mt-1 space-y-0.5">
              <SpecialityRow
                label="Italiana"
                value={player.specialties.italiana}
              />
              <SpecialityRow
                label="Goriziana"
                value={player.specialties.goriziana}
              />
              <SpecialityRow
                label="Tutti Doppi"
                value={player.specialties.tuttiDoppi}
              />
            </div>

            <LatestPerformance performance={latestPerformance} />
          </section>
          </div>
        </div>
      </div>
    </article>
  );
}

function CountryFlag({
  flag,
  label,
}: {
  flag: string;
  label: string;
}) {
  return (
    <span
      role="img"
      aria-label={`Bandiera di ${label}`}
      className="inline-flex h-3 w-5 shrink-0 items-center justify-center text-sm leading-none"
    >
      {flag}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400/80">
      {children}
    </p>
  );
}

function DataRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/5 py-0.5 text-[10px]">
      <span className="text-slate-500">{label}</span>
      <span
        className={`truncate font-bold ${
          highlight ? "text-amber-300" : "text-slate-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function AttributeValue({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-emerald-900/35 bg-black/10 px-2 py-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-semibold text-slate-400">
          {label}
        </span>
        <span className={`text-xs font-black ${getValueClass(value)}`}>
          {value}
        </span>
      </div>
      <div className="mt-0.5 h-0.5 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SpecialityRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/5 py-0.5">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className={`text-xs font-black ${getValueClass(value)}`}>
        {value}
      </span>
    </div>
  );
}

function LatestPerformance({
  performance,
}: {
  performance: LatestPerformance | null;
}) {
  if (!performance) {
    return (
      <div className="mt-1.5 rounded-md border border-dashed border-emerald-900/50 bg-black/10 px-2 py-1.5">
        <p className="text-[9px] font-black uppercase tracking-wide text-slate-600">
          Ultima valutazione
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          Nessuna partita registrata
        </p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 rounded-md border border-amber-400/15 bg-amber-400/5 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">
          Ultima valutazione
        </span>
        <span className="text-sm font-black text-amber-300">
          {formatDecimal(performance.performanceRating)}
        </span>
      </div>
      <p className="truncate text-[10px] text-slate-400">
        {formatDate(performance.playedAt)} · vs {performance.opponentClubName}
      </p>
      <p className="text-[9px] text-slate-600">
        {performance.teamScore}-{performance.opponentScore} · Slot {performance.formationSlot}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
  }).format(value);
}

function getValueClass(value: number) {
  if (value >= 90) return "text-amber-300";
  if (value >= 80) return "text-emerald-300";
  if (value >= 70) return "text-sky-300";
  if (value >= 60) return "text-lime-300";

  return "text-slate-300";
}
