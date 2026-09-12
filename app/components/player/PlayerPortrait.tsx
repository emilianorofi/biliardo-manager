import clsx from "clsx";

import type { Player } from "@/app/types/player";
import { getPlayerPortraitIdentity } from "@/lib/player-portraits";

type PortraitPlayer = Pick<
  Player,
  "id" | "firstName" | "lastName" | "age"
>;

export default function PlayerPortrait({
  player,
  className,
}: {
  player: PortraitPlayer;
  className?: string;
}) {
  const identity = getPlayerPortraitIdentity(player.id);
  const agePhase = getAgePhaseIndex(player.age);
  const column = agePhase % 4;
  const row = Math.floor(agePhase / 4);

  return (
    <div
      role="img"
      aria-label={`Ritratto di ${player.firstName} ${player.lastName}`}
      className={clsx(
        "overflow-hidden rounded-lg border border-white/10 bg-[#0f1d18] bg-no-repeat shadow-md shadow-black/30",
        className
      )}
      style={{
        backgroundImage: `url('/players/billiards-player-identity-${identity}.webp')`,
        backgroundSize: "400% auto",
        backgroundPosition: `${column * (100 / 3)}% ${row * 100}%`,
      }}
    />
  );
}

function getAgePhaseIndex(age: number) {
  if (age <= 17) return 0;
  if (age <= 24) return 1;
  if (age <= 34) return 2;
  if (age <= 44) return 3;
  if (age <= 54) return 4;
  if (age <= 64) return 5;
  if (age <= 74) return 6;

  return 7;
}
