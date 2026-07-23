import { Match } from "../../types/match";
import { nextMatch } from "../../data/dashboard";
export default function NextMatchCard() {
  const match: Match = nextMatch;
  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400">
            {match.competition}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Prossima Partita
          </h2>
        </div>

        <div className="rounded-xl bg-emerald-700/20 px-4 py-2 text-sm font-semibold text-emerald-400">
          {match.date} • {match.time}
        </div>
      </div>

      {/* Squadre */}

      <div className="mb-8 grid grid-cols-3 items-center">

        {/* Casa */}

        <div className="flex flex-col items-center">

          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500 bg-zinc-800 text-3xl">
            🟢
          </div>

          <h3 className="text-lg font-semibold text-white">
            {match.homeClub.name}
          </h3>

          <p className="text-sm text-zinc-400">
            Casa
          </p>

        </div>

        {/* VS */}

        <div className="text-center">

          <div className="text-5xl font-black text-zinc-600">
            VS
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            {match.venue}
          </p>

        </div>

        {/* Ospite */}

        <div className="flex flex-col items-center">

          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-500 bg-zinc-800 text-3xl">
            🔴
          </div>

          <h3 className="text-lg font-semibold text-white">
            {match.awayClub.name}
          </h3>

          <p className="text-sm text-zinc-400">
            Trasferta
          </p>

        </div>

      </div>

      {/* Countdown */}

      <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-800 p-4">

        <div className="flex items-center justify-between">

          <span className="text-sm text-zinc-400">
            Mancano
          </span>

          <span className="text-2xl font-bold text-amber-400">
            1g 03h 18m
          </span>

        </div>

      </div>

      {/* Preparazione */}

      <div>

        <div className="mb-2 flex justify-between text-sm">

          <span className="text-zinc-400">
            Preparazione squadra
          </span>

          <span className="font-semibold text-white">
            {match.preparation}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-zinc-700">

          <div className="h-full rounded-full bg-emerald-500 transition-all"
               style={{ width: `${match.preparation}%` }}
/>

        </div>

      </div>

      {/* Stato */}

      <div className="mt-6 grid grid-cols-4 gap-4">

        <div className="rounded-xl bg-zinc-800 p-3 text-center">

          <p className="text-xs text-zinc-500">
            Morale
          </p>

          <p className="mt-1 font-bold text-emerald-400">
            {match.morale}
          </p>

        </div>

        <div className="rounded-xl bg-zinc-800 p-3 text-center">

          <p className="text-xs text-zinc-500">
            Forma
          </p>

          <p className="mt-1 font-bold text-emerald-400">
            {match.form}
          </p>

        </div>

        <div className="rounded-xl bg-zinc-800 p-3 text-center">

          <p className="text-xs text-zinc-500">
            Condizione
          </p>

          <p className="mt-1 font-bold text-emerald-400">
            {match.fitness}%
          </p>

        </div>

        <div className="rounded-xl bg-zinc-800 p-3 text-center">

          <p className="text-xs text-zinc-500">
            Assenze
          </p>

          <p className="mt-1 font-bold text-red-400">
            {match.absences}
          </p>

        </div>

      </div>

      {/* Pulsanti */}

      <div className="mt-auto flex gap-4 pt-8">

        <button className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500">
          Prepara Formazione
        </button>

        <button className="flex-1 rounded-xl border border-zinc-600 py-3 font-semibold text-zinc-200 transition hover:border-emerald-500 hover:text-white">
          Analizza Avversario
        </button>

      </div>

    </div>
  );
}