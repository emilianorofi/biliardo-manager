import {
  Activity,
  CheckCircle2,
  Users,
} from "lucide-react";

import Card from "@/app/components/ui/Card";
import ProgressBar from "@/app/components/ui/ProgressBar";
import StatBadge from "@/app/components/ui/StatBadge";

import { getCurrentClubId } from "@/lib/current-club";

import { prisma } from "@/lib/prisma";

export default async function TeamStatusCard() {
  const clubId = await getCurrentClubId();
  const [
    club,
    recentFixtures,
  ] = await Promise.all([
    prisma.club.findUnique({
      where: {
        id:
          clubId,
      },

      include: {
        players: {
          select: {
            form:
              true,

            morale:
              true,
          },
        },

        formation:
          true,
      },
    }),

    prisma.leagueFixture.findMany({
      where: {
        status:
          "PLAYED",

        OR: [
          {
            homeClubId:
              clubId,
          },
          {
            awayClubId:
              clubId,
          },
        ],
      },

      orderBy: {
        scheduledAt:
          "desc",
      },

      take:
        5,

      select: {
        homeClubId:
          true,

        awayClubId:
          true,

        homeScore:
          true,

        awayScore:
          true,
      },
    }),
  ]);

  if (!club) {
    return (
      <Card
        title="Stato Squadra"
        icon={
          <Activity
            size={18}
            className="text-green-400"
          />
        }
      >
        <p className="text-sm text-zinc-400">
          Squadra non trovata.
        </p>
      </Card>
    );
  }

  const playersCount =
    club.players.length;

  const averageForm =
    playersCount === 0
      ? 0
      : Math.round(
          (
            club.players.reduce(
              (
                total,
                player
              ) =>
                total +
                player.form,
              0
            ) /
            playersCount
          ) *
            10
        );

  const averageMorale =
    playersCount === 0
      ? 0
      : Math.round(
          (
            club.players.reduce(
              (
                total,
                player
              ) =>
                total +
                player.morale,
              0
            ) /
            playersCount
          ) *
            10
        );

  const formationComplete =
    club.formation
      ?.slotAPlayerId !== null &&
    club.formation
      ?.slotAPlayerId !== undefined &&
    club.formation
      ?.slotBPlayerId !== null &&
    club.formation
      ?.slotBPlayerId !== undefined &&
    club.formation
      ?.slotCPlayerId !== null &&
    club.formation
      ?.slotCPlayerId !== undefined;

  const lastResults =
    recentFixtures.map(
      (fixture) => {
        const homeScore =
          fixture.homeScore ?? 0;

        const awayScore =
          fixture.awayScore ?? 0;

        const isHome =
          fixture.homeClubId ===
          clubId;

        const userScore =
          isHome
            ? homeScore
            : awayScore;

        const opponentScore =
          isHome
            ? awayScore
            : homeScore;

        if (
          userScore >
          opponentScore
        ) {
          return "V";
        }

        if (
          userScore <
          opponentScore
        ) {
          return "P";
        }

        return "N";
      }
    );

  const resultColor = {
    V:
      "bg-green-500",

    N:
      "bg-yellow-500",

    P:
      "bg-red-500",
  };

  return (
    <Card
      title="Stato Squadra"
      subtitle={club.name}
      icon={
        <Activity
          size={18}
          className="text-green-400"
        />
      }
    >
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-zinc-400">
              Forma media
            </span>

            <span className="font-bold text-white">
              {averageForm}%
            </span>
          </div>

          <ProgressBar
            value={
              averageForm
            }
            color="green"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-zinc-400">
              Morale medio
            </span>

            <span className="font-bold text-white">
              {averageMorale}%
            </span>
          </div>

          <ProgressBar
            value={
              averageMorale
            }
            color="yellow"
          />
        </div>

        <StatBadge
          label="Giocatori in rosa"
          value={
            playersCount
          }
          icon={
            <Users
              size={16}
            />
          }
          color="blue"
        />

        <StatBadge
          label="Formazione"
          value={
            formationComplete
              ? "Completa"
              : "Da preparare"
          }
          icon={
            <CheckCircle2
              size={16}
            />
          }
          color={
            formationComplete
              ? "green"
              : "yellow"
          }
        />

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Ultime 5 partite
          </p>

          {lastResults.length >
          0 ? (
            <div className="flex gap-2">
              {lastResults.map(
                (
                  result,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${
                      resultColor[
                        result
                      ]
                    }`}
                  >
                    {result}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Nessuna partita giocata.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
