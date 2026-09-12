import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, EyeOff } from "lucide-react";

import PlayerCareerSection from "@/app/components/player/PlayerCareerSection";
import CountryFlag from "@/app/components/player/CountryFlag";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";
import TransferListingForm from "@/app/components/player/TransferListingForm";
import type { Player } from "@/app/types/player";
import {
  getCurrentClubId,
  getTechnicalViewerClubId,
} from "@/lib/current-club";
import { MIN_FIRST_TEAM_PLAYERS } from "@/lib/game-config";
import { getNationalityDisplay } from "@/lib/nationalities";
import { buildPlayerCareerView } from "@/lib/player-career-stats";
import { buildGlobalPlayerRanking } from "@/lib/player-ranking";
import { canViewPlayerTechnicalValues } from "@/lib/player-visibility";
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
    club?: string;
  }>;
}) {
  const [{ id }, { from, round, stage, club }] = await Promise.all([
    params,
    searchParams,
  ]);
  const playerId = Number(id);
  const comesFromMarket = from === "market";
  const [clubId, technicalViewerClubId] = await Promise.all([
    getCurrentClubId(),
    getTechnicalViewerClubId(),
  ]);

  if (!Number.isInteger(playerId)) {
    notFound();
  }

  const [databasePlayer, rosterCount, activeSales, rankablePlayers] =
    await Promise.all([
      prisma.player.findUnique({
        where: {
          id: playerId,
        },
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
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
                  id: true,
                  name: true,
                },
              },
              winnerClub: {
                select: {
                  id: true,
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
                  homeClubId: true,
                  awayClubId: true,
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
      prisma.player.findMany({
        where: {
          careerStatus: "ACTIVE",
        },
        select: {
          id: true,
          precisione: true,
          diretto: true,
          sponde: true,
          tattica: true,
          mentalita: true,
          difesa: true,
          realizzazione: true,
          creativita: true,
          misura: true,
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
  const sourceClubId = Number.parseInt(club ?? "", 10);
  const comesFromIndividual =
    from === "individuale" && Number.isInteger(individualRound);
  const comesFromClub =
    from === "club" && Number.isInteger(sourceClubId);
  const backHref = comesFromMarket
    ? "/market"
    : comesFromIndividual
      ? `/individuale/${individualRound}${stage ? `?stage=${stage}` : ""}`
      : comesFromClub
        ? `/clubs/${sourceClubId}`
        : "/players";
  const backLabel = comesFromMarket
    ? "Torna al mercato"
    : comesFromIndividual
      ? "Torna al tabellone"
      : comesFromClub
        ? "Torna alla squadra"
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

  const nationality = getNationalityDisplay(player.nationality);
  const globalRanking =
    buildGlobalPlayerRanking(rankablePlayers).get(player.id)?.position ?? null;

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
  const isOwnPlayer = canViewPlayerTechnicalValues(
    technicalViewerClubId,
    databasePlayer.clubId
  );

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

              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                <CountryFlag
                  code={nationality.code}
                  label={nationality.label}
                />
                <span className="font-bold text-slate-300">
                  {nationality.code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{player.age} anni</span>
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
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
              <ProfileMetric
                label="Overall"
                value={player.overall}
                highlight="amber"
              />
              <ProfileMetric
                label="Ranking"
                value={globalRanking ? `#${globalRanking}` : "N.C."}
                highlight="sky"
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
        {isOwnPlayer ? (
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
        ) : (
          <section className="rounded-2xl border border-sky-400/20 bg-[linear-gradient(145deg,#17262a_0%,#13201d_100%)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                <EyeOff size={20} />
              </div>
              <div>
                <CompactHeading
                  eyebrow="Profilo tecnico"
                  title="Valori riservati"
                />
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Soltanto le caratteristiche e i valori per specialità sono riservati al manager della squadra di appartenenza. Ranking, forma, morale, partite, prove, trasferimenti e carriera restano consultabili.
                </p>
              </div>
            </div>
          </section>
        )}

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
              label="Squadra"
              value={
                databasePlayer.careerStatus === "REMOVED" ? (
                  "Fuori attività"
                ) : databasePlayer.club ? (
                  <Link
                    href={`/clubs/${databasePlayer.club.id}`}
                    className="text-emerald-300 transition hover:text-amber-200 hover:underline"
                  >
                    {databasePlayer.club.name}
                  </Link>
                ) : (
                  "Svincolato"
                )
              }
            />
            <InfoRow
              label="Nazionalità"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <CountryFlag
                    code={nationality.code}
                    label={nationality.label}
                  />
                  {nationality.code}
                </span>
              }
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
  value: React.ReactNode;
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
