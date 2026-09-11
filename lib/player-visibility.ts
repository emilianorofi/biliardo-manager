export function canViewPlayerTechnicalValues(
  viewerClubId: number | null | undefined,
  playerClubId: number | null | undefined
) {
  return (
    viewerClubId !== null &&
    viewerClubId !== undefined &&
    playerClubId !== null &&
    playerClubId !== undefined &&
    viewerClubId === playerClubId
  );
}
