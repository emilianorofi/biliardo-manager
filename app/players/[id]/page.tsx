import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import PlayerCareerSection from "@/app/components/player/PlayerCareerSection";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";
import TransferListingForm from "@/app/components/player/TransferListingForm";
import type { Player } from "@/app/types/player";
import { getCurrentClubId } from "@/lib/current-club";
import { MIN_FIRST_TEAM_PLAYERS } from "@/lib/game-config";
import { buildPlayerCareerView } from "@/lib/player-career-stats";
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
  searchParams: Promise<{
    from?: string;
    round?: string;
    stage?: string;
  }>;
}) {
  const [{ id }, { from, round, stage }] = await Promise.all([
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
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              status: true,
              listingType: true,
              openingPrice: true,
              endsAt: true,
              finalPrice: true,
              completedAt: true,
              sellerClub: {
                select: {
                  name: true,
                },
              },
              winnerClub: {
                select: {
                  name: true,
                },
              },
            },
          },
          fixtureAppearances: {
            orderBy: {
              playedAt: "desc",
            },
            include: {
              fixture: {
                select: {
                  round: true,
                  league: {
                    select: {
                      name: true,
                      season: {
                        select: {
                          number: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              gamePerformances: {
                select: {
                  result: true,
                  performanceRating: true,
                  fixtureGame: {
                    select: {
                      order: true,
                      specialty: true,
                      gameType: true,
                    },
                  },
                },
              },
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

  const currentListing =
    databasePlayer?.transferListings.find(
      (listing) =>
        listing.status === "ACTIVE" ||
        listing.status === "PENDING_TRANSFER"
    ) ?? null;

  if (!databasePlayer) {
    notFound();
  }

  const individualRound = Number.parseInt(round ?? "", 10);
  const comesFromIndividual =
    from === "individuale" && Number.isInteger(individualRound);
  const backHref = comesFromMarket
    ? "/market"
    : comesFromIndividual
      ? `/individuale/${individualRound}${stage ? `?stage=${stage}` : ""}`
      : "/players";
  const backLabel = comesFromMarket
    ? "Torna al mercato"
    : comesFromIndividual
      ? "Torna al tabellone"
      : "Torna alla rosa";

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

  const canListPlayer =
    rosterCount - activeSales >
    MIN_FIRST_TEAM_PLAYERS;
  const career = buildPlayerCareerView(
    databasePlayer.fixtureAppearances,
    databasePlayer.transferListings
  );
  const isOwnPlayer = databasePlayer.clubId === clubId;

  return (
    <main className="space-y-3">
      <header className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-3 sm:p-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>

        <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.75fr)] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerPortrait
              player={player}
              className="aspect-[2/3] w-12 shrink-0"
            />

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-emerald-400">
                Scheda giocatore
              </p>
              <h1 className="truncate text-xl font-black text-white">
                {player.firstName} {player.lastName}
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">
                {player.nationality} · {player.age} anni
              </p>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {player.style.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-emerald-800/70 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              <ProfileMetric
                label="Overall"
                value={player.overall}
                highlight="amber"
              />
              <ProfileMetric
                label="Forma"
                value={`${player.form}/10`}
                highlight="emerald"
              />
              <ProfileMetric
                label="Morale"
                value={`${player.morale}/10`}
                highlight="sky"
              />
              <ProfileMetric
                label="Esperienza"
                value={player.experience}
                highlight="slate"
              />
            </div>

            {isOwnPlayer && (
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
          </div>
        </div>
      </header>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.65fr)]">
        <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-3">
          <CompactHeading
            eyebrow="Valori tecnici"
            title="Caratteristiche"
          />

          <div className="mt-2 grid gap-1.5 sm:grid-cols-2 md:grid-cols-3">
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

          <div className="mt-3 border-t border-emerald-900/50 pt-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
              Rendimento per specialità
            </p>
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-3">
              {specialties.map((specialty) => (
                <div
                  key={specialty.label}
                  className="flex items-center justify-between rounded-lg border border-emerald-900/50 bg-emerald-950/35 px-2.5 py-1.5"
                >
                  <span className="text-xs font-semibold text-slate-300">
                    {specialty.label}
                  </span>
                  <span
                    className={`text-base font-black ${getValueClass(
                      specialty.value
                    )}`}
                  >
                    {specialty.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-3">
          <CompactHeading
            eyebrow="Profilo e costi"
            title="Informazioni"
          />

          <div className="mt-2 space-y-1.5">
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

      <PlayerCareerSection career={career} />

    </main>
  );
}

function ProfileMetric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight: "amber" | "emerald" | "sky" | "slate";
}) {
  const colors = {
    amber: "border-amber-400/30 text-amber-300",
    emerald: "border-emerald-600/40 text-emerald-300",
    sky: "border-sky-500/30 text-sky-300",
    slate: "border-slate-600/50 text-slate-200",
  };

  return (
    <div
      className={`rounded-lg border bg-emerald-950/35 px-2 py-1.5 text-center ${colors[highlight]}`}
    >
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-base font-black">{value}</p>
    </div>
  );
}

function CompactHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
        {eyebrow}
      </p>
      <h2 className="text-lg font-black text-white">
        {title}
      </h2>
    </div>
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
    <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/35 px-2.5 py-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-300">
          {label}
        </span>

        <span className={`text-base font-black ${getValueClass(value)}`}>
          {value}
        </span>
      </div>

      <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/30">
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
        last ? "" : "border-b border-emerald-900/50 pb-1.5"
      }`}
    >
      <span className="text-xs text-slate-400">{label}</span>

      <span
        className={`text-xs font-black ${
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
