"use client";

import MarketHeader from "@/app/components/market/MarketHeader";
import MarketPlayerCard from "@/app/components/market/MarketPlayerCard";
import MarketSidebar from "@/app/components/market/MarketSidebar";
import MarketTabs from "@/app/components/market/MarketTabs";
import { useMarket } from "@/app/hooks/useMarket";
import type {
  MarketPlayer,
  MarketUserBid,
} from "@/app/types/market";

interface MarketContentProps {
  initialPlayers: MarketPlayer[];
  credits: number;
  userBids: MarketUserBid[];
}

export default function MarketContent({
  initialPlayers,
  credits,
  userBids,
}: MarketContentProps) {
  const {
    players,
    search,
    setSearch,
    activeTab,
    setActiveTab,
  } = useMarket(initialPlayers);

  return (
    <div className="space-y-6">
      <MarketHeader
        credits={credits}
        search={search}
        setSearch={setSearch}
      />

      <MarketTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="space-y-4 xl:col-span-3">
          {players.map((player) => (
            <MarketPlayerCard
              key={player.listingId}
              player={player}
            />
          ))}

          {players.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <p className="font-semibold text-white">
                Nessun giocatore trovato.
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Prova a modificare la ricerca o la categoria.
              </p>
            </div>
          )}
        </div>

        <MarketSidebar
          credits={credits}
          userBids={userBids}
        />
      </div>
    </div>
  );
}
