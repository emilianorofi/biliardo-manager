import {
  GraduationCap,
  Newspaper,
  Search,
  Trophy,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import Card from "@/app/components/ui/Card";

import {
  USER_CLUB_ID,
} from "@/lib/game-config";

import { prisma } from "@/lib/prisma";

export default async function NewsCard() {
  const events =
    await prisma.gameEvent.findMany({
      where: {
        OR: [
          {
            clubId:
              USER_CLUB_ID,
          },
          {
            clubId:
              null,
          },
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take:
        5,
    });

  return (
    <Card
      title="News"
      icon={
        <Newspaper
          size={18}
          className="text-sky-400"
        />
      }
    >
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/30 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-zinc-300">
            Nessuna notizia disponibile
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            I nuovi eventi relativi a partite, allenamenti,
            mercato e accademia compariranno qui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const appearance =
              getEventAppearance(
                event.type
              );

            return (
              <div
                key={event.id}
                className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${appearance.colors}`}
                  >
                    {appearance.icon}

                    {event.type.startsWith("TRANSFER_")
                      ? "Mercato"
                      : event.type}
                  </div>

                  <span className="text-xs text-zinc-500">
                    {formatEventDate(
                      event.createdAt
                    )}
                  </span>
                </div>

                <p className="text-sm font-semibold leading-6 text-zinc-200">
                  {event.title}
                </p>

                {event.description ? (
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {event.description}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function getEventAppearance(
  type: string
) {
  if (type.startsWith("TRANSFER_")) {
    return {
      icon: (
        <Search
          size={16}
        />
      ),

      colors:
        "border-yellow-500/20 bg-yellow-500/15 text-yellow-400",
    };
  }

  switch (type) {
    case "Allenamento":
      return {
        icon: (
          <TrendingUp
            size={16}
          />
        ),

        colors:
          "border-green-500/20 bg-green-500/15 text-green-400",
      };

    case "Mercato":
      return {
        icon: (
          <Search
            size={16}
          />
        ),

        colors:
          "border-yellow-500/20 bg-yellow-500/15 text-yellow-400",
      };

    case "Lega":
    case "Campionato":
      return {
        icon: (
          <Trophy
            size={16}
          />
        ),

        colors:
          "border-sky-500/20 bg-sky-500/15 text-sky-400",
      };

    case "Accademia":
      return {
        icon: (
          <GraduationCap
            size={16}
          />
        ),

        colors:
          "border-violet-500/20 bg-violet-500/15 text-violet-400",
      };

    case "Infortunio":
      return {
        icon: (
          <TriangleAlert
            size={16}
          />
        ),

        colors:
          "border-red-500/20 bg-red-500/15 text-red-400",
      };

    default:
      return {
        icon: (
          <Newspaper
            size={16}
          />
        ),

        colors:
          "border-zinc-600 bg-zinc-700/40 text-zinc-300",
      };
  }
}

function formatEventDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "Europe/Rome",
    }
  ).format(date);
}
