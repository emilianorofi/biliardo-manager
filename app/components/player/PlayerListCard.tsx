import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Player } from "../../types/player";

type Props = {
  player: Player;
  clubColors?: {
    primary: string;
    secondary: string;
  };
};

export default function PlayerListCard({
  player,
  clubColors = {
    primary: "#10b981",
    secondary: "#fbbf24",
  },
}: Props) {
  const fullName = `${player.firstName} ${player.lastName}`;
  const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;

  return (
    <Link
      href={`/players/${player.id}`}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1712]"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-900/60 bg-[linear-gradient(145deg,#183129_0%,#12231d_60%,#101e19_100%)] shadow-md shadow-black/10 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-amber-400/45 group-hover:shadow-xl group-hover:shadow-black/25">
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${clubColors.primary}, ${clubColors.secondary})`,
          }}
        />

        <div className="relative flex-1 p-4">
          <div
            className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: clubColors.secondary }}
          />

          <div className="relative flex items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 text-sm font-black text-white shadow-md shadow-black/20"
              style={{
                background: `linear-gradient(145deg, ${clubColors.primary}, ${clubColors.secondary})`,
              }}
            >
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-black text-white transition group-hover:text-amber-200">
                {fullName}
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {player.nationality} · {player.age} anni
              </p>

              <p className="mt-1.5 truncate text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300/80">
                {player.style[0] ?? "Profilo da definire"}
              </p>
            </div>

            <div className="shrink-0 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/35 bg-amber-300/10 text-lg font-black text-amber-300">
                {player.overall}
              </div>

              <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-600">
                Overall
              </p>
            </div>
          </div>

          <div className="relative mt-3 grid grid-cols-3 gap-2">
            <Status label="Forma" value={`${player.form}/10`} />
            <Status label="Morale" value={`${player.morale}/10`} />
            <Status label="Esperienza" value={player.experience} />
          </div>

          <div className="relative mt-3 grid grid-cols-3 gap-2 rounded-xl border border-emerald-900/40 bg-black/15 p-2">
            <Speciality label="Italiana" value={player.specialties.italiana} />
            <Speciality label="Goriziana" value={player.specialties.goriziana} />
            <Speciality label="Tutti doppi" value={player.specialties.tuttiDoppi} />
          </div>
        </div>

        <footer className="flex items-center gap-4 border-t border-emerald-900/45 bg-black/10 px-4 py-2.5">
          <FinancialValue label="Valore" value={formatCurrency(player.value)} highlight />
          <FinancialValue label="Stipendio" value={formatCurrency(player.salary)} />

          <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-amber-300/75 transition group-hover:translate-x-0.5 group-hover:text-amber-200">
            Dettagli
            <ArrowUpRight size={13} />
          </span>
        </footer>
      </article>
    </Link>
  );
}

function Status({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/35 px-2 py-2 text-center">
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-black text-white">{value}</p>
    </div>
  );
}

function Speciality({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 text-center">
      <p className={`text-sm font-black ${getValueClass(value)}`}>{value}</p>

      <p className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

function FinancialValue({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className={`truncate text-xs font-black ${highlight ? "text-amber-300" : "text-slate-300"}`}>
        {value}
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

function getValueClass(value: number) {
  if (value >= 90) return "text-amber-300";
  if (value >= 80) return "text-emerald-300";
  if (value >= 70) return "text-sky-300";

  return "text-slate-300";
}
