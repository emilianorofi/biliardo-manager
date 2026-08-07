-- AlterTable
ALTER TABLE "TransferListing"
ADD COLUMN "winnerClubId" INTEGER,
ADD COLUMN "finalPrice" INTEGER,
ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TransferListing_winnerClubId_idx" ON "TransferListing"("winnerClubId");

-- AddForeignKey
ALTER TABLE "TransferListing" ADD CONSTRAINT "TransferListing_winnerClubId_fkey" FOREIGN KEY ("winnerClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
