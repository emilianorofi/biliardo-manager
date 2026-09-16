import { CalendarDays, Medal, Target, Trophy, Users } from "lucide-react";

import {
  getSpecialtyCupAssignment,
  type SpecialtyCupType,
} from "@/lib/specialty-cup-assignment";
import {
  SPECIALTY_CUP_NAME,
  SPECIALTY_CUP_SEASON_WEEK,
} from "@/lib/specialty-cup-calendar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const cups: Array<{
  type: SpecialtyCupType;
  name: string;
  specialty: string;
  description: string;
}> = [
  {
    type: "ITALIANA",
    name: "Coppa Italiana",
    specialty: "Italiana",
    description:
      "Tabellone riservato ai giocatori assegnati alla specialità Italiana.",
  },
  {
    type: "GORIZIANA",
    name: "Coppa Goriziana",
    specialty: "Goriziana",
    description:
      "Tabellone riservato ai giocatori assegnati alla specialità Goriziana.",
  },
  {
    type: "TUTTI_DOPPI",
    name: "Coppa Tutti Doppi",
    specialty: "Tutti Doppi",
    description:
      "Tabellone riservato ai giocatori assegnati alla specialità Tutti Doppi.",
  },
];

export default async function SpecialtyCupPage() {
  const players = await prisma.player.findMany({
    where: {
      careerStatus: "ACTIVE",
      clubId: { not: null },
    },
    select: {
      id: true,
      precisione: true,
      diretto: true,
      sponde: true,
    },
  });

  const counts: Record<SpecialtyCupType, number> = {
    ITALIANA: 0,
    GORIZIANA: 0,
    TUTTI_DOPPI: 0,
  };

  for (const player of players) {
    const specialtyValues = {
      italiana: (player.precisione + player.diretto) / 2,
      goriziana: (player.precisione + player.sponde) / 2,
      tuttiDoppi: (player.diretto + player.sponde) / 2,
    };

    const assignment = getSpecialtyCupAssignment({
      id: player.id,
      specialties: specialtyValues,
      attributes: {
        precisione: player.precisione,
        diretto: player.diretto,
        sponde: player.sponde,
      },
    });

    counts[assignment] += 1;
  }

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
          della prima squadra viene assegnato alla coppa della specialità in cui
          esprime il suo valore migliore nella stagione corrente. I giocatori
          dell’Accademia non partecipano.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Metric icon={<Trophy size={16} />} label="Coppe" value="3" />
          <Metric
            icon={<CalendarDays size={16} />}
            label="Settimana"
            value={String(SPECIALTY_CUP_SEASON_WEEK)}
          />
          <Metric
            icon={<Users size={16} />}
            label="Giocatori iscritti"
            value={String(players.length)}
          />
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
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm leading-6 text-zinc-400">{cup.description}</p>
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-black text-amber-300">
                    {counts[cup.type]}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                    iscritti
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-black/15 px-3 py-3 text-xs text-zinc-500">
                Il numero viene ricalcolato dai valori correnti dei giocatori.
                Il tabellone sarà generato nel passo successivo.
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="font-black text-white">Regola di assegnazione stagionale</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          L’iscrizione non è permanente. A ogni nuova stagione vengono riletti i
          valori aggiornati del giocatore: Italiana usa Precisione e Diretto,
          Goriziana usa Precisione e Sponde, Tutti Doppi usa Diretto e Sponde.
          Se la specialità migliore cambia, cambia automaticamente anche la Coppa
          di iscrizione. In caso di parità vengono applicati gli spareggi sulle
          caratteristiche distintive già definiti, con fallback deterministico.
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
