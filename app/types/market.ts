export interface MarketPlayer {
  id: number;
  name: string;
  avatar: string;
  nationality: string;
  age: number;

  overall: number;

  italiana: number;
  goriziana: number;
  tuttiDoppi: number;

  value: number;

  interested: number;

  lastBid: number;
  lastBidClub: string;

  remainingTime: string;
}