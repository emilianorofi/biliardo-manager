-- Un giocatore può essere rimesso sul mercato dopo la conclusione di una vendita precedente.
DROP INDEX "TransferListing_playerId_key";

CREATE INDEX "TransferListing_playerId_idx" ON "TransferListing"("playerId");
