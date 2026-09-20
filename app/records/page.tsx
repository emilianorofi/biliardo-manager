import type { ReactNode } from "react";
import Link from "next/link";
import { Crown, Medal, Percent, Trophy, Users } from "lucide-react";

import CountryFlag from "@/app/components/player/CountryFlag";
import { getNationalityDisplay } from "@/lib/nationalities";
import {
  getWorldRecords,
  type WorldRecordPlayer,
} from "@/lib/world-records";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const records = await getWorldRecords();

  return (
    <main className="space-y-4 text-slate-100">
      <header className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-[linear-gradient(135deg,#30291d_0%,#173027_58%,#101e19_100%)] p-5 shadow-xl shadow-black/10 sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-amber-300">
            <Crown size={18} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Storia del mondo
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Record e albo d&apos;oro
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Le classifiche storiche vengono ricostruite dai risultati realmente
            registrati. Ranking attuale e record di carriera restano separati:
            qui conta ciò che un giocatore ha ottenuto nel tempo.
          </p>
        </div>
      </header>

      <section className="grid gap-3 xl:grid-cols-2">
        <RecordCard
          title="Più titoli"
          subtitle="Tutte le competizioni individuali e nazionali"
          icon={<Trophy size={17} />}
          rows={records.totalTitles}
          suffix=" titoli"
        />
        <RecordCard
          title="Campioni del Mondo"
          subtitle="Mondiali individuali vinti"
          icon={<Crown size={17} />}
          rows={records.worldTitles}
          suffix=" Mondiali"
        />
        <RecordCard
          title="Tornei individuali"
          subtitle="Prove Italiana, Goriziana e Tutti Doppi vinte"
          icon={<Medal size={17} />}
          rows={records.individualTitles}
          suffix=" vittorie"
        />
        <RecordCard
          title="Coppa Specialità"
          subtitle="Titoli nelle tre coppe di specialità"
          icon={<Medal size={17} />}
          rows={records.specialtyCupTitles}
          suffix=" coppe"
        />
        <RecordCard
          title="Coppa delle Nazioni"
          subtitle="Titoli conquistati rappresentando la propria nazionale"
          icon={<Trophy size={17} />}
          rows={records.nationsCupTitles}
          suffix=" coppe"
        />
        <RecordCard
          title="Presenze in campionato"
          subtitle="Giornate di campionato disputate"
          icon={<Users size={17} />}
          rows={records.appearances}
          suffix=" presenze"
        />
        <RecordCard
          title="Prove vinte"
          subtitle="Vittorie nelle sei prove delle giornate di campionato"
          icon={<Trophy size={17} />}
          rows={records.matchWins}
          suffix=" V"
        />
        <RecordCard
          title="Miglior percentuale"
          subtitle="Solo giocatori con almeno 20 prove di campionato"
          icon={<Percent size={17} />}
          rows={records.winRate}
          suffix="%"
        />
      </section>
    </main>
  );
}

function RecordCard({
  title,
  subtitle,
  icon,
  rows,
  suffix,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  rows: WorldRecordPlayer[];
  suffix: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
      <div className="border-b border-emerald-900/50 px-4 py-3">
        <div className="flex items-center gap-2 text-amber-300">
          {icon}
          <h2 className="text-sm font-black text-white">{title}</h2>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">{subtitle}</p>
      </div>

      {rows.length > 0 ? (
        <div className="divide-y divide-emerald-900/40">
          {rows.map((row, index) => {
            const nationality = getNationalityDisplay(row.nationality);
            return (
              <div
                key={row.playerId}
                className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2.5"
              >
                <span className={positionClass(index + 1)}>
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/players/${row.playerId}`}
                    className="truncate text-xs font-black text-white transition hover:text-amber-200 hover:underline"
                  >
                    {row.firstName} {row.lastName}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-500">
                    <CountryFlag code={nationality.code} label={nationality.label} className="h-3 w-4" />
                    <span>{nationality.label}</span>
                    {row.detail ? <span>· {row.detail}</span> : null}
                  </div>
                </div>
                <p className="text-sm font-black tabular-nums text-amber-300">
                  {formatValue(row.value)}{suffix}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-xs text-slate-500">
          Nessun record ancora disponibile.
        </div>
      )}
    </article>
  );
}

function positionClass(position: number) {
  const base =
    "inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black";
  if (position === 1) return `${base} border-amber-300/40 bg-amber-300/15 text-amber-200`;
  if (position === 2) return `${base} border-slate-300/30 bg-slate-300/10 text-slate-200`;
  if (position === 3) return `${base} border-orange-400/30 bg-orange-400/10 text-orange-300`;
  return `${base} border-emerald-900/60 bg-emerald-950/35 text-slate-400`;
}

function formatValue(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
  }).format(value);
}
