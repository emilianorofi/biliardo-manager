"use client";

import { Search, Filter, Coins } from "lucide-react";

interface MarketHeaderProps {
  credits?: number;
  search: string;
  setSearch: (value: string) => void;
}

export default function MarketHeader({
  credits = 2485000,
  search,
  setSearch,
}: MarketHeaderProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Mercato
          </h1>

          <p className="mt-1 text-zinc-400">
            Acquista i migliori giocatori disponibili.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3">

          <Coins
            size={24}
            className="text-yellow-400"
          />

          <div>

            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Crediti
            </p>

            <p className="text-xl font-bold text-yellow-400">
              € {credits.toLocaleString("it-IT")}
            </p>

          </div>

        </div>

      </div>

      <div className="mt-6 flex gap-3">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cerca giocatore..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition focus:border-green-500"
          />

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-green-600 px-5 font-semibold text-white transition hover:bg-green-700">

          <Filter size={18} />

          Filtri

        </button>

      </div>

    </div>
  );
}