import PlayerListCard from "@/app/components/player/PlayerListCard";
import Link from "next/link";
import {
  players as allPlayers,
  teams,
  getPlayerOverall,
} from "@/lib/game-data";

const club = {
  name: "Accademia Biliardo Pontedera",
};

const userTeam = teams.find((team) => team.isUserTeam);
const players = allPlayers.filter(
  (player) => player.teamId === userTeam?.id
);


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
        players.reduce(
          (total, player) => total + getPlayerOverall(player),
          0
        ) / players.length
      )
      : 0;

  const bestPlayer =
    players.length > 0
      ? players.reduce((best, player) =>
        getPlayerOverall(player) > getPlayerOverall(best) ? player : best
      )
      : null;

  return (
    <main className="min-h-screen space-y-6 bg-[#0a0a0a] p-4 sm:p-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-yellow-400">Prima squadra</p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Giocatori
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Rosa di {club.name} · {players.length} giocatori
        </p>
      </div>

      {/* Squad summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Rosa
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {players.length}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Giocatori in prima squadra
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Età media
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {averageAge}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Anni
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Overall medio
          </p>
          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {averageOverall}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Valore medio della rosa
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
            Miglior giocatore
          </p>

          {bestPlayer && (
            <>
              <p className="mt-2 truncate text-xl font-bold text-white">
                {bestPlayer.firstName} {bestPlayer.lastName}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Overall{" "}
                <span className="font-bold text-yellow-400">
                  {getPlayerOverall(bestPlayer)}
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Players table */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-xl font-bold text-white">
            Rosa Prima Squadra
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {players.length} giocatori
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerListCard
              key={player.id}
              player={player}
            />
          ))}
        </div>
      </section>
    </main>
  );
}