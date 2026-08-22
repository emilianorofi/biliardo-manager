-- Allinea i totali delle prove ai punteggi ottenibili con i singoli tiri:
-- Italiana mai sotto 2, Goriziana sempre pari, Tutti Doppi multiplo di 4.
UPDATE "IndividualTournamentGame"
SET
  "playerOneScore" = CASE "specialty"
    WHEN 'ITALIANA' THEN GREATEST(2, "playerOneScore")
    WHEN 'GORIZIANA' THEN GREATEST(2, ROUND("playerOneScore" / 2.0)::integer * 2)
    WHEN 'TUTTI_DOPPI' THEN GREATEST(4, ROUND("playerOneScore" / 4.0)::integer * 4)
    ELSE "playerOneScore"
  END,
  "playerTwoScore" = CASE "specialty"
    WHEN 'ITALIANA' THEN GREATEST(2, "playerTwoScore")
    WHEN 'GORIZIANA' THEN GREATEST(2, ROUND("playerTwoScore" / 2.0)::integer * 2)
    WHEN 'TUTTI_DOPPI' THEN GREATEST(4, ROUND("playerTwoScore" / 4.0)::integer * 4)
    ELSE "playerTwoScore"
  END;

ALTER TABLE "IndividualTournamentGame"
ADD CONSTRAINT "IndividualTournamentGame_score_granularity_check"
CHECK (
  (
    "specialty" = 'ITALIANA'
    AND "playerOneScore" >= 2
    AND "playerTwoScore" >= 2
  )
  OR (
    "specialty" = 'GORIZIANA'
    AND MOD("playerOneScore", 2) = 0
    AND MOD("playerTwoScore", 2) = 0
  )
  OR (
    "specialty" = 'TUTTI_DOPPI'
    AND MOD("playerOneScore", 4) = 0
    AND MOD("playerTwoScore", 4) = 0
  )
);
