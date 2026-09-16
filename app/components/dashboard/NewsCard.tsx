import Link from "next/link";
import {
  GraduationCap,
  Newspaper,
  Search,
  Trophy,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import Card from "@/app/components/ui/Card";

import { getCurrentClubId } from "@/lib/current-club";

import { prisma } from "@/lib/prisma";

export default async function NewsCard() {
  const clubId = await getCurrentClubId();
  const events =
    await prisma.gameEvent.findMany({
      where: {
        OR: [
          {
            clubId:
              clubId,
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
        4,
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
        <div className="space-y-2">
          {events.map((event) => {
            const appearance =
              getEventAppearance(
                event.type
              );
            const href = getEventHref(event.type, event.clubId, clubId);

            return (
              <Link
                key={event.id}
                href={href}
                className="group block rounded-xl border border-zinc-800 bg-zinc-800/40 p-3 transition hover:border-amber-400/30 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${appearance.colors}`}
                  >
                    {appearance.icon}

                    {getEventLabel(event.type)}
                  </div>

                  <span className="text-xs text-zinc-500">
                    {formatEventDate(
                      event.createdAt
                    )}
                  </span>
                </div>

                <p className="text-sm font-semibold leading-5 text-zinc-200 transition group-hover:text-amber-100">
                  {event.title}
                </p>

                {event.description ? (
                  <p className="mt-1 line-clamp-1 text-xs leading-5 text-zinc-400">
                    {event.description}
                  </p>
                ) : null}

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600 transition group-hover:text-amber-300">
                  Apri dettaglio →
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function getEventHref(
  type: string,
  eventClubId: number | null,
  currentClubId: number
) {
  if (type.startsWith("TRANSFER_") || type === "Mercato") {
    return "/market";
  }

  if (
    type === "Individuale" ||
    type === "PREMIO_INDIVIDUALE"
  ) {
    return "/individuale";
  }

  if (
    type === "Campionato" ||
    type === "Lega"
  ) {
    return "/campionato";
  }

  if (
    type === "Accademia" ||
    type.startsWith("ACADEMY_")
  ) {
    return "/academy";
  }

  if (
    type === "Allenamento" ||
    type === "Aggiornamento"
  ) {
    return "/training";
  }

  if (type === "PLAYER_RETIRED") {
    return "/players";
  }

  if (type === "CLUB_CREATED") {
    return `/clubs/${eventClubId ?? currentClubId}`;
  }

  return eventClubId
    ? `/clubs/${eventClubId}`
    : "/calendario";
}

function getEventLabel(type: string) {
  if (type.startsWith("TRANSFER_") || type === "Mercato") {
    return "Mercato";
  }

  if (type === "PREMIO_INDIVIDUALE") {
    return "Individuale";
  }

  if (type.startsWith("ACADEMY_")) {
    return "Accademia";
  }

  if (type === "PLAYER_RETIRED") {
    return "Carriera";
  }

  if (type === "CLUB_CREATED") {
    return "Club";
  }

  return type;
}

function getEventAppearance(
  type: string
) {
  if (type.startsWith("TRANSFER_") || type === "Mercato") {
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

  if (
    type === "Individuale" ||
    type === "PREMIO_INDIVIDUALE"
  ) {
    return {
      icon: (
        <Trophy
          size={16}
        />
      ),

      colors:
        "border-amber-500/20 bg-amber-500/15 text-amber-300",
    };
  }

  if (type.startsWith("ACADEMY_")) {
    return {
      icon: (
        <GraduationCap
          size={16}
        />
      ),

      colors:
        "border-violet-500/20 bg-violet-500/15 text-violet-400",
    };
  }

  switch (type) {
    case "Allenamento":
    case "Aggiornamento":
      return {
        icon: (
          <TrendingUp
            size={16}
          />
        ),

        colors:
          "border-green-500/20 bg-green-500/15 text-green-400",
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
