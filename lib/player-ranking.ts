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

export function buildGlobalPlayerRanking(
  players: RankablePlayer[]
) {
  const rankedPlayers = players
    .map((player) => ({
      id: player.id,
      overall: calculateOverall(player),
    }))
    .sort(
      (first, second) =>
        second.overall - first.overall || first.id - second.id
    );

  return new Map<number, GlobalPlayerRanking>(
    rankedPlayers.map((player, index) => [
      player.id,
      {
        overall: player.overall,
        position: index + 1,
      },
    ])
  );
}
