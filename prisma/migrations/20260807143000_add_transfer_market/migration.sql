-- AlterTable
ALTER TABLE "Player" DROP CONSTRAINT "Player_clubId_fkey";

ALTER TABLE "Player" ALTER COLUMN "clubId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TransferListing" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "sellerClubId" INTEGER,
    "listingType" TEXT NOT NULL DEFAULT 'AUCTION',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "openingPrice" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferBid" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "bidderClubId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferBid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransferListing_playerId_key" ON "TransferListing"("playerId");

-- CreateIndex
CREATE INDEX "TransferListing_sellerClubId_idx" ON "TransferListing"("sellerClubId");

-- CreateIndex
CREATE INDEX "TransferListing_listingType_idx" ON "TransferListing"("listingType");

-- CreateIndex
CREATE INDEX "TransferListing_status_idx" ON "TransferListing"("status");

-- CreateIndex
CREATE INDEX "TransferListing_endsAt_idx" ON "TransferListing"("endsAt");

-- CreateIndex
CREATE INDEX "TransferBid_listingId_idx" ON "TransferBid"("listingId");

-- CreateIndex
CREATE INDEX "TransferBid_bidderClubId_idx" ON "TransferBid"("bidderClubId");

-- CreateIndex
CREATE INDEX "TransferBid_createdAt_idx" ON "TransferBid"("createdAt");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferListing" ADD CONSTRAINT "TransferListing_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferListing" ADD CONSTRAINT "TransferListing_sellerClubId_fkey" FOREIGN KEY ("sellerClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferBid" ADD CONSTRAINT "TransferBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "TransferListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferBid" ADD CONSTRAINT "TransferBid_bidderClubId_fkey" FOREIGN KEY ("bidderClubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
