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

      

      {/* Players table */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">

  <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

    <div>
      <h2 className="text-2xl font-bold text-white">
        ROSA GIOCATORI
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        {players.length} giocatori
      </p>
    </div>

    <div className="flex items-center gap-3">

      <button className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white hover:border-green-500">
        Tutti i ruoli ▼
      </button>

      <button className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-500">
        + Aggiungi giocatore
      </button>

    </div>

  </div>

  <div className="h-[760px] overflow-y-auto space-y-4 p-5">

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