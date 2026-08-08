import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import TransferListingForm from "@/app/components/player/TransferListingForm";
import type { Player } from "@/app/types/player";
import { getCurrentClubId } from "@/lib/current-club";
import { MIN_FIRST_TEAM_PLAYERS } from "@/lib/game-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const attributes: {
  key: keyof Player["attributes"];
  label: string;
}[] = [
  { key: "precisione", label: "Precisione" },
  { key: "diretto", label: "Diretto" },
  { key: "sponde", label: "Sponde" },
  { key: "tattica", label: "Tattica" },
  { key: "mentalita", label: "Mentalità" },
  { key: "difesa", label: "Difesa" },
  { key: "realizzazione", label: "Realizzazione" },
  { key: "creativita", label: "Creatività" },
  { key: "misura", label: "Misura" },
];

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ id }, { from }] = await Promise.all([
    params,
    searchParams,
  ]);
  const playerId = Number(id);
  const comesFromMarket = from === "market";
  const clubId = await getCurrentClubId();

  if (!Number.isInteger(playerId)) {
    notFound();
  }

  const [databasePlayer, rosterCount, activeSales] =
    await Promise.all([
      prisma.player.findUnique({
        where: {
          id: playerId,
        },
        include: {
          transferListings: {
            where: {
              status: {
                in: [
                  "ACTIVE",
                  "PENDING_TRANSFER",
                ],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              status: true,
              openingPrice: true,
              endsAt: true,
            },
          },
        },
      }),
      prisma.player.count({
        where: {
          clubId,
        },
      }),
      prisma.transferListing.count({
        where: {
          sellerClubId: clubId,
          listingType: "AUCTION",
          status: {
            in: ["ACTIVE", "PENDING_TRANSFER"],
          },
        },
      }),
    ]);

  const isVisiblePlayer =
    databasePlayer !== null &&
    (databasePlayer.clubId === clubId ||
      databasePlayer.transferListings.length > 0);

  if (!databasePlayer || !isVisiblePlayer) {
    notFound();
  }

const playerAttributes: Player["attributes"] = {
  precisione: Math.round(databasePlayer.precisione),
  diretto: Math.round(databasePlayer.diretto),
  sponde: Math.round(databasePlayer.sponde),
  tattica: Math.round(databasePlayer.tattica),
  mentalita: Math.round(databasePlayer.mentalita),
  difesa: Math.round(databasePlayer.difesa),
  realizzazione: Math.round(
    databasePlayer.realizzazione
  ),
  creativita: Math.round(databasePlayer.creativita),
  misura: Math.round(databasePlayer.misura),
};

const player: Player = {
  id: databasePlayer.id,
  firstName: databasePlayer.firstName,
  lastName: databasePlayer.lastName,
  nationality: databasePlayer.nationality,
  age: databasePlayer.age,

  overall: calculateOverall(playerAttributes),

  form: databasePlayer.form,
  morale: databasePlayer.morale,
  experience: Math.round(databasePlayer.experience),

  value: databasePlayer.value,
  salary: databasePlayer.salary,

  image: databasePlayer.image,
  style: databasePlayer.style,

  specialties: {
    italiana: Math.round(
      (playerAttributes.precisione +
        playerAttributes.diretto) /
        2
    ),
    goriziana: Math.round(
      (playerAttributes.precisione +
        playerAttributes.sponde) /
        2
    ),
    tuttiDoppi: Math.round(
      (playerAttributes.diretto +
        playerAttributes.sponde) /
        2
    ),
  },

  attributes: playerAttributes,
};

  const specialties = [
    {
      label: "Italiana",
      value: player.specialties.italiana,
    },
    {
      label: "Goriziana",
      value: player.specialties.goriziana,
    },
    {
      label: "Tutti Doppi",
      value: player.specialties.tuttiDoppi,
    },
  ];

  const currentListing =
    databasePlayer.transferListings[0] ?? null;
  const canListPlayer =
    rosterCount - activeSales >
    MIN_FIRST_TEAM_PLAYERS;

  return (
    <main className="space-y-7">
      <header className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-6">
        <Link
          href={comesFromMarket ? "/market" : "/players"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          <ArrowLeft size={17} />
          {comesFromMarket
            ? "Torna al mercato"
            : "Torna alla rosa"}
        </Link>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
          Scheda giocatore
        </p>

        <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-2xl font-black text-[#122018]">
              {player.firstName.charAt(0)}
              {player.lastName.charAt(0)}
            </div>

            <div>
              <h1 className="text-3xl font-black text-white">
                {player.firstName} {player.lastName}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                {player.nationality} · {player.age} anni
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {player.style.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-emerald-800/70 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-200"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-amber-400 bg-amber-400/10">
            <span className="text-4xl font-black text-amber-300">
              {player.overall}
            </span>

            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/60">
              Overall
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          label="Forma"
          value={`${player.form}/10`}
          highlight="emerald"
        />

        <StatusCard
          label="Morale"
          value={`${player.morale}/10`}
          highlight="amber"
        />

        <StatusCard
          label="Esperienza"
          value={player.experience}
          highlight="sky"
        />
      </section>

      <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            Valori tecnici
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Caratteristiche
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {attributes.map((attribute) => {
            const value = player.attributes[attribute.key];

            return (
              <AttributeValue
                key={attribute.key}
                label={attribute.label}
                value={value}
              />
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            Prestazioni
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Specialità
          </h2>

          <div className="mt-6 space-y-3">
            {specialties.map((specialty) => (
              <div
                key={specialty.label}
                className="flex items-center justify-between rounded-xl border border-emerald-900/50 bg-emerald-950/35 px-4 py-3"
              >
                <span className="font-semibold text-slate-300">
                  {specialty.label}
                </span>

                <span
                  className={`text-xl font-black ${getValueClass(
                    specialty.value
                  )}`}
                >
                  {specialty.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            Situazione economica
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Informazioni
          </h2>

          <div className="mt-6 space-y-4">
            <InfoRow
              label="Valore giocatore"
              value={formatCurrency(player.value)}
              highlight
            />

            <InfoRow
              label="Stipendio"
              value={formatCurrency(player.salary)}
            />

            <InfoRow
              label="Età"
              value={`${player.age} anni`}
            />

            <InfoRow
              label="Nazionalità"
              value={player.nationality}
              last
            />
          </div>
        </section>
      </div>

      {databasePlayer.clubId === clubId && (
        <TransferListingForm
          playerId={player.id}
          playerName={`${player.firstName} ${player.lastName}`}
          suggestedPrice={player.value}
          canListPlayer={canListPlayer}
          currentListing={
            currentListing
              ? {
                  status: currentListing.status,
                  openingPrice:
                    currentListing.openingPrice,
                  endsAt:
                    currentListing.endsAt?.toISOString() ??
                    null,
                }
              : null
          }
        />
      )}
    </main>
  );
}

function StatusCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight: "emerald" | "amber" | "sky";
}) {
  const colors = {
    emerald: "text-emerald-300 border-emerald-800/60",
    amber: "text-amber-300 border-amber-400/30",
    sky: "text-sky-300 border-sky-500/30",
  };

  return (
    <article
      className={`rounded-2xl border bg-[#15261f] p-5 ${colors[highlight]}`}
    >
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-black ${colors[highlight]}`}>
        {value}
      </p>
    </article>
  );
}

function AttributeValue({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/35 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-300">
          {label}
        </span>

        <span className={`text-lg font-black ${getValueClass(value)}`}>
          {value}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
  last = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        last ? "" : "border-b border-emerald-900/50 pb-4"
      }`}
    >
      <span className="text-slate-400">{label}</span>

      <span
        className={`font-black ${
          highlight ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </span>
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

function getValueClass(value: number) {
  if (value >= 90) return "text-amber-300";
  if (value >= 80) return "text-emerald-300";
  if (value >= 70) return "text-sky-300";
  if (value >= 60) return "text-lime-300";

  return "text-slate-300";
}
function calculateOverall(
  playerAttributes: Player["attributes"]
) {
  const values = Object.values(playerAttributes);

  return Math.round(
    values.reduce(
      (total, value) => total + value,
      0
    ) / values.length
  );
}
