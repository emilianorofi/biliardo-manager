UPDATE "TransferListing"
SET "endsAt" = "startsAt" + INTERVAL '105 days'
WHERE "listingType" = 'FREE_AGENT'
  AND "status" = 'ACTIVE'
  AND "endsAt" IS NULL;
