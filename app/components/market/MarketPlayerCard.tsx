"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Gavel,
  HandCoins,
  TrendingUp,
  X,
} from "lucide-react";

import type {
  MarketPlayer,
} from "@/app/types/market";
import { getMinimumBid } from "@/lib/market-rules";
import FreeAgentCountdown from "./FreeAgentCountdown";
import OverallBadge from "../ui/OverallBadge";

interface MarketPlayerCardProps {
  player: MarketPlayer;
  availableCredits: number;
  canAddAnotherPlayer: boolean;
  onMarketAction: (message: string) => void;
}

export default function MarketPlayerCard({
  player,
  availableCredits,
  canAddAnotherPlayer,
  onMarketAction,
}: MarketPlayerCardProps) {
  const [isBidFormOpen, setIsBidFormOpen] =
    useState(false);
  const [
    isSigningConfirmationOpen,
    setIsSigningConfirmationOpen,
  ] = useState(false);
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
  const minimumAuctionCommitment =
    minimumBid + player.salary;
  const maximumBid = Math.max(
    0,
    availableCredits - player.salary
  );
  const canAffordMinimumBid =
    minimumAuctionCommitment <= availableCredits;
  const canAffordSalary =
    player.salary <= availableCredits;

  function openBidForm() {
    setBidAmount(String(minimumBid));
    setActionError(null);
    setActionMessage(null);
    setIsSigningConfirmationOpen(false);
    setIsBidFormOpen(true);
  }

  function closeBidForm() {
    if (isSubmitting) {
      return;
    }

    setIsBidFormOpen(false);
    setActionError(null);
  }

  function openSigningConfirmation() {
    setActionError(null);
    setActionMessage(null);
    setIsBidFormOpen(false);
    setIsSigningConfirmationOpen(true);
  }

  function closeSigningConfirmation() {
    if (isSubmitting) {
      return;
    }

    setIsSigningConfirmationOpen(false);
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

    if (amount + player.salary > availableCredits) {
      setActionError(
        `Offerta e stipendio richiedono ${formatCurrency(
          amount + player.salary
        )}, ma hai ${formatCurrency(
          availableCredits
        )} disponibili.`
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

      const message =
        data.message ?? "Offerta registrata.";

      setActionMessage(message);
      setIsBidFormOpen(false);
      onMarketAction(message);
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

  async function signFreeAgent() {
    try {
      setIsSubmitting(true);
      setActionError(null);
      setActionMessage(null);

      const response = await fetch(
        "/api/market/free-agents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId: player.listingId,
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
            "Impossibile completare l'ingaggio."
        );
      }

      const message =
        data.message ??
        `${player.name} è stato ingaggiato.`;

      setActionMessage(message);
      setIsSigningConfirmationOpen(false);
      onMarketAction(message);
    } catch (error: unknown) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Impossibile completare l'ingaggio."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-all duration-200 hover:border-green-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <Link
            href={`/players/${player.id}?from=market`}
            aria-label={`Apri la scheda di ${player.name}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-black text-green-300 transition duration-200 hover:scale-105 hover:border-green-500 hover:bg-zinc-700"
          >
            {player.initials}
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2>
                <Link
                  href={`/players/${player.id}?from=market`}
                  className="line-clamp-1 text-base font-bold text-white transition duration-200 hover:text-green-300 hover:underline hover:decoration-green-400 hover:underline-offset-4"
                >
                  {player.name}
                </Link>
              </h2>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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

            <p className="mt-0.5 text-xs text-zinc-400">
              {player.nationality} · {player.age} anni
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Valore stimato: {formatCurrency(
                player.estimatedValue
              )}
            </p>
          </div>
        </div>

        <OverallBadge
          value={player.overall}
          size="md"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
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

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3">
        <MarketInfo
          icon={<Building2 size={15} />}
          iconClassName="text-green-400"
          label={isAuction ? "Venditore" : "Stato"}
          value={
            player.sellerClub ?? "Senza club"
          }
        />

        <MarketInfo
          icon={
            isAuction ? (
              <TrendingUp size={15} />
            ) : (
              <HandCoins size={15} />
            )
          }
          iconClassName="text-yellow-400"
          label={
            isAuction
              ? player.bidCount > 0
                ? "Offerta attuale"
                : "Prezzo iniziale"
              : "Stipendio"
          }
          value={formatCurrency(
            isAuction
              ? player.currentPrice
              : player.salary
          )}
          detail={
            isAuction
              ? `${
                  player.lastBidClub ??
                  `${player.bidCount} offerte`
                } · Stipendio ${formatCurrency(
                  player.salary
                )}`
              : "Nessun costo di acquisto"
          }
        />

        <MarketInfo
          icon={<Clock3 size={15} />}
          iconClassName={
            isAuction
              ? "text-red-400"
              : "text-blue-400"
          }
          label={
            isAuction
              ? "Scadenza"
              : "Uscita dal gioco"
          }
          value={
            isAuction ? (
              player.expiresAtLabel ??
              "Non disponibile"
            ) : player.expiresAt ? (
              <FreeAgentCountdown
                expiresAt={player.expiresAt}
              />
            ) : (
              "Non disponibile"
            )
          }
        />
      </div>

      {player.userBid !== null && (
        <div
          className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
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
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300">
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
          className="mt-3 rounded-xl border border-green-500/30 bg-green-500/5 p-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">
                Nuova offerta
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Offerta minima {formatCurrency(
                  minimumBid
                )} · Stipendio {formatCurrency(
                  player.salary
                )} · Impegno totale {formatCurrency(
                  minimumAuctionCommitment
                )}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Disponibile {formatCurrency(
                  availableCredits
                )}
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

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">
                Importo dell&apos;offerta
              </span>
              <input
                type="number"
                min={minimumBid}
                max={maximumBid}
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

      {isSigningConfirmationOpen && !isAuction && (
        <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/5 p-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">
                Conferma ingaggio
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Nessun costo di acquisto. Verrà
                addebitato soltanto lo stipendio di{" "}
                {formatCurrency(player.salary)}.
              </p>
            </div>

            <button
              type="button"
              onClick={closeSigningConfirmation}
              disabled={isSubmitting}
              aria-label="Chiudi conferma ingaggio"
              className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeSigningConfirmation}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annulla
            </button>

            <button
              type="button"
              onClick={signFreeAgent}
              disabled={isSubmitting}
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-green-900 disabled:text-green-500"
            >
              {isSubmitting
                ? "Ingaggio..."
                : "Conferma ingaggio"}
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
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2 border-t border-zinc-800 pt-3">
        {isAuction ? (
          <button
            type="button"
            onClick={openBidForm}
            disabled={
              player.isUserListing ||
              player.isUserHighestBid ||
              !canAddAnotherPlayer ||
              !canAffordMinimumBid ||
              isSubmitting
            }
            title={
              player.isUserListing
                ? "Questa è una tua asta."
                : player.isUserHighestBid
                ? "La tua offerta è già la migliore."
                : !canAddAnotherPlayer
                  ? "Hai già raggiunto la quantità massima di giocatori considerando la rosa e le aste in cui sei in vantaggio."
                  : !canAffordMinimumBid
                    ? "Saldo disponibile insufficiente."
                    : "Inserisci una nuova offerta."
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-green-900 disabled:text-green-500"
          >
            <Gavel size={18} />
            {player.isUserListing
              ? "La tua asta"
              : player.isUserHighestBid
              ? "Sei in vantaggio"
              : !canAddAnotherPlayer
                ? "Rosa al completo"
                : canAffordMinimumBid
                  ? "Offri"
                  : "Fondi insufficienti"}
          </button>
        ) : (
          <button
            type="button"
            onClick={openSigningConfirmation}
            disabled={
              !canAddAnotherPlayer ||
              !canAffordSalary ||
              isSubmitting
            }
            title={
              !canAddAnotherPlayer
                ? "Hai già raggiunto la quantità massima di giocatori considerando la rosa e le aste in cui sei in vantaggio."
                : !canAffordSalary
                  ? "Saldo disponibile insufficiente per lo stipendio."
                  : "Conferma l'ingaggio dello svincolato."
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-green-900 disabled:text-green-500"
          >
            <HandCoins size={18} />
            {!canAddAnotherPlayer
              ? "Rosa al completo"
              : canAffordSalary
                ? "Ingaggia"
                : "Fondi insufficienti"}
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
    <div className="rounded-lg bg-zinc-800 px-2 py-2 text-center">
      <p className="truncate text-[9px] uppercase text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold text-white">
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
  value: React.ReactNode;
  detail?: string | null;
}) {
  return (
    <div className="min-w-0 text-zinc-300">
      <div className="flex items-center gap-1.5">
        <span className={iconClassName}>{icon}</span>
        <p className="truncate text-[9px] uppercase tracking-wide text-zinc-500">
          {label}
        </p>
      </div>

      <p className="mt-1 truncate text-xs font-semibold">{value}</p>
      {detail && (
        <p className="mt-0.5 line-clamp-2 text-[9px] leading-3 text-zinc-500">
          {detail}
        </p>
      )}
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
