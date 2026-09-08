-- I nuovi incontri conservano il punteggio completo di ogni prova.
ALTER TABLE "LeagueFixtureGame"
ADD COLUMN "homePoints" INTEGER,
ADD COLUMN "awayPoints" INTEGER,
ADD COLUMN "reconstructed" BOOLEAN NOT NULL DEFAULT false;

-- Per lo storico il vincitore era noto, ma non il punteggio in birilli.
-- Ricostruiamo risultati validi e riconoscibili tramite il flag dedicato.
WITH reconstructed_scores AS (
  SELECT
    "id",
    "winnerSide",
    "targetPoints",
    CASE "specialty"
      WHEN 'ITALIANA' THEN 1
      WHEN 'GORIZIANA' THEN 2
      ELSE 4
    END AS score_step,
    CASE "specialty"
      WHEN 'ITALIANA' THEN 15
      WHEN 'GORIZIANA' THEN 25
      ELSE 17
    END AS maximum_overshoot_steps
  FROM "LeagueFixtureGame"
), calculated_scores AS (
  SELECT
    "id",
    "winnerSide",
    "targetPoints",
    score_step,
    "targetPoints" + CASE
      WHEN MOD("id" * 13 + score_step * 7, 20) = 0 THEN 0
      ELSE score_step * (
        1 + MOD("id" * 11 + score_step * 5, maximum_overshoot_steps)
      )
    END AS winner_points,
    GREATEST(
      score_step,
      LEAST(
        "targetPoints" - score_step,
        ROUND(
          (
            "targetPoints" *
            (55 + MOD("id" * 17 + score_step * 11, 36)) / 100.0
          ) / score_step
        )::INTEGER * score_step
      )
    ) AS loser_points
  FROM reconstructed_scores
)
UPDATE "LeagueFixtureGame" AS game
SET
  "homePoints" = CASE
    WHEN scores."winnerSide" = 'HOME' THEN scores.winner_points
    ELSE scores.loser_points
  END,
  "awayPoints" = CASE
    WHEN scores."winnerSide" = 'AWAY' THEN scores.winner_points
    ELSE scores.loser_points
  END,
  "reconstructed" = true
FROM calculated_scores AS scores
WHERE game."id" = scores."id";

ALTER TABLE "LeagueFixtureGame"
ALTER COLUMN "homePoints" SET NOT NULL,
ALTER COLUMN "awayPoints" SET NOT NULL;

ALTER TABLE "LeagueFixtureGame"
ADD CONSTRAINT "LeagueFixtureGame_points_check" CHECK (
  (
    "winnerSide" = 'HOME' AND
    "homePoints" >= "targetPoints" AND
    "awayPoints" < "targetPoints"
  ) OR (
    "winnerSide" = 'AWAY' AND
    "awayPoints" >= "targetPoints" AND
    "homePoints" < "targetPoints"
  )
);
