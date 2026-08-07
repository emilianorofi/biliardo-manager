"use client";

import { useRouter } from "next/navigation";

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
  balance: number;
  availableCredits: number;
  userBids: MarketUserBid[];
}

export default function MarketContent({
  initialPlayers,
  balance,
  availableCredits,
  userBids,
}: MarketContentProps) {
  const router = useRouter();

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
        credits={availableCredits}
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
              availableCredits={availableCredits}
              onBidPlaced={() => router.refresh()}
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
          balance={balance}
          availableCredits={availableCredits}
          userBids={userBids}
        />
      </div>
    </div>
  );
}
