"use client";

import type {
  MarketTab,
} from "@/app/types/market";

interface MarketTabsProps {
  activeTab: MarketTab;
  onTabChange: (tab: MarketTab) => void;
}

const tabs: {
  id: MarketTab;
  label: string;
}[] = [
  { id: "all", label: "Tutti" },
  { id: "auction", label: "In asta" },
  { id: "free", label: "Svincolati" },
  { id: "history", label: "Storico" },
];

export default function MarketTabs({
  activeTab,
  onTabChange,
}: MarketTabsProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-1.5">

      <div className="flex gap-2 overflow-x-auto">

        {tabs.map((tab) => {

          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                ${
                  active
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}

      </div>

    </div>
  );
}
