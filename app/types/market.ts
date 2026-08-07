export type MarketListingType =
  | "AUCTION"
  | "FREE_AGENT";

export type MarketTab =
  | "all"
  | "auction"
  | "free";

export interface MarketPlayer {
  id: number;
  listingId: number;
  listingType: MarketListingType;

  name: string;
  initials: string;
  nationality: string;
  age: number;

  overall: number;

  italiana: number;
  goriziana: number;
  tuttiDoppi: number;

  estimatedValue: number;
  salary: number;
  openingPrice: number;
  currentPrice: number;

  bidCount: number;

  sellerClub: string | null;
  lastBidClub: string | null;

  expiresAt: string | null;
  expiresAtLabel: string | null;

  userBid: number | null;
  isUserHighestBid: boolean;
}

export interface MarketUserBid {
  listingId: number;
  playerName: string;
  amount: number;
  salary: number;
  totalCommitment: number;
  currentPrice: number;
  isHighest: boolean;
  expiresAtLabel: string | null;
}
