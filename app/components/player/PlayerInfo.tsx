import PlayerStatus from "./PlayerStatus";
import { GamePlayer } from "@/lib/game-data";

type Props = {
  player: GamePlayer;
};

export default function PlayerInfo({ player }: Props) {
  return (
    <div className="flex items-center gap-4">

      {/* Avatar */}

      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-5xl">
        👤
      </div>

      {/* Info */}

      <div className="flex flex-col">

        <h2 className="text-2xl font-black leading-none text-white">
          {player.firstName}
        </h2>

        <h2 className="text-2xl font-black leading-none text-white">
          {player.lastName}
        </h2>

        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
          <span>🇮🇹</span>
          <span>{player.nationality}</span>
        </div>

        <div className="mt-3 text-sm text-zinc-500">
          {player.age} anni
        </div>
        <PlayerStatus
        experience={player.experience}
        form={player.form}
        morale={player.morale}
      />

      </div>

    </div>
  );
}