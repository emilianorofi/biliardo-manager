"use client";

import {
  ArrowUpRight,
  Coins,
  Gavel,
} from "lucide-react";

import type {
  MarketUserBid,
} from "@/app/types/market";

interface MarketSidebarProps {
  balance: number;
  availableCredits: number;
  userBids: MarketUserBid[];
}

export default function MarketSidebar({
  balance,
  availableCredits,
  userBids,
}: MarketSidebarProps) {
  const reservedCredits = Math.max(
    0,
    balance - availableCredits
  );

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-600 p-3">
            <Coins
              className="text-white"
              size={22}
            />
          </div>

          <div>
            <p className="text-sm text-zinc-400">
              Disponibile per il mercato
            </p>
            <h2 className="text-2xl font-bold text-white">
              {formatCurrency(availableCredits)}
            </h2>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4 text-sm">
          <div className="flex justify-between gap-3 text-zinc-400">
            <span>Saldo club</span>
            <span className="font-semibold text-white">
              {formatCurrency(balance)}
            </span>
          </div>

          <div className="flex justify-between gap-3 text-zinc-400">
            <span>Impegnato in aste e stipendi</span>
            <span className="font-semibold text-yellow-400">
              {formatCurrency(reservedCredits)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Gavel
            className="text-green-400"
            size={20}
          />
          <h3 className="font-semibold text-white">
            Le mie offerte
          </h3>
        </div>

        <div className="space-y-3">
          {userBids.map((bid) => (
            <div
              key={bid.listingId}
              className="rounded-xl bg-zinc-800 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">
                    {bid.playerName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    La tua offerta: {formatCurrency(
                      bid.amount
                    )}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Con stipendio: {formatCurrency(
                      bid.totalCommitment
                    )}
                  </p>
                </div>

                <ArrowUpRight
                  className={
                    bid.isHighest
                      ? "text-green-400"
                      : "text-red-400"
                  }
                  size={18}
                />
              </div>

              <p
                className={`mt-2 text-xs font-semibold ${
                  bid.isHighest
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {bid.isHighest
                  ? "Offerta migliore"
                  : `Superata: ${formatCurrency(
                      bid.currentPrice
                    )}`}
              </p>

              {bid.expiresAtLabel && (
                <p className="mt-1 text-xs text-zinc-500">
                  Scadenza {bid.expiresAtLabel}
                </p>
              )}
            </div>
          ))}

          {userBids.length === 0 && (
            <p className="rounded-xl bg-zinc-800 p-3 text-sm text-zinc-400">
              Non hai offerte attive.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h3 className="font-semibold text-blue-300">
          Mercato reale
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Giocatori, prezzi, scadenze e offerte sono ora letti dal database.
        </p>
      </div>
    </aside>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
