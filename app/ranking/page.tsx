import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Medal,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

import CountryFlag from "@/app/components/player/CountryFlag";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";
import { getCurrentClubId } from "@/lib/current-club";
import { getNationalityDisplay } from "@/lib/nationalities";
import { rankGlobalPlayers } from "@/lib/player-ranking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const QUALIFICATION_LIMIT = 256;
const PAGE_SIZE = 50;

type RankingPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    country?: string | string[];
    club?: string | string[];
    zone?: string | string[];
    page?: string | string[];
  }>;
};

type RankingRow = {
  id: number;
  position: number;
  firstName: string;
  lastName: string;
  nationalityCode: string;
  nationalityLabel: string;
  age: number;
  club: {
    id: number;
    name: string;
    shortName: string;
  } | null;
};

export default async function RankingPage({
  searchParams,
}: RankingPageProps) {
  const query = await searchParams;
  const filters = {
    search: readParameter(query.q).trim(),
    country: readParameter(query.country),
    club: readParameter(query.club),
    zone: readZone(readParameter(query.zone)),
  };
  const requestedPage = Number.parseInt(
    readParameter(query.page),
    10
  );
  const [currentClubId, activePlayers] = await Promise.all([
    getCurrentClubId(),
    prisma.player.findMany({
      where: {
        careerStatus: "ACTIVE",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationality: true,
        age: true,
        clubId: true,
        club: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
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
  const officialRanking: RankingRow[] = rankGlobalPlayers(
    activePlayers
  ).map(({ player, position }) => {
    const nationality = getNationalityDisplay(player.nationality);

    return {
      id: player.id,
      position,
      firstName: player.firstName,
      lastName: player.lastName,
      nationalityCode: nationality.code,
      nationalityLabel: nationality.label,
      age: player.age,
      club: player.club,
    };
  });
  const normalizedSearch = filters.search.toLocaleLowerCase("it-IT");
  const clubFilter = Number.parseInt(filters.club, 10);
  const filteredRanking = officialRanking.filter((player) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      `${player.firstName} ${player.lastName}`
        .toLocaleLowerCase("it-IT")
        .includes(normalizedSearch) ||
      player.club?.name
        .toLocaleLowerCase("it-IT")
        .includes(normalizedSearch);
    const matchesCountry =
      filters.country.length === 0 ||
      player.nationalityCode === filters.country;
    const matchesClub =
      filters.club.length === 0 ||
      player.club?.id === clubFilter;
    const matchesZone =
      filters.zone === "ALL" ||
      (filters.zone === "QUALIFIED"
        ? player.position <= QUALIFICATION_LIMIT
        : player.position > QUALIFICATION_LIMIT);

    return (
      matchesSearch && matchesCountry && matchesClub && matchesZone
    );
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRanking.length / PAGE_SIZE)
  );
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const visiblePlayers = filteredRanking.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const countryOptions = buildCountryOptions(officialRanking);
  const clubOptions = buildClubOptions(officialRanking);
  const firstExcluded = officialRanking[QUALIFICATION_LIMIT] ?? null;
  const ownQualifiedPlayers = officialRanking.filter(
    (player) =>
      player.position <= QUALIFICATION_LIMIT &&
      player.club?.id === currentClubId
  ).length;
  const hasFilters =
    filters.search.length > 0 ||
    filters.country.length > 0 ||
    filters.club.length > 0 ||
    filters.zone !== "ALL";

  return (
    <main className="space-y-4 text-slate-100">
      <header className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-[linear-gradient(135deg,#2b3026_0%,#173027_58%,#101e19_100%)] p-5 shadow-xl shadow-black/10 sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-amber-300">
              <Trophy size={18} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                Classifica mondiale
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Ranking ufficiale
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              La graduatoria viene ricalcolata sui giocatori attivi. I primi {" "}
              {QUALIFICATION_LIMIT} accedono alla prossima prova individuale;
              l&apos;ordine usa il valore complessivo, senza esporre le singole
              caratteristiche tecniche.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
            <RankingMetric
              icon={<Users size={16} />}
              label="Giocatori attivi"
              value={officialRanking.length}
            />
            <RankingMetric
              icon={<Medal size={16} />}
              label="Qualificati"
              value={Math.min(
                QUALIFICATION_LIMIT,
                officialRanking.length
              )}
              highlight
            />
            <RankingMetric
              icon={<ShieldCheck size={16} />}
              label="Tuoi qualificati"
              value={ownQualifiedPlayers}
            />
            <RankingMetric
              icon={<ListFilter size={16} />}
              label="Primo escluso"
              value={firstExcluded ? `#${firstExcluded.position}` : "—"}
            />
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-4">
        <form className="grid gap-3 xl:grid-cols-[minmax(240px,1.4fr)_minmax(150px,0.7fr)_minmax(180px,1fr)_minmax(160px,0.75fr)_auto] xl:items-end">
          <FilterField label="Cerca giocatore o squadra">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={15}
              />
              <input
                type="search"
                name="q"
                defaultValue={filters.search}
                placeholder="Nome, cognome o club"
                className="h-10 w-full rounded-xl border border-emerald-900/60 bg-emerald-950/35 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/50"
              />
            </div>
          </FilterField>

          <FilterField label="Nazione">
            <select
              name="country"
              defaultValue={filters.country}
              className="h-10 w-full rounded-xl border border-emerald-900/60 bg-emerald-950/35 px-3 text-sm text-white outline-none focus:border-amber-400/50"
            >
              <option value="">Tutte</option>
              {countryOptions.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label} ({country.code})
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Squadra">
            <select
              name="club"
              defaultValue={filters.club}
              className="h-10 w-full rounded-xl border border-emerald-900/60 bg-emerald-950/35 px-3 text-sm text-white outline-none focus:border-amber-400/50"
            >
              <option value="">Tutte</option>
              {clubOptions.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Zona ranking">
            <select
              name="zone"
              defaultValue={filters.zone}
              className="h-10 w-full rounded-xl border border-emerald-900/60 bg-emerald-950/35 px-3 text-sm text-white outline-none focus:border-amber-400/50"
            >
              <option value="ALL">Tutti</option>
              <option value="QUALIFIED">Primi 256</option>
              <option value="OUTSIDE">Fuori qualificazione</option>
            </select>
          </FilterField>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-400 px-4 text-xs font-black text-[#122018] transition hover:bg-amber-300"
            >
              Applica
            </button>
            {hasFilters ? (
              <Link
                href="/ranking"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-900/60 px-3 text-xs font-bold text-slate-400 transition hover:border-emerald-500/40 hover:text-white"
              >
                Azzera
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
        <div className="flex flex-col justify-between gap-2 border-b border-emerald-900/60 px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">
              Graduatoria
            </p>
            <h2 className="mt-0.5 text-lg font-black text-white">
              {hasFilters ? "Risultati filtrati" : "Tutti i giocatori"}
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {filteredRanking.length} risultati · pagina {currentPage} di {" "}
            {totalPages}
          </p>
        </div>

        {visiblePlayers.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead className="bg-emerald-950/30 text-left text-[9px] font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="w-24 px-4 py-2.5 text-center">Pos.</th>
                    <th className="px-3 py-2.5">Giocatore</th>
                    <th className="px-3 py-2.5">Nazione</th>
                    <th className="px-3 py-2.5">Squadra</th>
                    <th className="w-20 px-3 py-2.5 text-center">Età</th>
                    <th className="w-36 px-4 py-2.5 text-right">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/45">
                  {visiblePlayers.map((player) => (
                    <RankingTableRows
                      key={player.id}
                      player={player}
                      isOwnClub={player.club?.id === currentClubId}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-emerald-900/45 md:hidden">
              {visiblePlayers.map((player) => (
                <RankingMobileCard
                  key={player.id}
                  player={player}
                  isOwnClub={player.club?.id === currentClubId}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="px-5 py-14 text-center">
            <Search className="mx-auto text-slate-700" size={30} />
            <p className="mt-3 font-black text-white">
              Nessun giocatore trovato
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Modifica o azzera i filtri per tornare alla classifica completa.
            </p>
          </div>
        )}

        {filteredRanking.length > PAGE_SIZE ? (
          <RankingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            filters={filters}
          />
        ) : null}
      </section>
    </main>
  );
}

function RankingTableRows({
  player,
  isOwnClub,
}: {
  player: RankingRow;
  isOwnClub: boolean;
}) {
  const qualificationLine = player.position === QUALIFICATION_LIMIT + 1;

  return (
    <>
      {qualificationLine ? (
        <tr className="border-y border-amber-400/30 bg-amber-400/[0.06]">
          <td
            colSpan={6}
            className="px-4 py-2 text-center text-[9px] font-black uppercase tracking-[0.18em] text-amber-300"
          >
            Zona qualificazione · sopra i primi {QUALIFICATION_LIMIT}, sotto i
            primi esclusi
          </td>
        </tr>
      ) : null}
      <tr
        className={`transition hover:bg-emerald-400/[0.04] ${
          isOwnClub ? "bg-amber-300/[0.04]" : ""
        }`}
      >
        <td className="px-4 py-2.5 text-center">
          <RankingPosition position={player.position} />
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <PlayerPortrait
              player={player}
              className="h-10 w-10 shrink-0"
            />
            <div className="min-w-0">
              <Link
                href={`/players/${player.id}?from=ranking`}
                className="block truncate text-sm font-black text-white transition hover:text-amber-200 hover:underline"
              >
                {player.firstName} {player.lastName}
              </Link>
              {isOwnClub ? (
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                  La tua squadra
                </p>
              ) : null}
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <Nationality player={player} />
        </td>
        <td className="px-3 py-2.5">
          <ClubLink club={player.club} />
        </td>
        <td className="px-3 py-2.5 text-center text-sm font-bold text-slate-300">
          {player.age}
        </td>
        <td className="px-4 py-2.5 text-right">
          <QualificationBadge position={player.position} />
        </td>
      </tr>
    </>
  );
}

function RankingMobileCard({
  player,
  isOwnClub,
}: {
  player: RankingRow;
  isOwnClub: boolean;
}) {
  const qualificationLine = player.position === QUALIFICATION_LIMIT + 1;

  return (
    <>
      {qualificationLine ? (
        <div className="border-y border-amber-400/30 bg-amber-400/[0.06] px-3 py-2 text-center text-[9px] font-black uppercase tracking-wider text-amber-300">
          Limite dei primi {QUALIFICATION_LIMIT}
        </div>
      ) : null}
      <article
        className={`p-3 ${isOwnClub ? "bg-amber-300/[0.04]" : ""}`}
      >
        <div className="flex items-center gap-3">
          <RankingPosition position={player.position} />
          <PlayerPortrait
            player={player}
            className="h-11 w-11 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/players/${player.id}?from=ranking`}
              className="block truncate text-sm font-black text-white"
            >
              {player.firstName} {player.lastName}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <Nationality player={player} />
              <span>{player.age} anni</span>
            </div>
          </div>
          <QualificationBadge position={player.position} compact />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-emerald-900/40 pt-2">
          <ClubLink club={player.club} />
          {isOwnClub ? (
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
              La tua squadra
            </span>
          ) : null}
        </div>
      </article>
    </>
  );
}

function RankingPosition({ position }: { position: number }) {
  const color =
    position === 1
      ? "border-amber-300/40 bg-amber-300/15 text-amber-200"
      : position === 2
        ? "border-slate-300/30 bg-slate-300/10 text-slate-200"
        : position === 3
          ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
          : "border-emerald-900/60 bg-emerald-950/35 text-slate-300";

  return (
    <span
      className={`inline-flex min-w-11 items-center justify-center rounded-lg border px-2 py-1 text-sm font-black tabular-nums ${color}`}
    >
      #{position}
    </span>
  );
}

function Nationality({ player }: { player: RankingRow }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
      <CountryFlag
        code={player.nationalityCode}
        label={player.nationalityLabel}
      />
      {player.nationalityCode}
    </span>
  );
}

function ClubLink({ club }: { club: RankingRow["club"] }) {
  return club ? (
    <Link
      href={`/clubs/${club.id}?from=ranking`}
      className="text-xs font-bold text-slate-300 transition hover:text-amber-200 hover:underline"
    >
      {club.name}
    </Link>
  ) : (
    <span className="text-xs font-bold text-slate-600">Senza squadra</span>
  );
}

function QualificationBadge({
  position,
  compact = false,
}: {
  position: number;
  compact?: boolean;
}) {
  const qualified = position <= QUALIFICATION_LIMIT;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border font-black uppercase tracking-wider ${
        compact ? "px-2 py-1 text-[8px]" : "px-2.5 py-1 text-[9px]"
      } ${
        qualified
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-slate-700 bg-slate-800/60 text-slate-500"
      }`}
    >
      {qualified ? "Qualificato" : "Fuori zona"}
    </span>
  );
}

function RankingMetric({
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
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p
        className={`mt-1 text-lg font-black tabular-nums ${
          highlight ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function RankingPagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: {
    search: string;
    country: string;
    club: string;
    zone: RankingZone;
  };
}) {
  return (
    <nav
      aria-label="Paginazione ranking"
      className="flex items-center justify-between gap-3 border-t border-emerald-900/60 px-4 py-3"
    >
      {currentPage > 1 ? (
        <Link
          href={buildRankingHref(filters, currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-900/60 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
        >
          <ChevronLeft size={14} />
          Precedente
        </Link>
      ) : (
        <span />
      )}

      <span className="text-xs font-bold text-slate-500">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildRankingHref(filters, currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-900/60 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
        >
          Successiva
          <ChevronRight size={14} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

type RankingZone = "ALL" | "QUALIFIED" | "OUTSIDE";

function readParameter(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readZone(value: string): RankingZone {
  return value === "QUALIFIED" || value === "OUTSIDE"
    ? value
    : "ALL";
}

function buildCountryOptions(players: RankingRow[]) {
  const countries = new Map<
    string,
    { code: string; label: string }
  >();

  for (const player of players) {
    countries.set(player.nationalityCode, {
      code: player.nationalityCode,
      label: player.nationalityLabel,
    });
  }

  return Array.from(countries.values()).sort((first, second) =>
    first.label.localeCompare(second.label, "it-IT")
  );
}

function buildClubOptions(players: RankingRow[]) {
  const clubs = new Map<
    number,
    { id: number; name: string }
  >();

  for (const player of players) {
    if (player.club) {
      clubs.set(player.club.id, {
        id: player.club.id,
        name: player.club.name,
      });
    }
  }

  return Array.from(clubs.values()).sort((first, second) =>
    first.name.localeCompare(second.name, "it-IT")
  );
}

function buildRankingHref(
  filters: {
    search: string;
    country: string;
    club: string;
    zone: RankingZone;
  },
  page: number
) {
  const parameters = new URLSearchParams();

  if (filters.search) parameters.set("q", filters.search);
  if (filters.country) parameters.set("country", filters.country);
  if (filters.club) parameters.set("club", filters.club);
  if (filters.zone !== "ALL") parameters.set("zone", filters.zone);
  if (page > 1) parameters.set("page", String(page));

  const query = parameters.toString();
  return query ? `/ranking?${query}` : "/ranking";
}
