"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Gavel,
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
  const [openingPrice, setOpeningPrice] = useState(
    String(Math.max(1, suggestedPrice))
  );
  const [hasConfirmed, setHasConfirmed] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<
    string | null
  >(null);

  if (currentListing) {
    const isPendingTransfer =
      currentListing.status === "PENDING_TRANSFER";

    return (
      <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6">
        <div className="flex items-start gap-3">
          {isPendingTransfer ? (
            <Clock3
              className="mt-0.5 shrink-0 text-amber-300"
              size={22}
            />
          ) : (
            <Gavel
              className="mt-0.5 shrink-0 text-amber-300"
              size={22}
            />
          )}

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Mercato
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {isPendingTransfer
                ? "Trasferimento in attesa"
                : "Giocatore già all'asta"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isPendingTransfer
                ? "L'asta è terminata mentre il giocatore era impegnato in una partita. Il trasferimento sarà completato al termine dell'incontro."
                : `Prezzo iniziale ${formatCurrency(
                    currentListing.openingPrice
                  )}. Scadenza ${formatDeadline(
                    currentListing.endsAt
                  )}.`}
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-200">
              L&apos;asta pubblicata non può essere
              ritirata.
            </p>

            <Link
              href="/market"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
            >
              <Gavel size={17} />
              Vai al mercato
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!canListPlayer) {
    return (
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 shrink-0 text-zinc-400"
            size={22}
          />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Mercato
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Vendita non disponibile
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Devi conservare almeno 3 giocatori non
              impegnati in altre vendite.
            </p>
          </div>
        </div>
      </section>
    );
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

      const response = await fetch(
        "/api/market/listings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId,
            openingPrice: price,
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
            "Impossibile pubblicare l'asta."
        );
      }

      setMessage(
        data.message ??
          `${playerName} è stato messo all'asta.`
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
    <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-6">
      <div className="flex items-start gap-3">
        <Gavel
          className="mt-0.5 shrink-0 text-emerald-300"
          size={23}
        />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            Mercato
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Metti il giocatore all&apos;asta
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Scegli liberamente il prezzo iniziale. L&apos;asta
            durerà 72 ore e il giocatore resterà utilizzabile
            fino al trasferimento.
          </p>
        </div>
      </div>

      <form
        onSubmit={submitListing}
        className="mt-6 space-y-4"
      >
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
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
            className="mt-2 w-full rounded-xl border border-emerald-900/70 bg-emerald-950/40 px-4 py-3 text-white outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <input
            type="checkbox"
            checked={hasConfirmed}
            onChange={(event) =>
              setHasConfirmed(event.target.checked)
            }
            disabled={isSubmitting}
            className="mt-1 h-4 w-4 accent-emerald-500"
          />
          <span className="text-sm leading-6 text-amber-100/80">
            Confermo di aver compreso che, una volta
            pubblicata, l&apos;asta non potrà essere annullata o
            ritirata.
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-400">
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={17}
            />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-2 text-sm text-emerald-300">
            <CheckCircle2
              className="mt-0.5 shrink-0"
              size={17}
            />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !hasConfirmed}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:text-emerald-500"
        >
          {isSubmitting
            ? "Pubblicazione..."
            : "Pubblica asta"}
        </button>
      </form>
    </section>
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
