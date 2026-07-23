import PlayerListCard from "../components/player/PlayerListCard";
import { players } from "../data/players";

export default function PlayersPage() {
  const averageAge =
    players.length > 0
      ? Math.round(
          players.reduce((total, player) => total + player.age, 0) /
            players.length
        )
      : 0;

  const averageOverall =
    players.length > 0
      ? Math.round(
          players.reduce((total, player) => total + player.overall, 0) /
            players.length
        )
      : 0;

  return (
    <main className="space-y-7">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            Prima squadra
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Rosa giocatori
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Controlla caratteristiche, stato e specialità dei giocatori della
            tua squadra.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <TeamStat label="Giocatori" value={players.length} />
          <TeamStat label="Età media" value={averageAge} />
          <TeamStat label="Overall medio" value={averageOverall} highlight />
        </div>
      </header>

      <section className="space-y-4">
        {players.map((player) => (
          <PlayerListCard key={player.id} player={player} />
        ))}
      </section>
    </main>
  );
}

function TeamStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-28 rounded-2xl border border-emerald-900/60 bg-[#183129] px-4 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-black ${
          highlight ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}