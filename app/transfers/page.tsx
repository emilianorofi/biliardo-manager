import { club, players } from "@/lib/mock";

const MARKET_PLAYERS = [
  {
    id: 1,
    name: "Matteo Ricci",
    age: 27,
    nationality: "Italia",
    overall: 86,
    precision: 90,
    direct: 85,
    banks: 88,
    currentBid: 42500,
    timeLeft: "18h 24m",
    bids: 7,
  },
  {
    id: 2,
    name: "Davide Moretti",
    age: 31,
    nationality: "Italia",
    overall: 83,
    precision: 85,
    direct: 88,
    banks: 79,
    currentBid: 31000,
    timeLeft: "1g 6h",
    bids: 4,
  },
  {
    id: 3,
    name: "Lorenzo Ferri",
    age: 22,
    nationality: "Italia",
    overall: 78,
    precision: 81,
    direct: 76,
    banks: 82,
    currentBid: 18500,
    timeLeft: "2g 11h",
    bids: 2,
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TransfersPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page heading */}
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Mercato giocatori
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Trasferimenti
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Cerca giocatori, partecipa alle aste e gestisci il mercato di{" "}
            {club.name}
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Disponibilità
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {formatMoney(club.balance)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Budget disponibile
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rosa
            </p>
            <p className="mt-2 text-3xl font-bold">
              {players.length}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Giocatori in prima squadra
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Aste attive
            </p>
            <p className="mt-2 text-3xl font-bold">
              0
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Le tue offerte attuali
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Mercato
            </p>
            <p className="mt-2 text-3xl font-bold">
              {MARKET_PLAYERS.length}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Giocatori disponibili
            </p>
          </div>

        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">

            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cerca giocatore
              </label>
              <input
                type="text"
                placeholder="Nome del giocatore..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Età massima
              </label>
              <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none xl:w-40">
                <option>Tutte</option>
                <option>Under 21</option>
                <option>Under 25</option>
                <option>Under 30</option>
                <option>Under 40</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Overall minimo
              </label>
              <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none xl:w-40">
                <option>Tutti</option>
                <option>70+</option>
                <option>75+</option>
                <option>80+</option>
                <option>85+</option>
                <option>90+</option>
              </select>
            </div>

            <button
              type="button"
              className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Cerca
            </button>

          </div>
        </section>

        {/* Market table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">

          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-lg font-bold">
                Mercato trasferimenti
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Aste giocatori attualmente disponibili
              </p>
            </div>

            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
              Aste 72 ore
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">

              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-4">Giocatore</th>
                  <th className="px-4 py-4">Età</th>
                  <th className="px-4 py-4">Naz.</th>
                  <th className="px-4 py-4">OVR</th>
                  <th className="px-4 py-4">Precisione</th>
                  <th className="px-4 py-4">Diretto</th>
                  <th className="px-4 py-4">Sponde</th>
                  <th className="px-4 py-4">Offerta</th>
                  <th className="px-4 py-4">Scadenza</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {MARKET_PLAYERS.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {player.bids} offerte
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-zinc-300">
                      {player.age}
                    </td>

                    <td className="px-4 py-4 text-sm text-zinc-300">
                      {player.nationality}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-1 font-bold text-yellow-400">
                        {player.overall}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {player.precision}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {player.direct}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {player.banks}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {formatMoney(player.currentBid)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-yellow-400">
                        {player.timeLeft}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
                      >
                        Fai offerta
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </section>

        {/* Market rules */}
        <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <h2 className="text-lg font-bold">
            Regole del mercato
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-white/5 bg-[#0f0f0f] p-4">
              <p className="font-semibold text-yellow-400">
                Durata asta
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Ogni giocatore rimane sul mercato per 72 ore.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0f0f0f] p-4">
              <p className="font-semibold text-yellow-400">
                Rilancio finale
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Un'offerta negli ultimi 3 minuti estende automaticamente
                l'asta di altri 3 minuti.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0f0f0f] p-4">
              <p className="font-semibold text-yellow-400">
                Vincitore
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Alla scadenza il giocatore viene assegnato alla squadra con
                l'offerta più alta.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}