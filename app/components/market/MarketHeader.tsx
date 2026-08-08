"use client";

import { Coins, Search } from "lucide-react";

interface MarketHeaderProps {
  credits: number;
  search: string;
  setSearch: (value: string) => void;
}

export default function MarketHeader({
  credits,
  search,
  setSearch,
}: MarketHeaderProps) {
  return (
    <header className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_minmax(280px,420px)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Trasferimenti
          </p>

          <h1 className="mt-0.5 text-2xl font-black text-white">
            Mercato
          </h1>
        </div>

        <label className="relative block">
          <span className="sr-only">Cerca giocatore</span>

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Cerca giocatore o club..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-green-500"
          />
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5">
          <Coins size={20} className="text-yellow-400" />

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Disponibile
            </p>

            <p className="text-base font-black text-yellow-400">
              € {credits.toLocaleString("it-IT")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
