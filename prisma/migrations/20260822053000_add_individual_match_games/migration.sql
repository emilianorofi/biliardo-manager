-- Registra le singole prove degli incontri individuali.
CREATE TABLE "IndividualTournamentGame" (
  "id" SERIAL NOT NULL,
  "matchId" INTEGER NOT NULL,
  "order" INTEGER NOT NULL,
  "specialty" TEXT NOT NULL,
  "winnerSide" TEXT NOT NULL,
  "playerOnePerformanceRating" DOUBLE PRECISION NOT NULL,
  "playerTwoPerformanceRating" DOUBLE PRECISION NOT NULL,
  "reconstructed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "IndividualTournamentGame_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IndividualTournamentGame_matchId_order_key"
ON "IndividualTournamentGame"("matchId", "order");

CREATE INDEX "IndividualTournamentGame_matchId_idx"
ON "IndividualTournamentGame"("matchId");

CREATE INDEX "IndividualTournamentGame_specialty_idx"
ON "IndividualTournamentGame"("specialty");

ALTER TABLE "IndividualTournamentGame"
ADD CONSTRAINT "IndividualTournamentGame_matchId_fkey"
FOREIGN KEY ("matchId") REFERENCES "IndividualTournamentMatch"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Ricostruisce le prove dei tornei già disputati prima dell'introduzione
-- dello storico dettagliato. L'ordine preserva sempre il punteggio finale:
-- in un 2-1 il secondo gioco viene assegnato allo sconfitto.
INSERT INTO "IndividualTournamentGame" (
  "matchId",
  "order",
  "specialty",
  "winnerSide",
  "playerOnePerformanceRating",
  "playerTwoPerformanceRating",
  "reconstructed",
  "createdAt"
)
SELECT
  tournament_match."id",
  game_order."value",
  CASE tournament."type"
    WHEN 'ITALIANA' THEN 'ITALIANA'
    WHEN 'GORIZIANA' THEN 'GORIZIANA'
    WHEN 'TUTTI_DOPPI' THEN 'TUTTI_DOPPI'
    ELSE CASE game_order."value"
      WHEN 1 THEN 'ITALIANA'
      WHEN 2 THEN 'GORIZIANA'
      ELSE 'TUTTI_DOPPI'
    END
  END,
  CASE
    WHEN tournament_match."playerOneWins" = 2 AND tournament_match."playerTwoWins" = 0
      THEN 'PLAYER_ONE'
    WHEN tournament_match."playerOneWins" = 0 AND tournament_match."playerTwoWins" = 2
      THEN 'PLAYER_TWO'
    WHEN tournament_match."playerOneWins" = 2 AND game_order."value" = 2
      THEN 'PLAYER_TWO'
    WHEN tournament_match."playerTwoWins" = 2 AND game_order."value" = 2
      THEN 'PLAYER_ONE'
    WHEN tournament_match."playerOneWins" = 2
      THEN 'PLAYER_ONE'
    ELSE 'PLAYER_TWO'
  END,
  ROUND(
    GREATEST(
      1,
      LEAST(
        100,
        CASE
          WHEN tournament."type" = 'GORIZIANA' THEN
            (player_one."precisione" + player_one."sponde") / 2
          WHEN tournament."type" = 'TUTTI_DOPPI' THEN
            (player_one."diretto" + player_one."sponde") / 2
          WHEN tournament."type" IN ('EUROPEO', 'MONDIALE') AND game_order."value" = 2 THEN
            (player_one."precisione" + player_one."sponde") / 2
          WHEN tournament."type" IN ('EUROPEO', 'MONDIALE') AND game_order."value" = 3 THEN
            (player_one."diretto" + player_one."sponde") / 2
          ELSE
            (player_one."precisione" + player_one."diretto") / 2
        END
        + (GREATEST(1, LEAST(10, player_one."form")) - 5) * 0.75
        + (GREATEST(1, LEAST(10, player_one."morale")) - 5) * 0.5
        + GREATEST(0, LEAST(100, player_one."experience")) * 0.025
      )
    )::numeric,
    2
  )::double precision,
  ROUND(
    GREATEST(
      1,
      LEAST(
        100,
        CASE
          WHEN tournament."type" = 'GORIZIANA' THEN
            (player_two."precisione" + player_two."sponde") / 2
          WHEN tournament."type" = 'TUTTI_DOPPI' THEN
            (player_two."diretto" + player_two."sponde") / 2
          WHEN tournament."type" IN ('EUROPEO', 'MONDIALE') AND game_order."value" = 2 THEN
            (player_two."precisione" + player_two."sponde") / 2
          WHEN tournament."type" IN ('EUROPEO', 'MONDIALE') AND game_order."value" = 3 THEN
            (player_two."diretto" + player_two."sponde") / 2
          ELSE
            (player_two."precisione" + player_two."diretto") / 2
        END
        + (GREATEST(1, LEAST(10, player_two."form")) - 5) * 0.75
        + (GREATEST(1, LEAST(10, player_two."morale")) - 5) * 0.5
        + GREATEST(0, LEAST(100, player_two."experience")) * 0.025
      )
    )::numeric,
    2
  )::double precision,
  true,
  COALESCE(tournament_match."playedAt", tournament_match."updatedAt")
FROM "IndividualTournamentMatch" AS tournament_match
JOIN "IndividualTournament" AS tournament
  ON tournament."id" = tournament_match."tournamentId"
JOIN "Player" AS player_one
  ON player_one."id" = tournament_match."playerOneId"
JOIN "Player" AS player_two
  ON player_two."id" = tournament_match."playerTwoId"
CROSS JOIN LATERAL generate_series(
  1,
  tournament_match."playerOneWins" + tournament_match."playerTwoWins"
) AS game_order("value")
WHERE tournament_match."status" = 'PLAYED'
  AND tournament_match."playerOneWins" + tournament_match."playerTwoWins" IN (2, 3)
ON CONFLICT ("matchId", "order") DO NOTHING;
