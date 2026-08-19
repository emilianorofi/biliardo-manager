"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Gavel,
  X,
} from "lucide-react";

type CurrentListing = {
  status: string;
  openingPrice: number;
  endsAt: string | null;
};

interface TransferListingFormProps {
  playerId: number;
  playerName: string;
  suggestedPrice: number;
  canListPlayer: boolean;
  currentListing: CurrentListing | null;
}

export default function TransferListingForm({
  playerId,
  playerName,
  suggestedPrice,
  canListPlayer,
  currentListing,
}: TransferListingFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [openingPrice, setOpeningPrice] = useState(
    String(Math.max(1, suggestedPrice))
  );
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (currentListing) {
    const isPendingTransfer =
      currentListing.status === "PENDING_TRANSFER";

    return (
      <Link
        href="/market"
        className="ml-auto flex w-fit items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/15"
        title={
          isPendingTransfer
            ? "Il trasferimento sarà completato dopo la partita"
            : `Prezzo iniziale ${formatCurrency(
                currentListing.openingPrice
              )} · Scadenza ${formatDeadline(
                currentListing.endsAt
              )}`
        }
      >
        {isPendingTransfer ? (
          <Clock3 size={13} />
        ) : (
          <Gavel size={13} />
        )}
        {isPendingTransfer
          ? "Trasferimento in attesa"
          : "Giocatore all'asta"}
      </Link>
    );
  }

  if (!canListPlayer) {
    return (
      <button
        type="button"
        disabled
        title="Devi conservare almeno 3 giocatori non impegnati in altre vendite."
        className="ml-auto flex w-fit cursor-not-allowed items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-bold text-zinc-500"
      >
        <AlertCircle size={13} />
        Vendita non disponibile
      </button>
    );
  }

  function closeDialog() {
    if (isSubmitting) return;

    setIsOpen(false);
    setError(null);
    setMessage(null);
  }

  async function submitListing(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const price = Number(openingPrice);

    if (!Number.isInteger(price) || price <= 0) {
      setError(
        "Il prezzo iniziale deve essere un numero intero positivo."
      );
      return;
    }

    if (!hasConfirmed) {
      setError(
        "Devi confermare che l'asta non potrà essere ritirata."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/market/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          openingPrice: price,
        }),
      });

      const data: {
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Impossibile pubblicare l'asta."
        );
      }

      setMessage(
        data.message ?? `${playerName} è stato messo all'asta.`
      );
      router.refresh();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossibile pubblicare l'asta."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="ml-auto flex w-fit items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-500/15"
      >
        <Gavel size={13} />
        Metti all&apos;asta
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Chiudi la finestra"
            onClick={closeDialog}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-listing-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-800/70 bg-[#15261f] p-4 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <Gavel
                  className="mt-0.5 shrink-0 text-emerald-300"
                  size={17}
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
                    Mercato
                  </p>
                  <h2
                    id="transfer-listing-title"
                    className="text-lg font-black text-white"
                  >
                    Metti {playerName} all&apos;asta
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    L&apos;asta durerà 72 ore. Il giocatore resterà
                    utilizzabile fino al trasferimento.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={isSubmitting}
                aria-label="Chiudi"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitListing} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-300">
                  Prezzo iniziale
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={openingPrice}
                  onChange={(event) =>
                    setOpeningPrice(event.target.value)
                  }
                  disabled={isSubmitting}
                  required
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-emerald-900/70 bg-emerald-950/50 px-3 py-2.5 text-sm font-bold text-white outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 p-2.5">
                <input
                  type="checkbox"
                  checked={hasConfirmed}
                  onChange={(event) =>
                    setHasConfirmed(event.target.checked)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"
                />
                <span className="text-xs leading-5 text-amber-100/80">
                  Confermo che, una volta pubblicata, l&apos;asta
                  non potrà essere annullata o ritirata.
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle
                    className="mt-0.5 shrink-0"
                    size={14}
                  />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="flex items-start gap-2 text-xs text-emerald-300">
                  <CheckCircle2
                    className="mt-0.5 shrink-0"
                    size={14}
                  />
                  <span>{message}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-40"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasConfirmed}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:text-emerald-500"
                >
                  {isSubmitting
                    ? "Pubblicazione..."
                    : "Pubblica asta"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDeadline(value: string | null) {
  if (!value) {
    return "non disponibile";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}
