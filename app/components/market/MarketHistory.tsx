import Link from "next/link";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleX,
  Clock3,
  UserPlus,
} from "lucide-react";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";

import type {
  MarketHistoryItem,
  MarketHistoryKind,
} from "@/app/types/market";

interface MarketHistoryProps {
  items: MarketHistoryItem[];
}

const appearances: Record<
  MarketHistoryKind,
  {
    label: string;
    colors: string;
    icon: typeof ArrowDownLeft;
  }
> = {
  PURCHASE: {
    label: "Acquisto",
    colors:
      "border-green-500/30 bg-green-500/10 text-green-300",
    icon: ArrowDownLeft,
  },
  SALE: {
    label: "Vendita",
    colors:
      "border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: ArrowUpRight,
  },
  FREE_AGENT: {
    label: "Svincolato",
    colors:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",
    icon: UserPlus,
  },
  EXPIRED: {
    label: "Senza offerte",
    colors:
      "border-zinc-600 bg-zinc-800 text-zinc-300",
    icon: Clock3,
  },
  CANCELLED: {
    label: "Annullata",
    colors:
      "border-red-500/30 bg-red-500/10 text-red-300",
    icon: CircleX,
  },
};

export default function MarketHistory({
  items,
}: MarketHistoryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <p className="font-semibold text-white">
          Nessuna operazione trovata.
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Acquisti, vendite e aste concluse compariranno qui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          Storico operazioni
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Le ultime {items.length} operazioni del tuo club.
        </p>
      </div>

      <div className="divide-y divide-zinc-800">
        {items.map((item) => {
          const appearance = appearances[item.kind];
          return (
            <div
              key={item.listingId}
              className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <Link href={`/players/${item.playerId}?from=market`}>
                  <PlayerPortrait player={{ id: item.playerId, firstName: item.firstName, lastName: item.lastName, age: item.age }} className="h-24 w-20 shrink-0" />
                </Link>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/players/${item.playerId}?from=market`} className="font-semibold text-white transition hover:text-amber-200 hover:underline">{item.playerName}</Link>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${appearance.colors}`}
                    >
                      {appearance.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-400">
                    {getDescription(item)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.completedAtLabel}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p
                  className={`font-bold ${getAmountColor(
                    item.kind
                  )}`}
                >
                  {getAmountLabel(item)}
                </p>
                {item.kind === "PURCHASE" && (
                  <p className="mt-1 text-xs text-zinc-500">
                    + {formatCurrency(item.salary)} stipendio
                  </p>
                )}
                {item.kind === "FREE_AGENT" && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Stipendio addebitato
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getDescription(item: MarketHistoryItem) {
  const counterpart =
    item.counterpartClub && item.counterpartClubId ? (
      <Link
        href={`/clubs/${item.counterpartClubId}`}
        className="font-semibold text-zinc-300 transition hover:text-amber-200 hover:underline"
      >
        {item.counterpartClub}
      </Link>
    ) : (
      "un altro club"
    );

  switch (item.kind) {
    case "PURCHASE":
      return <>Acquistato da {counterpart}.</>;
    case "SALE":
      return <>Venduto a {counterpart}.</>;
    case "FREE_AGENT":
      return "Ingaggiato dal mercato degli svincolati.";
    case "EXPIRED":
      return `Asta terminata senza offerte. Prezzo iniziale ${formatCurrency(
        item.openingPrice
      )}.`;
    case "CANCELLED":
      return "Operazione annullata perché i requisiti non erano più rispettati.";
  }
}

function getAmountLabel(item: MarketHistoryItem) {
  if (item.kind === "FREE_AGENT") {
    return `-${formatCurrency(item.salary)}`;
  }

  if (
    item.kind === "EXPIRED" ||
    item.kind === "CANCELLED" ||
    item.finalPrice === null
  ) {
    return "Nessun movimento";
  }

  const prefix = item.kind === "SALE" ? "+" : "-";
  return `${prefix}${formatCurrency(item.finalPrice)}`;
}

function getAmountColor(kind: MarketHistoryKind) {
  if (kind === "SALE") {
    return "text-green-400";
  }

  if (kind === "PURCHASE" || kind === "FREE_AGENT") {
    return "text-red-300";
  }

  return "text-zinc-400";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
