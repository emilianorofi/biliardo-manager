"use client";

import { useMemo, useState } from "react";
import { mockMarketPlayers } from "@/app/data/mockMarketPlayers";

export function useMarket() {
  const [search, setSearch] = useState("");

  const players = useMemo(() => {
    return mockMarketPlayers.filter((player) =>
      player.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return {
    players,
    search,
    setSearch,
  };
}