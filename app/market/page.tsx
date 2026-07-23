"use client";

import MarketHeader from "@/app/components/market/MarketHeader";
import MarketTabs from "@/app/components/market/MarketTabs";
import MarketPlayerCard from "@/app/components/market/MarketPlayerCard";
import MarketSidebar from "@/app/components/market/MarketSidebar";

import { useMarket } from "@/app/hooks/useMarket";

export default function MarketPage() {
  const {
    players,
    search,
    setSearch,
  } = useMarket();

  return (
    <div className="space-y-6">

      <MarketHeader
        search={search}
        setSearch={setSearch}
      />

      <MarketTabs />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        <div className="xl:col-span-3 space-y-4">

          {players.map((player) => (
            <MarketPlayerCard
              key={player.id}
              player={player}
            />
          ))}

        </div>

        <MarketSidebar />

      </div>

    </div>
  );
}