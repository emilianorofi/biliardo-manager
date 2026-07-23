"use client";

import { Eye, Clock3, FileText, Gavel, TrendingUp } from "lucide-react";
import OverallBadge from "../ui/OverallBadge";
import type { MarketPlayer } from "@/app/types/market";

interface MarketPlayerCardProps {
  player: MarketPlayer;
}

export default function MarketPlayerCard({
  player,
}: MarketPlayerCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-green-500 transition-all duration-200 p-5">

      <div className="flex items-start justify-between">

        {/* Giocatore */}
        <div className="flex gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-3xl border border-zinc-700">
            {player.avatar}
          </div>

          <div>

            <h2 className="text-lg font-bold text-white">
              {player.name}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {player.nationality} • {player.age} anni
            </p>

            <p className="mt-2 font-semibold text-green-400">
              € {player.value.toLocaleString("it-IT")}
            </p>

          </div>

        </div>

        {/* Overall */}

        <OverallBadge
          value={player.overall}
          size="lg"
        />

      </div>

      {/* Specialità */}

      <div className="mt-5 grid grid-cols-3 gap-3">

        <div className="rounded-xl bg-zinc-800 p-3 text-center">
          <p className="text-xs uppercase text-zinc-500">
            Italiana
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {player.italiana}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-800 p-3 text-center">
          <p className="text-xs uppercase text-zinc-500">
            Goriziana
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {player.goriziana}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-800 p-3 text-center">
          <p className="text-xs uppercase text-zinc-500">
            Tutti Doppi
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {player.tuttiDoppi}
          </p>
        </div>

      </div>

      {/* Info asta */}

      <div className="mt-5 grid grid-cols-3 gap-4">

        <div className="flex items-center gap-2 text-zinc-300">

          <Eye size={18} className="text-green-400" />

          <div>
            <p className="text-xs text-zinc-500">
              Interessati
            </p>

            <p className="font-semibold">
              {player.interested}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 text-zinc-300">

          <TrendingUp size={18} className="text-yellow-400" />

          <div>
            <p className="text-xs text-zinc-500">
              Ultima offerta
            </p>

            <p className="text-sm font-semibold">
              € {player.lastBid.toLocaleString("it-IT")}
            </p>

            <p className="text-xs text-zinc-500">
              {player.lastBidClub}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 text-zinc-300">

          <Clock3 size={18} className="text-red-400" />

          <div>
            <p className="text-xs text-zinc-500">
              Scadenza
            </p>

            <p className="font-semibold">
              {player.remainingTime}
            </p>
          </div>

        </div>

      </div>

      {/* Pulsanti */}

      <div className="mt-6 flex justify-end gap-3">

        <button className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition">
          <FileText size={18} />
          Scheda
        </button>

        <button className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
          <Gavel size={18} />
          Offri
        </button>

      </div>

    </div>
  );
}