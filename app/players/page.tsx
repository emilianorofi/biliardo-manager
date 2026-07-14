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
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">
              Rosa prima squadra
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Valori e caratteristiche tecniche dei giocatori
            </p>
          </div>

          <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
            {players.length} giocatori
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr className="text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-4">Giocatore</th>
                <th className="px-3 py-4 text-center">Età</th>
                <th className="px-3 py-4 text-center">Naz.</th>
                <th className="px-3 py-4 text-center">OVR</th>
                <th className="px-3 py-4 text-center">Precisione</th>
                <th className="px-3 py-4 text-center">Diretto</th>
                <th className="px-3 py-4 text-center">Sponde</th>
                <th className="px-3 py-4 text-center">Tattica</th>
                <th className="px-3 py-4 text-center">Mentalità</th>
                <th className="px-3 py-4 text-center">Difesa</th>
                <th className="px-3 py-4 text-center">Realizzazione</th>
                <th className="px-3 py-4 text-center">Creatività</th>
                <th className="px-3 py-4 text-center">Misura</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {players.map((player) => (
                <tr
                  key={player.id}
                  className="transition hover:bg-white/[0.04]"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/players/${player.id}`}
                      className="font-semibold text-white transition hover:text-yellow-400"
                    >
                      {player.firstName} {player.lastName}
                    </Link>
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.age}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.nationality}
                  </td>

                  <td className="px-3 py-4 text-center">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 font-bold text-yellow-400">
                      {getPlayerOverall(player)}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.precision}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.direct}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.banks}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.tactics}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.mentality}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.defense}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.finishing}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.creativity}
                  </td>

                  <td className="px-3 py-4 text-center text-zinc-300">
                    {player.skills.measure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}