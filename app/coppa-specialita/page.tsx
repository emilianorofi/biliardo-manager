import { CalendarDays, Medal, Target, Trophy, Users } from "lucide-react";

import {
  SPECIALTY_CUP_NAME,
  SPECIALTY_CUP_SEASON_WEEK,
} from "@/lib/specialty-cup-calendar";

export const dynamic = "force-dynamic";

const cups = [
  {
    name: "Coppa Italiana",
    specialty: "Italiana",
    description:
      "Tabellone riservato ai giocatori assegnati alla specialità Italiana.",
  },
  {
    name: "Coppa Goriziana",
    specialty: "Goriziana",
    description:
      "Tabellone riservato ai giocatori assegnati alla specialità Goriziana.",
  },
  {
    name: "Coppa Tutti Doppi",
    specialty: "Tutti Doppi",
    description:
      "Tabellone riservato ai giocatori assegnati alla specialità Tutti Doppi.",
  },
];

export default function SpecialtyCupPage() {
  return (
    <main className="space-y-4 text-zinc-100">
      <header className="rounded-3xl border border-amber-400/20 bg-[linear-gradient(135deg,#312816_0%,#263018_58%,#101d18_100%)] p-6">
        <div className="flex items-center gap-2 text-amber-300">
          <Medal size={17} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Settimana {SPECIALTY_CUP_SEASON_WEEK}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-black text-white">
          {SPECIALTY_CUP_NAME}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Tre coppe separate, una per ciascuna specialità. Ogni giocatore attivo
          viene inserito nella coppa della specialità in cui esprime il suo
          Overall migliore. I giocatori dell’Accademia non partecipano.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Metric icon={<Trophy size={16} />} label="Coppe" value="3" />
          <Metric
            icon={<CalendarDays size={16} />}
            label="Settimana"
            value={String(SPECIALTY_CUP_SEASON_WEEK)}
          />
          <Metric icon={<Users size={16} />} label="Accesso" value="Automatico" />
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        {cups.map((cup) => (
          <article
            key={cup.name}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
          >
            <div className="border-b border-zinc-800 px-4 py-4">
              <div className="flex items-center gap-2 text-amber-300">
                <Target size={15} />
                <span className="text-[9px] font-black uppercase tracking-[0.18em]">
                  {cup.specialty}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-black text-white">{cup.name}</h2>
            </div>
            <div className="p-4">
              <p className="text-sm leading-6 text-zinc-400">{cup.description}</p>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-black/15 px-3 py-3 text-xs text-zinc-500">
                Tabellone e partecipanti saranno pubblicati quando il sorteggio
                della Coppa Specialità sarà disponibile.
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="font-black text-white">Regola di assegnazione</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Ogni giocatore della prima squadra viene assegnato automaticamente a
          una sola delle tre coppe in base alla sua specialità con Overall più
          alto. In caso di parità, il criterio di spareggio verrà definito insieme
          alla logica del sorteggio, nel passo successivo.
        </p>
      </section>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-3">
      <div className="flex items-center gap-2 text-amber-300">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
