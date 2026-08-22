-- Aggiunge il punteggio di gioco di ogni prova individuale.
ALTER TABLE "IndividualTournamentGame"
ADD COLUMN "playerOneScore" INTEGER,
ADD COLUMN "playerTwoScore" INTEGER;

-- Le prove già presenti non conservavano il punteggio. Lo ricostruiamo in
-- modo stabile usando specialità, vincitore e prestazioni registrate.
WITH game_values AS (
  SELECT
    game."id",
    game."winnerSide",
    CASE game."specialty"
      WHEN 'ITALIANA' THEN 80
      WHEN 'GORIZIANA' THEN 400
      WHEN 'TUTTI_DOPPI' THEN 600
      ELSE 80
    END AS target_points,
    LEAST(
      1.2,
      GREATEST(
        0.4,
        CASE game."winnerSide"
          WHEN 'PLAYER_ONE' THEN
            game."playerTwoPerformanceRating" /
            GREATEST(1, game."playerOnePerformanceRating")
          ELSE
            game."playerOnePerformanceRating" /
            GREATEST(1, game."playerTwoPerformanceRating")
        END
      )
    ) AS rating_ratio,
    MOD(ABS(game."matchId" * 37 + game."order" * 17), 100)::double precision / 100
      AS score_variation
  FROM "IndividualTournamentGame" AS game
), reconstructed_scores AS (
  SELECT
    "id",
    "winnerSide",
    target_points,
    LEAST(
      target_points - 1,
      GREATEST(
        1,
        ROUND(
          target_points * LEAST(
            0.96,
            GREATEST(
              0.42,
              0.48 + rating_ratio * 0.3 + score_variation * 0.16
            )
          )
        )::integer
      )
    ) AS loser_score
  FROM game_values
)
UPDATE "IndividualTournamentGame" AS game
SET
  "playerOneScore" = CASE reconstructed."winnerSide"
    WHEN 'PLAYER_ONE' THEN reconstructed.target_points
    ELSE reconstructed.loser_score
  END,
  "playerTwoScore" = CASE reconstructed."winnerSide"
    WHEN 'PLAYER_TWO' THEN reconstructed.target_points
    ELSE reconstructed.loser_score
  END,
  "reconstructed" = true
FROM reconstructed_scores AS reconstructed
WHERE reconstructed."id" = game."id";

ALTER TABLE "IndividualTournamentGame"
ALTER COLUMN "playerOneScore" SET NOT NULL,
ALTER COLUMN "playerTwoScore" SET NOT NULL;

ALTER TABLE "IndividualTournamentGame"
ADD CONSTRAINT "IndividualTournamentGame_scores_check"
CHECK ("playerOneScore" >= 0 AND "playerTwoScore" >= 0);
