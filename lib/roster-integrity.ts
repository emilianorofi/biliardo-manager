import { MIN_FIRST_TEAM_PLAYERS } from "@/lib/game-config";

type RetirementCandidate = {
  id: number;
  clubId: number | null;
};

export function limitClubRetirements<T extends RetirementCandidate>(
  activePlayers: readonly T[],
  requestedRetirements: readonly T[]
) {
  const activeByClub = new Map<number, number>();
  for (const player of activePlayers) {
    if (player.clubId === null) continue;
    activeByClub.set(
      player.clubId,
      (activeByClub.get(player.clubId) ?? 0) + 1
    );
  }

  const acceptedByClub = new Map<number, number>();
  const accepted: T[] = [];

  for (const player of requestedRetirements) {
    if (player.clubId === null) {
      accepted.push(player);
      continue;
    }

    const activeCount = activeByClub.get(player.clubId) ?? 0;
    const retirementLimit = Math.max(
      0,
      activeCount - MIN_FIRST_TEAM_PLAYERS
    );
    const alreadyAccepted = acceptedByClub.get(player.clubId) ?? 0;

    if (alreadyAccepted >= retirementLimit) continue;

    accepted.push(player);
    acceptedByClub.set(player.clubId, alreadyAccepted + 1);
  }

  return accepted;
}
