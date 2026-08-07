"use client";

import { useMemo, useState } from "react";
import type {
  MarketPlayer,
  MarketTab,
} from "@/app/types/market";

export function useMarket(
  initialPlayers: MarketPlayer[]
) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] =
    useState<MarketTab>("all");

  const players = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return initialPlayers.filter((player) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "auction" &&
          player.listingType === "AUCTION") ||
        (activeTab === "free" &&
          player.listingType === "FREE_AGENT");

      return matchesSearch && matchesTab;
    });
  }, [activeTab, initialPlayers, search]);

  return {
    players,
    search,
    setSearch,
    activeTab,
    setActiveTab,
  };
}
