import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  EyeOff,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import PlayerListCard from "@/app/components/player/PlayerListCard";
import type { Player } from "@/app/types/player";
import { getTechnicalViewerClubId } from "@/lib/current-club";
import { buildGlobalPlayerRanking } from "@/lib/player-ranking";
import { canViewPlayerTechnicalValues } from "@/lib/player-visibility";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const clubId = Number.parseInt(id, 10);
  const comesFromRanking = from === "ranking";

  if (!Number.isInteger(clubId)) {
    notFound();
  }

  const viewerClubId = await getTechnicalViewerClubId();
  const [club, rankablePlayers] = await Promise.all([
    prisma.club.findUnique({
      where: {
        id: clubId,
      },
      include: {
        players: {
          orderBy: [
            {
              lastName: "asc",
            },
            {
              firstName: "asc",
            },
          ],
          include: {
            fixtureAppearances: {
              orderBy: {
                playedAt: "desc",
              },
              take: 1,
              select: {
                playedAt: true,
                opponentClubName: true,
                teamScore: true,
                opponentScore: true,
                formationSlot: true,
                performanceRating: true,
              },
            },
          },
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

  if (!club) {
    notFound();
  }

  const isOwnClub = canViewPlayerTechnicalValues(viewerClubId, club.id);
  const ranking = buildGlobalPlayerRanking(rankablePlayers);
  const players: Player[] = club.players.map((databasePlayer) => {
    const attributes = {
      precisione: Math.round(databasePlayer.precisione),
      diretto: Math.round(databasePlayer.diretto),
      sponde: Math.round(databasePlayer.sponde),
      tattica: Math.round(databasePlayer.tattica),
      mentalita: Math.round(databasePlayer.mentalita),
      difesa: Math.round(databasePlayer.difesa),
      realizzazione: Math.round(databasePlayer.realizzazione),
      creativita: Math.round(databasePlayer.creativita),
      misura: Math.round(databasePlayer.misura),
    };

    return {
      id: databasePlayer.id,
      firstName: databasePlayer.firstName,
      lastName: databasePlayer.lastName,
      nationality: databasePlayer.nationality,
      age: databasePlayer.age,
      overall: calculateOverall(attributes),
      form: databasePlayer.form,
      morale: databasePlayer.morale,
      experience: Math.round(databasePlayer.experience),
      value: databasePlayer.value,
      salary: databasePlayer.salary,
      image: databasePlayer.image,
      style: databasePlayer.style,
      specialties: {
        italiana: Math.round(
          (attributes.precisione + attributes.diretto) / 2
        ),
        goriziana: Math.round(
          (attributes.precisione + attributes.sponde) / 2
        ),
        tuttiDoppi: Math.round(
          (attributes.diretto + attributes.sponde) / 2
        ),
      },
      attributes,
    };
  });
  const latestPerformances = new Map(
    club.players.map((player) => {
      const performance = player.fixtureAppearances[0];

      return [
        player.id,
        performance
          ? {
              playedAt: performance.playedAt.toISOString(),
              opponentClubName: performance.opponentClubName,
              teamScore: performance.teamScore,
              opponentScore: performance.opponentScore,
              formationSlot: performance.formationSlot,
              performanceRating: performance.performanceRating,
            }
          : null,
      ] as const;
    })
  );
  const averageAge =
    players.length > 0
      ? (
          players.reduce((total, player) => total + player.age, 0) /
          players.length
        ).toFixed(1)
      : "0";

  return (
    <main className="space-y-4">
      <Link
        href={comesFromRanking ? "/ranking" : "/campionato"}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-amber-300"
      >
        <ArrowLeft size={15} />
        {comesFromRanking ? "Torna al ranking" : "Torna al campionato"}
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-[linear-gradient(135deg,#183129_0%,#12231d_68%,#101e19_100%)] p-5 shadow-xl shadow-black/10 sm:px-6 sm:py-5">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${club.primaryColor}, ${club.secondaryColor})`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: club.secondaryColor }}
        />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-xl font-black text-white shadow-xl shadow-black/20"
              style={{
                background: `linear-gradient(145deg, ${club.primaryColor}, ${club.secondaryColor})`,
              }}
            >
              {club.shortName}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                {isOwnClub ? "La tua squadra" : "Scheda squadra"}
              </p>
              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {club.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {club.city}, {club.country}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {formatNumber(club.fans)} tifosi
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ClubMetric
              icon={<Users size={18} />}
              label="Giocatori"
              value={players.length}
            />
            <ClubMetric
              icon={<Star size={18} />}
              label="Reputazione"
              value={club.reputation}
              highlight
            />
            <ClubMetric
              icon={isOwnClub ? <ShieldCheck size={18} /> : <EyeOff size={18} />}
              label={isOwnClub ? "Accesso" : "Dati tecnici"}
              value={isOwnClub ? "Completo" : "Riservati"}
            />
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] px-4 py-3.5 sm:px-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
              Prima squadra
            </p>
            <h2 className="mt-0.5 text-xl font-black text-white">
              Rosa di {club.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {players.length} giocatori · Età media {averageAge}
            </p>
          </div>

          {isOwnClub ? (
            <Link
              href="/players"
              className="inline-flex w-fit items-center rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-[#122018] transition hover:bg-amber-300"
            >
              Gestisci la rosa
            </Link>
          ) : (
            <p className="max-w-lg text-xs leading-5 text-slate-500 sm:text-right">
              Identità, stato e carriera sono pubblici. Le caratteristiche tecniche restano riservate al manager del club.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        {players.map((player) => (
          <PlayerListCard
            key={player.id}
            player={player}
            clubColors={{
              primary: club.primaryColor,
              secondary: club.secondaryColor,
            }}
            latestPerformance={latestPerformances.get(player.id) ?? null}
            globalRanking={ranking.get(player.id)?.position ?? null}
            showTechnicalValues={isOwnClub}
            playerHref={`/players/${player.id}?from=club&club=${club.id}`}
          />
        ))}

        {players.length === 0 && (
          <div className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-10 text-center">
            <p className="font-bold text-white">
              Nessun giocatore presente
            </p>
            <p className="mt-2 text-sm text-slate-500">
              La rosa del club è ancora vuota.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function ClubMetric({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-28 rounded-xl border border-emerald-900/60 bg-emerald-950/35 px-3 py-2">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className={`mt-1 text-base font-black ${highlight ? "text-amber-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function calculateOverall(attributes: Player["attributes"]) {
  const values = Object.values(attributes);

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("it-IT").format(value);
}
