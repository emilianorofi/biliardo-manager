import "server-only";

import type { Prisma } from "@/generated/prisma/client";

type MarketCommitmentClient = Pick<
  Prisma.TransactionClient,
  "transferListing"
>;

export type MarketCommitments = {
  reservedCredits: number;
  reservedRosterPlaces: number;
};

export async function getMarketCommitments(
  client: MarketCommitmentClient,
  clubId: number,
  excludeListingId?: number
): Promise<MarketCommitments> {
  const auctions =
    await client.transferListing.findMany({
      where: {
        ...(excludeListingId
          ? {
              id: {
                not: excludeListingId,
              },
            }
          : {}),
        listingType: "AUCTION",
        status: {
          in: ["ACTIVE", "PENDING_TRANSFER"],
        },
        bids: {
          some: {
            bidderClubId: clubId,
          },
        },
      },
      select: {
        player: {
          select: {
            salary: true,
          },
        },
        bids: {
          orderBy: [
            {
              amount: "desc",
            },
            {
              createdAt: "asc",
            },
          ],
          take: 1,
          select: {
            amount: true,
            bidderClubId: true,
          },
        },
      },
    });

  return auctions.reduce<MarketCommitments>(
    (commitments, auction) => {
      const leadingBid = auction.bids[0];

      if (leadingBid?.bidderClubId !== clubId) {
        return commitments;
      }

      return {
        reservedCredits:
          commitments.reservedCredits +
          leadingBid.amount +
          auction.player.salary,
        reservedRosterPlaces:
          commitments.reservedRosterPlaces + 1,
      };
    },
    {
      reservedCredits: 0,
      reservedRosterPlaces: 0,
    }
  );
}
