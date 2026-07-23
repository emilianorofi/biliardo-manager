"use client";

import {
  Coins,
  Gavel,
  Eye,
  Bell,
  ArrowUpRight,
} from "lucide-react";

export default function MarketSidebar() {
  return (
    <aside className="space-y-5">

      {/* Crediti */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-green-600 p-3">
            <Coins className="text-white" size={22} />
          </div>

          <div>
            <p className="text-sm text-zinc-400">
              Crediti disponibili
            </p>

            <h2 className="text-2xl font-bold text-white">
              € 2.485.000
            </h2>
          </div>

        </div>

      </div>

      {/* Aste */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <div className="mb-4 flex items-center gap-2">

          <Gavel className="text-green-400" size={20} />

          <h3 className="font-semibold text-white">
            Le mie aste
          </h3>

        </div>

        <div className="space-y-3">

          <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-3">

            <div>
              <p className="font-medium text-white">
                Marco Rossi
              </p>

              <p className="text-xs text-zinc-500">
                Scade tra 2h 31m
              </p>
            </div>

            <ArrowUpRight className="text-green-400" size={18} />

          </div>

          <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-3">

            <div>
              <p className="font-medium text-white">
                Luca Bianchi
              </p>

              <p className="text-xs text-zinc-500">
                Scade tra 5h 12m
              </p>
            </div>

            <ArrowUpRight className="text-green-400" size={18} />

          </div>

        </div>

      </div>

      {/* Osservati */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <div className="mb-4 flex items-center gap-2">

          <Eye className="text-yellow-400" size={20} />

          <h3 className="font-semibold text-white">
            Osservati
          </h3>

        </div>

        <div className="space-y-2">

          <p className="rounded-lg bg-zinc-800 p-3 text-white">
            Francesco Galli
          </p>

          <p className="rounded-lg bg-zinc-800 p-3 text-white">
            Paolo Verdi
          </p>

          <p className="rounded-lg bg-zinc-800 p-3 text-white">
            Andrea Neri
          </p>

        </div>

      </div>

      {/* Notifiche */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

        <div className="mb-4 flex items-center gap-2">

          <Bell className="text-blue-400" size={20} />

          <h3 className="font-semibold text-white">
            Notifiche
          </h3>

        </div>

        <div className="space-y-3 text-sm">

          <div className="rounded-xl bg-zinc-800 p-3 text-zinc-300">
            Hai superato un'offerta per <strong>Marco Rossi</strong>.
          </div>

          <div className="rounded-xl bg-zinc-800 p-3 text-zinc-300">
            È iniziata l'asta di <strong>Francesco Galli</strong>.
          </div>

          <div className="rounded-xl bg-zinc-800 p-3 text-zinc-300">
            Hai vinto l'asta di <strong>Luca Bianchi</strong>.
          </div>

        </div>

      </div>

    </aside>
  );
}