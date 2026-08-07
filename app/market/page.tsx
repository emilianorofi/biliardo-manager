import MarketContent from "@/app/components/market/MarketContent";
import type {
  MarketListingType,
  MarketPlayer,
  MarketUserBid,
} from "@/app/types/market";
import { USER_CLUB_ID } from "@/lib/game-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const now = new Date();

  const [club, listings] = await Promise.all([
    prisma.club.findUnique({
      where: {
        id: USER_CLUB_ID,
      },
      select: {
        balance: true,
      },
    }),
    prisma.transferListing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            listingType: "FREE_AGENT",
          },
          {
            listingType: "AUCTION",
            endsAt: {
              gt: now,
            },
          },
        ],
      },
      include: {
        player: true,
        sellerClub: {
          select: {
            name: true,
          },
        },
        bids: {
          include: {
            bidderClub: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [
            {
              amount: "desc",
            },
            {
              createdAt: "asc",
            },
          ],
        },
      },
      orderBy: [
        {
          endsAt: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    }),
  ]);

  if (!club) {
    throw new Error("Club principale non disponibile.");
  }

  const players: MarketPlayer[] = listings.map(
    (listing) => {
      const player = listing.player;
      const highestBid = listing.bids[0] ?? null;
      const userBid =
        listing.bids.find(
          (bid) =>
            bid.bidderClubId === USER_CLUB_ID
        ) ?? null;

      const listingType: MarketListingType =
        listing.listingType === "FREE_AGENT"
          ? "FREE_AGENT"
          : "AUCTION";

      return {
        id: player.id,
        listingId: listing.id,
        listingType,
        name: `${player.firstName} ${player.lastName}`,
        initials: `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`,
        nationality: player.nationality,
        age: player.age,
        overall: calculateOverall(player),
        italiana: Math.round(
          (player.precisione + player.diretto) / 2
        ),
        goriziana: Math.round(
          (player.precisione + player.sponde) / 2
        ),
        tuttiDoppi: Math.round(
          (player.diretto + player.sponde) / 2
        ),
        estimatedValue: player.value,
        openingPrice: listing.openingPrice,
        currentPrice:
          highestBid?.amount ?? listing.openingPrice,
        bidCount: listing.bids.length,
        sellerClub: listing.sellerClub?.name ?? null,
        lastBidClub:
          highestBid?.bidderClub.name ?? null,
        expiresAt:
          listing.endsAt?.toISOString() ?? null,
        expiresAtLabel: formatDeadline(
          listing.endsAt
        ),
        userBid: userBid?.amount ?? null,
        isUserHighestBid:
          highestBid?.bidderClubId === USER_CLUB_ID,
      };
    }
  );

  const userBids: MarketUserBid[] = players
    .filter(
      (player) => player.userBid !== null
    )
    .map((player) => ({
      listingId: player.listingId,
      playerName: player.name,
      amount: player.userBid as number,
      currentPrice: player.currentPrice,
      isHighest: player.isUserHighestBid,
      expiresAtLabel: player.expiresAtLabel,
    }));

  return (
    <MarketContent
      initialPlayers={players}
      credits={club.balance}
      userBids={userBids}
    />
  );
}

function calculateOverall(player: {
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
}) {
  return Math.round(
    (player.precisione +
      player.diretto +
      player.sponde +
      player.tattica +
      player.mentalita +
      player.difesa +
      player.realizzazione +
      player.creativita +
      player.misura) /
      9
  );
}

function formatDeadline(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(value);
}
