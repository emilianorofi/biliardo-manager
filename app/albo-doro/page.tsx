import Link from "next/link";
import { Crown, Flag, Medal, Trophy } from "lucide-react";

import { getHallOfFame } from "@/lib/hall-of-fame";

export const dynamic = "force-dynamic";

export default async function HallOfFamePage() {
  const seasons = await getHallOfFame();

  return (
    <main className="space-y-4 text-slate-100">
      <header className="rounded-3xl border border-amber-400/20 bg-[linear-gradient(135deg,#30291d_0%,#173027_58%,#101e19_100%)] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-amber-300">
          <Crown size={18} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Archivio storico
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          Albo d&apos;oro
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Campioni e vincitori di ogni stagione del mondo di Biliardo Manager.
        </p>
      </header>

      {seasons.map((season) => (
        <section
          key={season.seasonNumber}
          className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]"
        >
          <div className="flex items-center justify-between border-b border-emerald-900/50 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Stagione {season.seasonNumber}
              </p>
              <h2 className="text-lg font-black text-white">{season.seasonName}</h2>
            </div>
            <Trophy className="text-amber-300" size={20} />
          </div>

          <div className="grid gap-3 p-4 lg:grid-cols-3">
            <HonourBlock icon={<Trophy size={15} />} title="Prima Serie">
              {season.leagueChampion ? (
                <Link
                  href={`/clubs/${season.leagueChampion.clubId}`}
                  className="font-black text-amber-200 hover:underline"
                >
                  🏆 {season.leagueChampion.clubName}
                </Link>
              ) : (
                <Empty />
              )}
            </HonourBlock>

            <HonourBlock icon={<Flag size={15} />} title="Coppa delle Nazioni">
              {season.nationsCupChampion ? (
                <p className="font-black text-white">🏆 {season.nationsCupChampion}</p>
              ) : (
                <Empty />
              )}
            </HonourBlock>

            <HonourBlock icon={<Medal size={15} />} title="Coppe Specialità">
              {season.specialtyCupChampions.length ? (
                <div className="space-y-1">
                  {season.specialtyCupChampions.map((champion) => (
                    <p key={`${champion.name}-${champion.playerId}`} className="text-xs">
                      <span className="text-slate-500">{champion.name}: </span>
                      <Link href={`/players/${champion.playerId}`} className="font-black text-white hover:text-amber-200 hover:underline">
                        {champion.playerName}
                      </Link>
                    </p>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </HonourBlock>
          </div>

          <div className="border-t border-emerald-900/40 px-4 py-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Tornei individuali e Mondiale
            </p>
            {season.individualChampions.length ? (
              <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                {season.individualChampions.map((champion) => (
                  <div key={champion.tournamentId} className="rounded-lg border border-emerald-900/40 bg-black/10 px-2.5 py-2">
                    <p className="truncate text-[10px] text-slate-500">{champion.name}</p>
                    <Link href={`/players/${champion.playerId}`} className="text-xs font-black text-white hover:text-amber-200 hover:underline">
                      {champion.type === "MONDIALE" ? "🌍 " : "🏆 "}
                      {champion.playerName}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </section>
      ))}

      {seasons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-900/60 bg-[#15261f] p-10 text-center text-sm text-slate-500">
          Nessuna stagione disponibile.
        </div>
      ) : null}
    </main>
  );
}

function HonourBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-emerald-900/45 bg-black/10 p-3">
      <div className="mb-2 flex items-center gap-2 text-amber-300">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-xs text-slate-600">Non ancora assegnato</p>;
}
