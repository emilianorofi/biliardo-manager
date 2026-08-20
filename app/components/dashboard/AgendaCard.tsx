import Link from "next/link";

import {
  CalendarDays,
  Clock3,
  Dumbbell,
  GraduationCap,
  Trophy,
} from "lucide-react";

import Card from "@/app/components/ui/Card";

import { getCurrentClubId } from "@/lib/current-club";

import {
  getNextPlayableRound,
} from "@/lib/league-round";

import { prisma } from "@/lib/prisma";

export default async function UpcomingEventsCard() {
  const clubId = await getCurrentClubId();
  const [trainingPlan, club, league] =
    await Promise.all([
      prisma.trainingPlan.findUnique({
        where: {
          clubId:
            clubId,
        },

        select: {
          primaryFocus:
            true,

          secondaryFocus:
            true,
        },
      }),

      prisma.club.findUnique({
        where: {
          id: clubId,
        },
        select: {
          nextAcademyCandidateAt: true,
          nextWeeklyUpdateAt: true,
        },
      }),

      prisma.league.findFirst({
        where: {
          status:
            "ACTIVE",
        },

        orderBy: {
          id:
            "desc",
        },

        include: {
          fixtures: {
            where: {
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
              round:
                "asc",
            },

            include: {
              homeClub: {
                select: {
                  name:
                    true,
                },
              },

              awayClub: {
                select: {
                  name:
                    true,
                },
              },
            },
          },
        },
      }),
    ]);

  const totalRounds =
    league?.fixtures.reduce(
      (
        highestRound,
        fixture
      ) =>
        Math.max(
          highestRound,
          fixture.round
        ),
      0
    ) ?? 0;

  const playableRound =
    league &&
    totalRounds > 0
      ? getNextPlayableRound(
          league.currentRound,
          totalRounds
        )
      : null;

  const fixture =
    playableRound === null
      ? null
      : league?.fixtures.find(
          (currentFixture) =>
            currentFixture.round ===
            playableRound
        ) ?? null;

  return (
    <Card
      title="Agenda"
      subtitle="Prossimi impegni"
      className="h-full"
      icon={
        <CalendarDays
          size={18}
        />
      }
    >
      <div className="space-y-2">
        <AgendaItem
          icon={
            <Dumbbell
              size={18}
            />
          }
          type="Allenamento"
          title="Allenamento settimanale"
          description={
            trainingPlan
              ? `Focus: ${formatFocus(
                  trainingPlan.primaryFocus
                )} + ${formatFocus(
                  trainingPlan.secondaryFocus
                )}`
              : "Programma di allenamento da impostare"
          }
          date={
            club?.nextWeeklyUpdateAt
              ? formatFixtureDate(
                  club.nextWeeklyUpdateAt
                )
              : "Lunedì"
          }
          time={
            club?.nextWeeklyUpdateAt
              ? formatFixtureTime(
                  club.nextWeeklyUpdateAt
                )
              : "12:00"
          }
          href="/training"
          tone="training"
        />

        <AgendaItem
          icon={
            <GraduationCap
              size={18}
            />
          }
          type="Accademia"
          title="Candidato e scouting"
          description="Ingresso del candidato e avanzamento dei rapporti"
          date={
            club?.nextAcademyCandidateAt
              ? formatFixtureDate(
                  club.nextAcademyCandidateAt
                )
              : "Martedì"
          }
          time={
            club?.nextAcademyCandidateAt
              ? formatFixtureTime(
                  club.nextAcademyCandidateAt
                )
              : "21:00"
          }
          href="/academy"
          tone="academy"
        />

        {fixture ? (
          <AgendaItem
            icon={
              <Trophy
                size={18}
              />
            }
            type="Campionato"
            title={`${fixture.homeClub.name} vs ${fixture.awayClub.name}`}
            description={`Giornata ${fixture.round} di ${league?.name ?? "campionato"}`}
            date={formatFixtureDate(
              fixture.scheduledAt
            )}
            time={formatFixtureTime(
              fixture.scheduledAt
            )}
            href="/campionato"
            tone="league"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/30 p-4">
            <p className="text-sm font-semibold text-zinc-300">
              Nessuna partita programmata
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Non risultano altri incontri da disputare.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function AgendaItem({
  icon,
  type,
  title,
  description,
  date,
  time,
  href,
  tone,
}: {
  icon: React.ReactNode;
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  href: string;
  tone:
    | "training"
    | "academy"
    | "league";
}) {
  const style = {
    training: {
          icon:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

          type:
            "text-emerald-400",
    },
    academy: {
      icon:
        "border-violet-500/20 bg-violet-500/10 text-violet-300",
      type: "text-violet-300",
    },
    league: {
          icon:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",

          type:
            "text-amber-300",
    },
  }[tone];

  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-800 bg-zinc-800/40 p-3 transition hover:border-zinc-700 hover:bg-zinc-800"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${style.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p
                className={`text-xs font-black uppercase tracking-wider ${style.type}`}
              >
                {type}
              </p>

              <p className="mt-1 font-bold text-white">
                {title}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-zinc-300">
                {date}
              </p>

              <div className="mt-1 flex items-center justify-end gap-1 text-xs text-zinc-500">
                <Clock3
                  size={13}
                />

                {time}
              </div>
            </div>
          </div>

          <p className="mt-1 line-clamp-1 text-xs leading-5 text-zinc-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

function formatFocus(
  focus: string
): string {
  return (
    focus.charAt(0).toUpperCase() +
    focus.slice(1)
  );
}

function formatFixtureDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      weekday:
        "short",

      day:
        "2-digit",

      month:
        "2-digit",

      timeZone:
        "Europe/Rome",
    }
  ).format(date);
}

function formatFixtureTime(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "Europe/Rome",
    }
  ).format(date);
}
