export const BID_INCREMENT_PERCENTAGE = 0.05;
export const MINIMUM_BID_INCREMENT = 100;
export const AUCTION_DURATION_HOURS = 72;
export const AUCTION_EXTENSION_MINUTES = 3;
export const FREE_AGENT_AVAILABILITY_DAYS = 105;

export function getMinimumBid(
  currentPrice: number
) {
  const percentageIncrement = Math.ceil(
    currentPrice * BID_INCREMENT_PERCENTAGE
  );

  return (
    currentPrice +
    Math.max(
      MINIMUM_BID_INCREMENT,
      percentageIncrement
    )
  );
}

export function getExtendedDeadline(now: Date) {
  return new Date(
    now.getTime() +
      AUCTION_EXTENSION_MINUTES * 60 * 1000
  );
}

export function getAuctionDeadline(now: Date) {
  return new Date(
    now.getTime() +
      AUCTION_DURATION_HOURS * 60 * 60 * 1000
  );
}

export function getFreeAgentDeadline(now: Date) {
  return new Date(
    now.getTime() +
      FREE_AGENT_AVAILABILITY_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}
