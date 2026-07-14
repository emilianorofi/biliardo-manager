import { club } from "@/lib/mock";

const TRANSACTIONS = [
  {
    id: 1,
    date: "14 Lug",
    description: "Entrate sponsor",
    category: "Sponsor",
    amount: 5200,
  },
  {
    id: 2,
    date: "13 Lug",
    description: "Incasso giornata di campionato",
    category: "Partita",
    amount: 8400,
  },
  {
    id: 3,
    date: "10 Lug",
    description: "Costi gestione club",
    category: "Gestione",
    amount: -2750,
  },
  {
    id: 4,
    date: "9 Lug",
    description: "Staff tecnico",
    category: "Staff",
    amount: -3500,
  },
  {
    id: 5,
    date: "7 Lug",
    description: "Entrate sponsor",
    category: "Sponsor",
    amount: 5200,
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FinancePage() {
  const weeklyIncome = 13600;
  const weeklyExpenses = 8750;
  const weeklyBalance = weeklyIncome - weeklyExpenses;

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Titolo */}
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Gestione economica
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Finanze
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Situazione economica di {club.name}
          </p>
        </div>

        {/* Riepilogo */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Saldo
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {formatMoney(club.balance)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Disponibilità attuale
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Entrate settimanali
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              + {formatMoney(weeklyIncome)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Totale entrate
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Uscite settimanali
            </p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              - {formatMoney(weeklyExpenses)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Totale spese
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Bilancio settimanale
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              + {formatMoney(weeklyBalance)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Entrate meno uscite
            </p>
          </div>

        </div>

        {/* Sezione centrale */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* Movimenti */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">

            <div className="border-b border-white/10 p-5">
              <h2 className="text-lg font-bold">
                Ultimi movimenti
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Entrate e uscite recenti del club
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">

                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-4">Data</th>
                    <th className="px-4 py-4">Descrizione</th>
                    <th className="px-4 py-4">Categoria</th>
                    <th className="px-5 py-4 text-right">Importo</th>
                  </tr>
                </thead>

                <tbody>
                  {TRANSACTIONS.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {transaction.date}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-white">
                          {transaction.description}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300">
                          {transaction.category}
                        </span>
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-bold ${
                          transaction.amount >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {formatMoney(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </section>

          {/* Riepilogo settimanale */}
          <aside className="space-y-4">

            <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <h2 className="text-lg font-bold">
                Entrate settimanali
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-400">
                    Sponsor
                  </span>
                  <span className="font-semibold text-emerald-400">
                    + {formatMoney(5200)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-400">
                    Partite
                  </span>
                  <span className="font-semibold text-emerald-400">
                    + {formatMoney(8400)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    Totale
                  </span>
                  <span className="font-bold text-emerald-400">
                    + {formatMoney(weeklyIncome)}
                  </span>
                </div>

              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <h2 className="text-lg font-bold">
                Uscite settimanali
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-400">
                    Gestione club
                  </span>
                  <span className="font-semibold text-red-400">
                    - {formatMoney(2750)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-400">
                    Staff
                  </span>
                  <span className="font-semibold text-red-400">
                    - {formatMoney(3500)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-400">
                    Accademia
                  </span>
                  <span className="font-semibold text-red-400">
                    - {formatMoney(2500)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    Totale
                  </span>
                  <span className="font-bold text-red-400">
                    - {formatMoney(weeklyExpenses)}
                  </span>
                </div>

              </div>
            </section>

          </aside>
        </div>

        {/* Previsione */}
        <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Previsione
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Situazione economica positiva
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Mantenendo l'attuale andamento, il club chiuderà la prossima
                settimana con un saldo positivo.
              </p>
            </div>

            <div className="rounded-xl border border-yellow-400/20 bg-black/20 px-5 py-3 text-right">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Saldo previsto
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {formatMoney(club.balance + weeklyBalance)}
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}