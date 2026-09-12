import {
  calculateOverall,
  type TrainingPlayerValues,
} from "@/lib/training-engine";

export type RankablePlayer = TrainingPlayerValues & {
  id: number;
};

export type GlobalPlayerRanking = {
  overall: number;
  position: number;
};

export type RankedGlobalPlayer<T extends RankablePlayer> = {
  player: T;
  overall: number;
  position: number;
};

export function rankGlobalPlayers<T extends RankablePlayer>(
  players: T[]
): RankedGlobalPlayer<T>[] {
  return players
    .map((player) => ({
      player,
      overall: calculateOverall(player),
    }))
    .sort(
      (first, second) =>
        second.overall - first.overall ||
        first.player.id - second.player.id
    )
    .map((rankedPlayer, index) => ({
      ...rankedPlayer,
      position: index + 1,
    }));
}

export function buildGlobalPlayerRanking(
  players: RankablePlayer[]
) {
  const rankedPlayers = rankGlobalPlayers(players);

  return new Map<number, GlobalPlayerRanking>(
    rankedPlayers.map((rankedPlayer) => [
      rankedPlayer.player.id,
      {
        overall: rankedPlayer.overall,
        position: rankedPlayer.position,
      },
    ])
  );
}
