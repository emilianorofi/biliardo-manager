"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import MarketHeader from "@/app/components/market/MarketHeader";
import MarketHistory from "@/app/components/market/MarketHistory";
import MarketPlayerCard from "@/app/components/market/MarketPlayerCard";
import MarketSidebar from "@/app/components/market/MarketSidebar";
import MarketTabs from "@/app/components/market/MarketTabs";
import { useMarket } from "@/app/hooks/useMarket";
import type {
  MarketHistoryItem,
  MarketPlayer,
  MarketUserBid,
  MarketUserListing,
} from "@/app/types/market";

interface MarketContentProps {
  initialPlayers: MarketPlayer[];
  balance: number;
  availableCredits: number;
  canAddAnotherPlayer: boolean;
  userBids: MarketUserBid[];
  userListings: MarketUserListing[];
  historyItems: MarketHistoryItem[];
}

export default function MarketContent({
  initialPlayers,
  balance,
  availableCredits,
  canAddAnotherPlayer,
  userBids,
  userListings,
  historyItems,
}: MarketContentProps) {
  const router = useRouter();
  const [settlementMessage, setSettlementMessage] =
    useState<string | null>(null);
  const [settlementError, setSettlementError] =
    useState<string | null>(null);
  const [marketActionMessage, setMarketActionMessage] =
    useState<string | null>(null);

  const {
    players,
    search,
    setSearch,
    activeTab,
    setActiveTab,
  } = useMarket(initialPlayers);

  const filteredHistory = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (normalizedSearch.length === 0) {
      return historyItems;
    }

    return historyItems.filter((item) =>
      [item.playerName, item.counterpartClub]
        .filter(
          (value): value is string => value !== null
        )
        .some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        )
    );
  }, [historyItems, search]);

  useEffect(() => {
    let isCancelled = false;

    async function settleAuctions() {
      try {
        const response = await fetch(
          "/api/market/settle",
          {
            method: "POST",
          }
        );

        const data: {
          settledCount?: number;
          pendingCount?: number;
          error?: string;
        } = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Impossibile chiudere le aste scadute."
          );
        }

        if (
          !isCancelled &&
          ((data.settledCount ?? 0) > 0 ||
            (data.pendingCount ?? 0) > 0)
        ) {
          const messages: string[] = [];

          if ((data.settledCount ?? 0) > 0) {
            messages.push(
              data.settledCount === 1
                ? "Un'asta scaduta è stata completata."
                : `${data.settledCount} aste scadute sono state completate.`
            );
          }

          if ((data.pendingCount ?? 0) > 0) {
            messages.push(
              data.pendingCount === 1
                ? "Un trasferimento attende la fine della partita in corso."
                : `${data.pendingCount} trasferimenti attendono la fine delle partite in corso.`
            );
          }

          setSettlementMessage(messages.join(" "));
          router.refresh();
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setSettlementError(
            error instanceof Error
              ? error.message
              : "Impossibile chiudere le aste scadute."
          );
        }
      }
    }

    settleAuctions();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <div className="space-y-6">
      {settlementMessage && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {settlementMessage}
        </div>
      )}

      {settlementError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {settlementError}
        </div>
      )}

      {marketActionMessage && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {marketActionMessage}
        </div>
      )}

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
          {activeTab === "history" ? (
            <MarketHistory items={filteredHistory} />
          ) : (
            <>
              {players.map((player) => (
                <MarketPlayerCard
                  key={player.listingId}
                  player={player}
                  availableCredits={availableCredits}
                  canAddAnotherPlayer={
                    canAddAnotherPlayer
                  }
                  onMarketAction={(message) => {
                    setMarketActionMessage(message);
                    router.refresh();
                  }}
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
            </>
          )}
        </div>

        <MarketSidebar
          balance={balance}
          availableCredits={availableCredits}
          userBids={userBids}
          userListings={userListings}
        />
      </div>
    </div>
  );
}
