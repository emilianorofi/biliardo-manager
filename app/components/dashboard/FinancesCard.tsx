import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
  WalletCards,
} from "lucide-react";

import Card from "@/app/components/ui/Card";

import { getCurrentClubId } from "@/lib/current-club";

import { prisma } from "@/lib/prisma";

export default async function FinancesCard() {
  const clubId = await getCurrentClubId();
  const club =
    await prisma.club.findUnique({
      where: {
        id:
          clubId,
      },

      select: {
        balance:
          true,

        weeklyIncome:
          true,

        weeklyExpenses:
          true,
      },
    });

  if (!club) {
    return (
      <Card
        title="Finanze"
        icon={
          <WalletCards
            size={18}
          />
        }
      >
        <p className="text-sm text-zinc-400">
          Dati economici non disponibili.
        </p>
      </Card>
    );
  }

  const weeklyResult =
    club.weeklyIncome -
    club.weeklyExpenses;

  return (
    <Card
      title="Finanze"
      subtitle="Situazione economica del club"
      icon={
        <WalletCards
          size={18}
        />
      }
      actions={
        <Link
          href="/finance"
          className="text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
        >
          Dettagli
        </Link>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Saldo disponibile
          </p>

          <p className="mt-1 text-2xl font-black text-amber-300">
            {formatCurrency(
              club.balance
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FinancialBox
            label="Entrate"
            value={formatSignedCurrency(
              club.weeklyIncome
            )}
            icon={
              <ArrowUpRight
                size={17}
              />
            }
            tone="positive"
          />

          <FinancialBox
            label="Uscite"
            value={formatSignedCurrency(
              -club.weeklyExpenses
            )}
            icon={
              <ArrowDownRight
                size={17}
              />
            }
            tone="negative"
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-3">
          <span className="text-sm text-zinc-400">
            Risultato settimanale
          </span>

          <span
            className={`text-lg font-black ${
              weeklyResult >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {formatSignedCurrency(
              weeklyResult
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}

function FinancialBox({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone:
    | "positive"
    | "negative";
}) {
  const style =
    tone === "positive"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
      : "border-red-500/20 bg-red-500/5 text-red-400";

  return (
    <div
      className={`rounded-xl border p-3 ${style}`}
    >
      <div className="flex items-center gap-2">
        {icon}

        <span className="text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 font-black">
        {value}
      </p>
    </div>
  );
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",

      currency:
        "EUR",

      maximumFractionDigits:
        0,
    }
  ).format(value);
}

function formatSignedCurrency(
  value: number
): string {
  const formatted =
    formatCurrency(
      Math.abs(value)
    );

  if (value > 0) {
    return `+ ${formatted}`;
  }

  if (value < 0) {
    return `- ${formatted}`;
  }

  return formatted;
}
