import Link from "next/link";

import {
  ChartNoAxesColumnIncreasing,
  CircleDot,
  History,
  MoveRight,
  Repeat2,
  Trophy,
  Users,
} from "lucide-react";

import type {
  PlayerCareerAppearance,
  PlayerCareerBreakdown,
  PlayerCareerGame,
  PlayerCareerTransfer,
  PlayerCareerView,
} from "@/app/types/playerCareer";

export default function PlayerCareerSection({
  career,
}: {
  career: PlayerCareerView;
}) {
  const visibleAppearances = career.recentAppearances.slice(0, 3);
  const olderAppearances = career.recentAppearances.slice(3);

  return (
    <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-3">
      <SectionHeading />

      <div className="mt-2 grid gap-3 xl:grid-cols-[0.65fr_1fr_1.35fr]">
        <div className="grid grid-cols-2 content-start gap-1.5">
          <CareerMetric
            label="Presenze"
            value={career.summary.appearances}
            detail={`${career.summary.clubs} club`}
            icon={<Users size={12} />}
          />
          <CareerMetric
            label="Prove"
            value={career.summary.played}
            detail={`${career.summary.wins} V · ${career.summary.losses} P`}
            icon={<CircleDot size={12} />}
          />
          <CareerMetric
            label="Vittorie"
            value={career.summary.wins}
            detail="prove vinte"
            icon={<Trophy size={12} />}
          />
          <CareerMetric
            label="Percentuale"
            value={`${formatDecimal(career.summary.winRate)}%`}
            detail={`media ${formatDecimal(
              career.summary.averagePerformance
            )}`}
            icon={<ChartNoAxesColumnIncreasing size={12} />}
          />
        </div>

        <div className="space-y-2">
          <CareerBreakdownCard
            title="Rendimento per specialità"
            breakdowns={career.specialties}
          />
          <CareerBreakdownCard
            title="Singoli e coppie"
            breakdowns={career.gameTypes}
          />

          {career.seasons.length > 1 && (
            <details className="rounded-lg border border-emerald-900/50 bg-emerald-950/25 px-2.5 py-2">
              <summary className="cursor-pointer text-xs font-bold text-emerald-200">
                Stagioni precedenti
              </summary>
              <div className="mt-2 space-y-1.5">
                {career.seasons.map((season) => (
                  <BreakdownRow
                    key={season.key}
                    breakdown={season}
                  />
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/25 p-2.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-white">
              Ultime partite
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">
              {career.summary.appearances} totali
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {visibleAppearances.length > 0 ? (
              visibleAppearances.map((appearance) => (
                <AppearanceRow
                  key={appearance.id}
                  appearance={appearance}
                />
              ))
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-dashed border-emerald-800/60 bg-black/10 p-2.5">
                <History
                  className="mt-0.5 shrink-0 text-emerald-400"
                  size={14}
                />
                <div>
                  <p className="text-xs font-bold text-white">
                    Nessuna partita registrata
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                    Il percorso si aggiornerà automaticamente
                    dalla prossima partita giocata.
                  </p>
                </div>
              </div>
            )}
          </div>

          {olderAppearances.length > 0 && (
            <details className="mt-2 rounded-lg border border-emerald-900/40 bg-black/10 px-2.5 py-2">
              <summary className="cursor-pointer text-xs font-bold text-emerald-200">
                Altre {olderAppearances.length} partite recenti
              </summary>
              <div className="mt-2 space-y-1.5">
                {olderAppearances.map((appearance) => (
                  <AppearanceRow
                    key={appearance.id}
                    appearance={appearance}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      <TransferHistoryCard transfers={career.transfers} />
    </section>
  );
}

function SectionHeading() {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
        Percorso individuale
      </p>
      <h2 className="text-lg font-black text-white">
        Carriera e partite
      </h2>
    </div>
  );
}

function CareerMetric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-emerald-900/50 bg-emerald-950/35 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2 text-emerald-300">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-0.5 text-lg font-black text-white">
        {value}
      </p>
      <p className="text-[10px] text-slate-500">{detail}</p>
    </article>
  );
}

function CareerBreakdownCard({
  title,
  breakdowns,
}: {
  title: string;
  breakdowns: PlayerCareerBreakdown[];
}) {
  return (
    <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/25 p-2.5">
      <h3 className="text-xs font-black text-white">{title}</h3>
      <div className="mt-1.5 space-y-1">
        {breakdowns.map((breakdown) => (
          <BreakdownRow
            key={breakdown.key}
            breakdown={breakdown}
          />
        ))}
      </div>
    </div>
  );
}

function BreakdownRow({
  breakdown,
}: {
  breakdown: PlayerCareerBreakdown;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-white/5 bg-black/15 px-2 py-1">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-xs font-bold text-slate-200">
            {breakdown.label}
          </span>
          <span className="text-[10px] text-slate-500">
            {breakdown.wins}V · {breakdown.losses}P
          </span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${breakdown.winRate}%` }}
          />
        </div>
      </div>
      <div className="w-20 text-right">
        <p className="text-xs font-black text-emerald-300">
          {formatDecimal(breakdown.winRate)}%
        </p>
        <p className="whitespace-nowrap text-[10px] text-slate-500">
          {breakdown.played} prove · {formatDecimal(
            breakdown.averagePerformance
          )}
        </p>
      </div>
    </div>
  );
}

function AppearanceRow({
  appearance,
}: {
  appearance: PlayerCareerAppearance;
}) {
  const result = getFixtureResult(appearance);

  return (
    <article className="rounded-lg border border-emerald-900/45 bg-black/15 p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            {appearance.opponentClubId ? (
              <Link
                href={`/clubs/${appearance.opponentClubId}`}
                className="truncate text-xs font-black text-white transition hover:text-amber-200 hover:underline"
              >
                vs {appearance.opponentClubName}
              </Link>
            ) : (
              <span className="truncate text-xs font-black text-white">
                vs {appearance.opponentClubName}
              </span>
            )}
          <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black ${
              result === "WIN"
                ? "bg-emerald-400/15 text-emerald-300"
                : result === "LOSS"
                  ? "bg-rose-400/15 text-rose-300"
                  : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {appearance.teamScore}-{appearance.opponentScore}
          </span>
          </div>
          <p className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500">
            {formatDate(appearance.playedAt)} · G{appearance.round} · {appearance.side ===
            "HOME"
              ? "Casa"
              : "Trasferta"} · Slot {appearance.formationSlot}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
            Prest.
          </p>
          <p className="text-sm font-black text-amber-300">
            {formatDecimal(appearance.performanceRating)}
          </p>
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
          {appearance.games.map((game) => (
            <GameChip
              key={`${appearance.id}-${game.order}`}
              game={game}
            />
          ))}
      </div>
    </article>
  );
}

function TransferHistoryCard({
  transfers,
}: {
  transfers: PlayerCareerTransfer[];
}) {
  const visibleTransfers = transfers.slice(0, 3);
  const olderTransfers = transfers.slice(3);

  return (
    <div className="mt-3 rounded-xl border border-emerald-900/50 bg-emerald-950/25 p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Repeat2 className="text-emerald-400" size={14} />
          <h3 className="text-sm font-black text-white">
            Trasferimenti
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">
          {transfers.length} totali
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {visibleTransfers.length > 0 ? (
          visibleTransfers.map((transfer) => (
            <TransferRow
              key={transfer.id}
              transfer={transfer}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-emerald-800/60 bg-black/10 px-2.5 py-2">
            <p className="text-xs font-bold text-white">
              Nessun trasferimento registrato
            </p>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              Le future cessioni e acquisizioni compariranno qui.
            </p>
          </div>
        )}
      </div>

      {olderTransfers.length > 0 && (
        <details className="mt-2 rounded-lg border border-emerald-900/40 bg-black/10 px-2.5 py-2">
          <summary className="cursor-pointer text-xs font-bold text-emerald-200">
            Altri {olderTransfers.length} trasferimenti
          </summary>
          <div className="mt-2 space-y-1.5">
            {olderTransfers.map((transfer) => (
              <TransferRow
                key={transfer.id}
                transfer={transfer}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TransferRow({
  transfer,
}: {
  transfer: PlayerCareerTransfer;
}) {
  const fromClubName = transfer.fromClubName ?? "Svincolato";
  const toClubName = transfer.toClubName ?? "Club non disponibile";

  return (
    <article className="grid gap-2 rounded-lg border border-emerald-900/45 bg-black/15 px-2.5 py-2 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wide text-emerald-300">
          {transfer.type === "AUCTION" ? "Asta" : "Svincolato"}
        </p>
        <p className="text-[9px] text-slate-500">
          {formatDate(transfer.completedAt)}
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-200">
        {transfer.fromClubId ? (
          <Link
            href={`/clubs/${transfer.fromClubId}`}
            className="truncate transition hover:text-amber-200 hover:underline"
          >
            {fromClubName}
          </Link>
        ) : (
          <span className="truncate">{fromClubName}</span>
        )}
        <MoveRight className="shrink-0 text-emerald-500" size={13} />
        {transfer.toClubId ? (
          <Link
            href={`/clubs/${transfer.toClubId}`}
            className="truncate text-white transition hover:text-amber-200 hover:underline"
          >
            {toClubName}
          </Link>
        ) : (
          <span className="truncate text-white">{toClubName}</span>
        )}
      </div>

      <p className="text-xs font-black text-amber-300 sm:text-right">
        {transfer.type === "FREE_AGENT" || transfer.amount === null
          ? "Svincolato"
          : formatCurrency(transfer.amount)}
      </p>
    </article>
  );
}

function GameChip({ game }: { game: PlayerCareerGame }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] font-black ${
        game.result === "WIN"
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/25 bg-rose-500/10 text-rose-300"
      }`}
      title={`Prestazione ${formatDecimal(
        game.performanceRating
      )}`}
    >
      {getSpecialtyAbbreviation(game.specialty)} · {game.gameType ===
      "SINGLES"
        ? "S"
        : "C"} · {game.result === "WIN" ? "V" : "P"}
    </span>
  );
}

function getFixtureResult(appearance: PlayerCareerAppearance) {
  if (appearance.teamScore > appearance.opponentScore) return "WIN";
  if (appearance.teamScore < appearance.opponentScore) return "LOSS";
  return "DRAW";
}

function getSpecialtyAbbreviation(
  specialty: PlayerCareerGame["specialty"]
) {
  if (specialty === "ITALIANA") return "ITA";
  if (specialty === "GORIZIANA") return "GOR";
  return "TD";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
