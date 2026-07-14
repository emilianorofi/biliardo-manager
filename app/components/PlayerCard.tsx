import { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-white">
            {player.firstName} {player.lastName}
          </h2>

          <p className="text-sm text-zinc-400">
            Categoria {player.category}
          </p>
        </div>

        <div className="text-5xl font-extrabold text-yellow-400">
          {player.overall}
        </div>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-zinc-500">Età</p>
          <p className="font-semibold">{player.age}</p>
        </div>

        <div>
          <p className="text-zinc-500">Talento</p>
          <p className="font-semibold">{player.talent}</p>
        </div>

        <div>
          <p className="text-zinc-500">Forma</p>
          <p className="font-semibold text-green-400">
            {player.form}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">Morale</p>
          <p className="font-semibold text-yellow-400">
            {player.morale}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">Valore</p>
          <p className="font-semibold">
            € {player.marketValue.toLocaleString("it-IT")}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">Contratto</p>
          <p className="font-semibold">
            {player.contractYears} anni
          </p>
        </div>

      </div>

      <div className="mt-6 rounded-xl bg-zinc-800 p-3">

        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Tratto Speciale
        </p>

        <p className="mt-1 font-semibold text-yellow-400">
          {player.specialTrait}
        </p>

      </div>

      <button className="mt-6 w-full rounded-xl bg-yellow-500 py-3 font-bold text-black transition hover:bg-yellow-400">
        Dettagli
      </button>

    </div>
  );
}