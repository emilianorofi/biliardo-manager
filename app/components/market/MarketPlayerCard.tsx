"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  HandCoins,
  TrendingUp,
  X,
} from "lucide-react";

import type {
  MarketPlayer,
} from "@/app/types/market";
import { getMinimumBid } from "@/lib/market-rules";
import OverallBadge from "../ui/OverallBadge";

interface MarketPlayerCardProps {
  player: MarketPlayer;
  availableCredits: number;
  onBidPlaced: () => void;
}

export default function MarketPlayerCard({
  player,
  availableCredits,
  onBidPlaced,
}: MarketPlayerCardProps) {
  const [isBidFormOpen, setIsBidFormOpen] =
    useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [actionError, setActionError] =
    useState<string | null>(null);
  const [actionMessage, setActionMessage] =
    useState<string | null>(null);

  const isAuction =
    player.listingType === "AUCTION";
  const minimumBid = getMinimumBid(
    player.currentPrice
  );
  const canAffordMinimumBid =
    minimumBid <= availableCredits;

  function openBidForm() {
    setBidAmount(String(minimumBid));
    setActionError(null);
    setActionMessage(null);
    setIsBidFormOpen(true);
  }

  function closeBidForm() {
    if (isSubmitting) {
      return;
    }

    setIsBidFormOpen(false);
    setActionError(null);
  }

  async function submitBid(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const amount = Number(bidAmount);

    if (
      !Number.isInteger(amount) ||
      amount < minimumBid
    ) {
      setActionError(
        `L'offerta minima è ${formatCurrency(
          minimumBid
        )}.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError(null);
      setActionMessage(null);

      const response = await fetch(
        "/api/market/bids",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId: player.listingId,
            amount,
          }),
        }
      );

      const data: {
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Impossibile registrare l'offerta."
        );
      }

      setActionMessage(
        data.message ?? "Offerta registrata."
      );
      setIsBidFormOpen(false);
      onBidPlaced();
    } catch (error: unknown) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Impossibile registrare l'offerta."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-green-500">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xl font-black text-green-300">
            {player.initials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {player.name}
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  isAuction
                    ? "bg-green-500/15 text-green-400"
                    : "bg-blue-500/15 text-blue-400"
                }`}
              >
                {isAuction
                  ? "In asta"
                  : "Svincolato"}
              </span>
            </div>

            <p className="mt-1 text-sm text-zinc-400">
              {player.nationality} · {player.age} anni
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Valore stimato: {formatCurrency(
                player.estimatedValue
              )}
            </p>
          </div>
        </div>

        <OverallBadge
          value={player.overall}
          size="lg"
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <SpecialtyValue
          label="Italiana"
          value={player.italiana}
        />
        <SpecialtyValue
          label="Goriziana"
          value={player.goriziana}
        />
        <SpecialtyValue
          label="Tutti Doppi"
          value={player.tuttiDoppi}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <MarketInfo
          icon={<Building2 size={18} />}
          iconClassName="text-green-400"
          label={isAuction ? "Venditore" : "Stato"}
          value={
            player.sellerClub ?? "Senza club"
          }
        />

        <MarketInfo
          icon={
            isAuction ? (
              <TrendingUp size={18} />
            ) : (
              <HandCoins size={18} />
            )
          }
          iconClassName="text-yellow-400"
          label={
            isAuction
              ? player.bidCount > 0
                ? "Offerta attuale"
                : "Prezzo iniziale"
              : "Costo ingaggio"
          }
          value={formatCurrency(
            player.currentPrice
          )}
          detail={
            isAuction
              ? player.lastBidClub ??
                `${player.bidCount} offerte`
              : null
          }
        />

        <MarketInfo
          icon={<Clock3 size={18} />}
          iconClassName={
            isAuction
              ? "text-red-400"
              : "text-blue-400"
          }
          label={
            isAuction ? "Scadenza" : "Disponibilità"
          }
          value={
            player.expiresAtLabel ?? "Immediata"
          }
        />
      </div>

      {player.userBid !== null && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
            player.isUserHighestBid
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          La tua offerta: {formatCurrency(
            player.userBid
          )} · {player.isUserHighestBid
            ? "sei in vantaggio"
            : "sei stato superato"}
        </div>
      )}

      {actionMessage && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle2
            className="mt-0.5 shrink-0"
            size={17}
          />
          <span>{actionMessage}</span>
        </div>
      )}

      {isBidFormOpen && (
        <form
          onSubmit={submitBid}
          className="mt-5 rounded-xl border border-green-500/30 bg-green-500/5 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">
                Nuova offerta
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Minimo {formatCurrency(minimumBid)} · Disponibile {formatCurrency(availableCredits)}
              </p>
            </div>

            <button
              type="button"
              onClick={closeBidForm}
              disabled={isSubmitting}
              aria-label="Chiudi offerta"
              className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">
                Importo dell&apos;offerta
              </span>
              <input
                type="number"
                min={minimumBid}
                max={availableCredits}
                step="1"
                value={bidAmount}
                onChange={(event) =>
                  setBidAmount(event.target.value)
                }
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-green-900 disabled:text-green-500"
            >
              {isSubmitting
                ? "Invio..."
                : "Conferma offerta"}
            </button>
          </div>

          {actionError && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-400">
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={16}
              />
              <span>{actionError}</span>
            </div>
          )}
        </form>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled
          title="La scheda mercato sarà attivata nel prossimo intervento."
          className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-500"
        >
          <FileText size={18} />
          Scheda
        </button>

        {isAuction ? (
          <button
            type="button"
            onClick={openBidForm}
            disabled={
              player.isUserHighestBid ||
              !canAffordMinimumBid ||
              isSubmitting
            }
            title={
              player.isUserHighestBid
                ? "La tua offerta è già la migliore."
                : !canAffordMinimumBid
                  ? "Saldo disponibile insufficiente."
                  : "Inserisci una nuova offerta."
            }
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-green-900 disabled:text-green-500"
          >
            <Gavel size={18} />
            {player.isUserHighestBid
              ? "Sei in vantaggio"
              : canAffordMinimumBid
                ? "Offri"
                : "Fondi insufficienti"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="L'ingaggio degli svincolati sarà attivato in un intervento separato."
            className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-green-900 px-4 py-2 text-sm font-semibold text-green-500"
          >
            <Gavel size={18} />
            Ingaggia
          </button>
        )}
      </div>
    </article>
  );
}

function SpecialtyValue({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-zinc-800 p-3 text-center">
      <p className="text-xs uppercase text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function MarketInfo({
  icon,
  iconClassName,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  detail?: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-zinc-300">
      <span className={iconClassName}>{icon}</span>
      <div>
        <p className="text-xs text-zinc-500">
          {label}
        </p>
        <p className="font-semibold">{value}</p>
        {detail && (
          <p className="text-xs text-zinc-500">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
