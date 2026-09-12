import { Flag, Trophy, Users } from "lucide-react";
import Link from "next/link";

import CountryFlag from "@/app/components/player/CountryFlag";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";
import { NATIONS_CUP_GROUPS } from "@/lib/nations-cup";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NationsCupPage() {
  const cup = await prisma.nationsCupTournament.findFirst({
    orderBy: { season: { number: "desc" } },
    include: {
      season: { select: { name: true } },
      entries: {
        orderBy: [{ groupCode: "asc" }, { points: "desc" }, { pointsFor: "desc" }, { seed: "asc" }],
        include: {
          firstPlayer: { select: { id: true, firstName: true, lastName: true, age: true } },
          secondPlayer: { select: { id: true, firstName: true, lastName: true, age: true } },
          thirdPlayer: { select: { id: true, firstName: true, lastName: true, age: true } },
        },
      },
      matches: {
        orderBy: [{ stageOrder: "asc" }, { position: "asc" }],
        include: {
          homeEntry: true,
          awayEntry: true,
          winnerEntry: true,
          tieBreakWinnerPlayer: { select: { id: true, firstName: true, lastName: true, age: true } },
        },
      },
    },
  });

  return (
    <main className="space-y-4 text-zinc-100">
      <header className="rounded-3xl border border-sky-400/20 bg-[linear-gradient(135deg,#162b31_0%,#143126_60%,#101d18_100%)] p-6">
        <div className="flex items-center gap-2 text-sky-300"><Flag size={17} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Competizione mondiale</span></div>
        <h1 className="mt-2 text-3xl font-black text-white">Coppa delle Nazioni</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Sedici nazioni, i migliori tre giocatori di ciascuna, quattro gironi al sabato e fase finale alla domenica. Dal quarto in poi ogni 3-3 viene deciso dai due numeri uno in una specialità casuale.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Metric icon={<Users size={16} />} label="Nazionali" value="16" />
          <Metric icon={<Users size={16} />} label="Convocati" value="48" />
          <Metric icon={<Trophy size={16} />} label="Incontri" value="31" />
        </div>
      </header>

      {!cup || cup.entries.length === 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-xl font-black text-white">Sorteggio non ancora effettuato</h2>
          <p className="mt-2 text-sm text-zinc-400">Le convocazioni saranno pubblicate il sabato della settimana tra andata e ritorno.</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            {NATIONS_CUP_GROUPS.map((group) => (
              <article key={group} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <div className="border-b border-zinc-800 px-4 py-3"><h2 className="font-black text-white">Girone {group}</h2></div>
                <div className="divide-y divide-zinc-800">
                  {cup.entries.filter((entry) => entry.groupCode === group).map((entry) => (
                    <div key={entry.id} className="grid grid-cols-[1fr_repeat(4,42px)] items-center gap-2 px-4 py-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-black text-white"><CountryFlag code={entry.nationCode} label={entry.nationName} className="h-4 w-6" />{entry.nationName}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[entry.firstPlayer, entry.secondPlayer, entry.thirdPlayer].map((player) => (
                            <Link key={player.id} href={`/players/${player.id}`} className="flex items-center gap-1.5 rounded-lg bg-black/15 p-1.5 text-[10px] text-zinc-400 transition hover:text-amber-300">
                              <PlayerPortrait player={player} className="h-14 w-11" />
                              <span>{player.firstName} {player.lastName}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <Cell label="G" value={entry.played} /><Cell label="PF" value={entry.pointsFor} /><Cell label="PS" value={entry.pointsAgainst} /><Cell label="PT" value={entry.points} strong />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-4 py-3"><h2 className="font-black text-white">Calendario e risultati</h2></div>
            <div className="divide-y divide-zinc-800">
              {cup.matches.map((match) => (
                <div key={match.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[120px_1fr_auto_1fr] sm:items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">{stageLabel(match.stage)}{match.groupCode ? ` · ${match.groupCode}` : ""}</span>
                  <span className="font-bold text-white">{match.homeEntry.nationName}</span>
                  <span className="font-black text-amber-300">{match.homeScore ?? "–"} : {match.awayScore ?? "–"}</span>
                  <span className="font-bold text-white sm:text-right">{match.awayEntry.nationName}</span>
                  {match.tieBreakWinnerPlayer ? <p className="sm:col-span-4 text-[10px] text-sky-300">Spareggio {match.tieBreakSpecialty}: <Link href={`/players/${match.tieBreakWinnerPlayer.id}`} className="font-bold hover:text-amber-200 hover:underline">{match.tieBreakWinnerPlayer.firstName} {match.tieBreakWinnerPlayer.lastName}</Link></p> : null}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/15 p-3"><div className="flex items-center gap-2 text-sky-300">{icon}<span className="text-[9px] font-black uppercase tracking-wider">{label}</span></div><p className="mt-1 text-xl font-black text-white">{value}</p></div>;
}
function Cell({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className="text-center"><p className="text-[8px] text-zinc-600">{label}</p><p className={strong ? "font-black text-amber-300" : "font-bold text-zinc-300"}>{value}</p></div>;
}
function stageLabel(stage: string) {
  if (stage.startsWith("GROUP_")) return `${stage.slice(-1)}ª giornata`;
  if (stage === "QUARTER_FINAL") return "Quarti";
  if (stage === "SEMI_FINAL") return "Semifinali";
  return "Finale";
}
