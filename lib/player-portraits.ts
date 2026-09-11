export const PLAYER_PORTRAIT_IDENTITIES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

export function getPlayerPortraitIdentity(playerId: number) {
  const index =
    Math.abs(playerId) % PLAYER_PORTRAIT_IDENTITIES.length;

  return PLAYER_PORTRAIT_IDENTITIES[index];
}
