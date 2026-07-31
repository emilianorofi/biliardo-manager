import type {
  ReactNode,
} from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import {
  USER_CLUB_ID,
} from "@/lib/game-config";

import { prisma } from "@/lib/prisma";

export default async function FinancePage() {
  const club =
    await prisma.club.findUnique({
      where: {
        id:
          USER_CLUB_ID,
      },

      select: {
        name:
          true,

        balance:
          true,

        weeklyIncome:
          true,

        weeklyExpenses:
          true,
      },
    });

  if (!club) {
    return (
      <main className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h1 className="text-2xl font-black text-white">
          Finanze non disponibili
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Il club principale non è stato trovato.
        </p>
      </main>
    );
  }

  const weeklyBalance =
    club.weeklyIncome -
    club.weeklyExpenses;

  const projectedBalance =
    club.balance +
    weeklyBalance;

  const transactions = [
    {
      id:
        "weekly-income",

      description:
        "Entrate complessive del club",

      category:
        "Entrate",

      amount:
        club.weeklyIncome,
    },

    {
      id:
        "weekly-expenses",

      description:
        "Uscite complessive del club",

      category:
        "Uscite",

      amount:
        -club.weeklyExpenses,
    },
  ];

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-bold text-amber-400">
          Gestione economica
        </p>

        <h1 className="mt-1 text-3xl font-black text-white">
          Finanze
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Situazione economica di{" "}
          {club.name}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Saldo disponibile"
          value={formatCurrency(
            club.balance
          )}
          description="Disponibilità attuale"
          icon={
            <WalletCards
              size={22}
            />
          }
          tone="amber"
        />

        <SummaryCard
          label="Entrate settimanali"
          value={formatSignedCurrency(
            club.weeklyIncome
          )}
          description="Totale delle entrate"
          icon={
            <ArrowUpRight
              size={22}
            />
          }
          tone="emerald"
        />

        <SummaryCard
          label="Uscite settimanali"
          value={formatSignedCurrency(
            -club.weeklyExpenses
          )}
          description="Totale delle spese"
          icon={
            <ArrowDownRight
              size={22}
            />
          }
          tone="red"
        />

        <SummaryCard
          label="Risultato settimanale"
          value={formatSignedCurrency(
            weeklyBalance
          )}
          description="Entrate meno uscite"
          icon={
            weeklyBalance >= 0 ? (
              <ArrowUpRight
                size={22}
              />
            ) : (
              <ArrowDownRight
                size={22}
              />
            )
          }
          tone={
            weeklyBalance >= 0
              ? "emerald"
              : "red"
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
          <div className="border-b border-emerald-900/60 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <ReceiptText
                  size={22}
                />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  Movimenti settimanali
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Riepilogo delle entrate e delle uscite
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="border-b border-emerald-900/50 bg-emerald-950/30">
                <tr className="text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 sm:px-6">
                    Periodo
                  </th>

                  <th className="px-4 py-4">
                    Descrizione
                  </th>

                  <th className="px-4 py-4">
                    Categoria
                  </th>

                  <th className="px-5 py-4 text-right sm:px-6">
                    Importo
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (
                    transaction
                  ) => (
                    <tr
                      key={
                        transaction.id
                      }
                      className="border-b border-emerald-900/40 last:border-0"
                    >
                      <td className="px-5 py-5 text-sm text-slate-400 sm:px-6">
                        Settimana corrente
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-bold text-white">
                          {
                            transaction.description
                          }
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`rounded-lg border px-3 py-1 text-xs font-bold ${
                            transaction.amount >=
                            0
                              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                              : "border-red-500/25 bg-red-500/10 text-red-300"
                          }`}
                        >
                          {
                            transaction.category
                          }
                        </span>
                      </td>

                      <td
                        className={`px-5 py-5 text-right font-black sm:px-6 ${
                          transaction.amount >=
                          0
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {formatSignedCurrency(
                          transaction.amount
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <Landmark
                  size={22}
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Riepilogo
                </p>

                <h2 className="text-xl font-black text-white">
                  Settimana corrente
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <FinancialRow
                label="Entrate"
                value={formatSignedCurrency(
                  club.weeklyIncome
                )}
                tone="positive"
              />

              <FinancialRow
                label="Uscite"
                value={formatSignedCurrency(
                  -club.weeklyExpenses
                )}
                tone="negative"
              />

              <FinancialRow
                label="Risultato"
                value={formatSignedCurrency(
                  weeklyBalance
                )}
                tone={
                  weeklyBalance >= 0
                    ? "positive"
                    : "negative"
                }
                last
              />
            </div>
          </section>

          <section
            className={`rounded-2xl border p-5 sm:p-6 ${
              weeklyBalance >= 0
                ? "border-emerald-500/25 bg-emerald-500/5"
                : "border-red-500/25 bg-red-500/5"
            }`}
          >
            <p
              className={`text-xs font-black uppercase tracking-[0.18em] ${
                weeklyBalance >= 0
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              Previsione
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              {weeklyBalance >= 0
                ? "Situazione economica positiva"
                : "Situazione economica negativa"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Mantenendo l’attuale andamento, il saldo previsto al termine della prossima settimana sarà:
            </p>

            <p
              className={`mt-4 text-3xl font-black ${
                projectedBalance >= 0
                  ? "text-amber-300"
                  : "text-red-300"
              }`}
            >
              {formatCurrency(
                projectedBalance
              )}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone:
    | "amber"
    | "emerald"
    | "red";
}) {
  const tones = {
    amber: {
      border:
        "border-amber-400/25",

      background:
        "bg-amber-400/5",

      text:
        "text-amber-300",
    },

    emerald: {
      border:
        "border-emerald-500/25",

      background:
        "bg-emerald-500/5",

      text:
        "text-emerald-300",
    },

    red: {
      border:
        "border-red-500/25",

      background:
        "bg-red-500/5",

      text:
        "text-red-300",
    },
  };

  const style =
    tones[tone];

  return (
    <article
      className={`rounded-2xl border p-5 ${style.border} ${style.background}`}
    >
      <div
        className={`flex items-center gap-2 ${style.text}`}
      >
        {icon}

        <p className="text-xs font-black uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p
        className={`mt-3 text-2xl font-black ${style.text}`}
      >
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </article>
  );
}

function FinancialRow({
  label,
  value,
  tone,
  last = false,
}: {
  label: string;
  value: string;
  tone:
    | "positive"
    | "negative";
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        last
          ? ""
          : "border-b border-emerald-900/50 pb-4"
      }`}
    >
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span
        className={`font-black ${
          tone === "positive"
            ? "text-emerald-300"
            : "text-red-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",

      currency:
        "EUR",

      maximumFractionDigits:
        0,
    }
  ).format(value);
}

function formatSignedCurrency(
  value: number
): string {
  const formatted =
    formatCurrency(
      Math.abs(value)
    );

  if (value > 0) {
    return `+ ${formatted}`;
  }

  if (value < 0) {
    return `- ${formatted}`;
  }

  return formatted;
}