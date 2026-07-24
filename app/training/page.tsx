import { players } from "@/app/data/players";

const SKILLS = [
  "Precisione",
  "Diretto",
  "Sponde",
  "Tattica",
  "Mentalità",
  "Difesa",
  "Realizzazione",
  "Creatività",
  "Misura",
];

const TRAINING_USAGE = [
  { usage: "Panchina", intensity: "15%" },
  { usage: "1 partita in coppia", intensity: "30%" },
  { usage: "2 partite in coppia", intensity: "60%" },
  { usage: "1 partita singola", intensity: "40%" },
  { usage: "Singolo + 1 coppia", intensity: "70%" },
  { usage: "Singolo + 2 coppie", intensity: "100%" },
];

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Titolo */}
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Sviluppo giocatori
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Allenamento
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Programma la sessione settimanale della prima squadra
          </p>
        </div>

        {/* Riepilogo */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Prossimo allenamento
            </p>
            <p className="mt-2 text-2xl font-bold">
              Mercoledì
            </p>
            <p className="mt-1 text-sm text-yellow-400">
              Ore 21:00
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Giocatori
            </p>
            <p className="mt-2 text-3xl font-bold">
              {players.length}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Prima squadra
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Allenatore
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              Livello 5
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Efficienza 100%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Stato
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              Programmabile
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Modificabile fino alle 20:59
            </p>
          </div>

        </div>

        {/* Impostazione allenamento */}
        <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-6">

          <div>
            <h2 className="text-lg font-bold">
              Programma settimanale
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Scegli le due caratteristiche da allenare questa settimana
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">

            {/* Primaria */}
            <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.05] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                    Focus primario
                  </p>
                  <h3 className="mt-1 text-xl font-bold">
                    Intensità 100%
                  </h3>
                </div>

                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400">
                  PRINCIPALE
                </span>
              </div>

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Caratteristica
              </label>

              <select
                defaultValue="Precisione"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
              >
                {SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {/* Secondaria */}
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Focus secondario
                  </p>
                  <h3 className="mt-1 text-xl font-bold">
                    Intensità 50%
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-400">
                  SECONDARIO
                </span>
              </div>

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Caratteristica
              </label>

              <select
                defaultValue="Tattica"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
              >
                {SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/5 bg-[#0f0f0f] p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="font-semibold">
                Impostazioni attuali
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Precisione 100% · Tattica 50%
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Salva allenamento
            </button>

          </div>
        </section>

        {/* Giocatori + intensità */}
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

          {/* Giocatori */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">

            <div className="border-b border-white/10 p-5">
              <h2 className="text-lg font-bold">
                Giocatori allenati
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                L'intensità individuale dipende dall'utilizzo in campionato
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-4">Giocatore</th>
                    <th className="px-4 py-4">Utilizzo</th>
                    <th className="px-4 py-4">Intensità</th>
                    <th className="px-5 py-4">Stato</th>
                  </tr>
                </thead>

                <tbody>
                  {players.map((player, index) => {
                    const usage = [
                      "Singolo + 2 coppie",
                      "Singolo + 1 coppia",
                      "2 partite in coppia",
                    ][index % 3];

                    const intensity = ["100%", "70%", "60%"][index % 3];

                    return (
                      <tr
                        key={player.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Overall {player.overall}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm text-zinc-300">
                          {usage}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-bold text-yellow-400">
                            {intensity}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            Allenabile
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </section>

          {/* Regole intensità */}
          <aside className="rounded-2xl border border-white/10 bg-[#141414] p-5">

            <h2 className="text-lg font-bold">
              Intensità di utilizzo
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Percentuale di allenamento ricevuta in base alle partite giocate
            </p>

            <div className="mt-5 space-y-3">
              {TRAINING_USAGE.map((item) => (
                <div
                  key={item.usage}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0f0f0f] px-4 py-3"
                >
                  <span className="text-sm text-zinc-300">
                    {item.usage}
                  </span>

                  <span className="font-bold text-yellow-400">
                    {item.intensity}
                  </span>
                </div>
              ))}
            </div>

          </aside>
        </div>

        {/* Informazioni */}
        <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">

          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
            Regole allenamento
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Sessione ogni mercoledì alle 21:00
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-400">
            Il focus primario viene allenato al 100% e il focus secondario al
            50%. L'efficacia finale dipende dall'utilizzo del giocatore e dal
            livello dell'allenatore. Le impostazioni possono essere modificate
            fino a un minuto prima della sessione.
          </p>

        </section>

      </div>
    </main>
  );
}