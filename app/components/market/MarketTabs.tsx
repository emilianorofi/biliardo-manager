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
];

export default function MarketTabs({
  activeTab,
  onTabChange,
}: MarketTabsProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">

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
                px-5
                py-2.5
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
