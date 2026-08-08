import Link from "next/link";

import {
  Trophy,
} from "lucide-react";

import Card from "@/app/components/ui/Card";

import { getCurrentClubId } from "@/lib/current-club";

import {
  createLeagueTable,
} from "@/lib/league-table";

import { prisma } from "@/lib/prisma";

export default async function StandingsCard() {
  const clubId = await getCurrentClubId();
  const league =
    await prisma.league.findFirst({
      where: {
        status: {
          in: [
            "PREPARATION",
            "ACTIVE",
            "COMPLETED",
          ],
        },
      },

      orderBy: {
        id: "desc",
      },

      include: {
        entries: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

  if (!league) {
    return (
      <Card
        title="Classifica"
        icon={
          <Trophy
            size={18}
            className="text-yellow-400"
          />
        }
      >
        <p className="text-sm text-zinc-400">
          Non esiste ancora un campionato da mostrare.
        </p>
      </Card>
    );
  }

  const table =
    createLeagueTable(
      league.entries.map(
        (entry) => ({
          clubId:
            entry.clubId,

          clubName:
            entry.club.name,

          played:
            entry.played,

          won:
            entry.won,

          drawn:
            entry.drawn,

          lost:
            entry.lost,

          pointsFor:
            entry.pointsFor,

          pointsAgainst:
            entry.pointsAgainst,

          points:
            entry.points,
        })
      )
    );

  return (
    <Card
      title="Classifica"
      subtitle={league.name}
      icon={
        <Trophy
          size={18}
          className="text-yellow-400"
        />
      }
      actions={
        <Link
          href="/campionato"
          className="text-xs font-bold text-emerald-400 transition hover:text-emerald-300"
        >
          Completa
        </Link>
      }
    >
      <div className="space-y-2">
        {table.map(
          (entry) => {
            const isUserClub =
              entry.clubId ===
              clubId;

            return (
              <div
                key={entry.clubId}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 transition ${
                  entry.position === 1
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : isUserClub
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-zinc-800 bg-zinc-800/60"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      entry.position === 1
                        ? "bg-yellow-500 text-black"
                        : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {entry.position}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-medium ${
                        isUserClub
                          ? "text-emerald-300"
                          : "text-white"
                      }`}
                    >
                      {entry.clubName}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {entry.played} giocate
                      {" · "}
                      {entry.pointsFor}
                      –
                      {entry.pointsAgainst}
                    </p>
                  </div>
                </div>

                <span className="ml-3 font-bold text-yellow-400">
                  {entry.points}
                </span>
              </div>
            );
          }
        )}
      </div>
    </Card>
  );
}
