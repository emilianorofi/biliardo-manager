import Link from "next/link";
import {
  GamePlayer,
  getPlayerOverall,
  getItalianScore,
  getGorizianaScore,
  getTuttiDoppiScore,
} from "@/lib/game-data";

type Props = {
  player: GamePlayer;
};

export default function PlayerListCard({ player }: Props) {
  const overall = getPlayerOverall(player);

  const italiana = getItalianScore(player);
  const goriziana = getGorizianaScore(player);
  const tuttiDoppi = getTuttiDoppiScore(player);

  return (
    <Link
      href={`/players/${player.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#171717] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/5"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/5 p-5">

        <div className="flex gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 text-xl font-bold text-black">
            {player.firstName[0]}
            {player.lastName[0]}
          </div>

          <div>

            <h3 className="text-lg font-bold text-white">
              {player.firstName} {player.lastName}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              🇮🇹 {player.nationality} • {player.age} anni
            </p>

          </div>

        </div>

        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-center">

          <div className="text-xs uppercase tracking-wider text-yellow-300">
            OVR
          </div>

          <div className="text-2xl font-black text-yellow-400">
            {overall}
          </div>

        </div>

      </div>

      {/* Specialità */}

      <div className="space-y-3 p-5">

        <div className="flex items-center justify-between">

          <span className="text-sm text-zinc-400">
            🎱 Italiana
          </span>

          <span className="font-bold text-white">
            {italiana}
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm text-zinc-400">
            🎱 Goriziana
          </span>

          <span className="font-bold text-white">
            {goriziana}
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm text-zinc-400">
            🎱 Tutti Doppi
          </span>

          <span className="font-bold text-white">
            {tuttiDoppi}
          </span>

        </div>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-white/5 bg-black/20 px-5 py-3">

        <span className="text-xs uppercase tracking-widest text-zinc-500">
          Apri scheda
        </span>

        <span className="translate-x-0 text-xl text-yellow-400 transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>

      </div>

    </Link>
  );
}