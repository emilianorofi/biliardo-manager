import Link from "next/link";
import {
  CalendarDays,
  CircleDot,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { clubs } from "@/app/data/clubs";
import { generateSchedule } from "@/lib/schedule";

const CURRENT_ROUND = 5;
const TOTAL_ROUNDS = 14;
const USER_CLUB_ID = 1;

const pointsByClubId: Record<number, number> = {
  1: 18,
  2: 13,
  3: 21,
  4: 16,
  5: 14,
  6: 19,
  7: 11,
  8: 8,
};

export default function LeaguePage() {
  const schedule = generateSchedule(clubs);

  const nextMatchday = schedule.find(
    (matchday) => matchday.round === CURRENT_ROUND + 1
  );

  const standings = clubs
    .map((club) => ({
      club,
      played: CURRENT_ROUND,
      points: pointsByClubId[club.id] ?? 0,
    }))
    .sort((first, second) => {
      if (second.points !== first.points) {
        return second.points - first.points;
      }

      return first.club.name.localeCompare(
        second.club.name,
        "it"
      );
    })
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

  const userStanding = standings.find(
    (entry) => entry.club.id === USER_CLUB_ID
  );

  const userClub = clubs.find(
    (club) => club.id === USER_CLUB_ID
  );

  if (!userStanding || !userClub || !nextMatchday) {
    throw new Error(
      "Impossibile preparare i dati del campionato."
    );
  }

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-bold text-amber-400">
          Campionato nazionale
        </p>

        <h1 className="mt-1 text-3xl font-black text-white">
          Serie A
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Stagione 2025/26 · Giornata {CURRENT_ROUND} di{" "}
          {TOTAL_ROUNDS}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Squadre"
          value={clubs.length}
          description="Campionato nazionale"
          icon={<Users size={22} />}
          tone="neutral"
        />

        <SummaryCard
          label="Giornata"
          value={CURRENT_ROUND}
          description={`Su ${TOTAL_ROUNDS} giornate`}
          icon={<CalendarDays size={22} />}
          tone="neutral"
        />

        <SummaryCard
          label="La tua posizione"
          value={`${userStanding.position}°`}
          description={userClub.name}
          icon={<Trophy size={22} />}
          tone="amber"
        />

        <SummaryCard
          label="Punti"
          value={userStanding.points}
          description={`Su ${CURRENT_ROUND * 6} disponibili`}
          icon={<Target size={22} />}
          tone="neutral"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
          <div className="flex items-center justify-between gap-4 border-b border-emerald-900/60 p-5 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Classifica
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Serie A
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {clubs.length} squadre · 6 incontri per ogni
                giornata
              </p>
            </div>

            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
              Giornata {CURRENT_ROUND}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="border-b border-emerald-900/50 bg-emerald-950/30">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 text-center sm:px-6">
                    Pos
                  </th>

                  <th className="px-5 py-4">
                    Squadra
                  </th>

                  <th className="px-5 py-4 text-center">
                    G
                  </th>

                  <th className="px-5 py-4 text-center">
                    Max
                  </th>

                  <th className="px-5 py-4 text-center sm:px-6">
                    Punti
                  </th>
                </tr>
              </thead>

              <tbody>
                {standings.map((entry) => {
                  const isUser =
                    entry.club.id === USER_CLUB_ID;

                  return (
                    <tr
                      key={entry.club.id}
                      className={`border-b border-emerald-900/40 last:border-0 ${
                        isUser
                          ? "bg-amber-400/[0.07]"
                          : "transition hover:bg-emerald-950/30"
                      }`}
                    >
                      <td className="px-5 py-4 text-center sm:px-6">
                        <span
                          className={`font-black ${
                            isUser
                              ? "text-amber-300"
                              : "text-slate-300"
                          }`}
                        >
                          {entry.position}°
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${
                              isUser
                                ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                                : "border-emerald-900/60 bg-emerald-950/50 text-emerald-300"
                            }`}
                          >
                            {entry.club.shortName}
                          </div>

                          <div>
                            <p
                              className={`font-bold ${
                                isUser
                                  ? "text-amber-300"
                                  : "text-white"
                              }`}
                            >
                              {entry.club.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {entry.club.city}
                              {isUser
                                ? " · La tua squadra"
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-slate-300">
                        {entry.played}
                      </td>

                      <td className="px-5 py-4 text-center text-slate-500">
                        {entry.played * 6}
                      </td>

                      <td className="px-5 py-4 text-center sm:px-6">
                        <span
                          className={`text-lg font-black ${
                            isUser
                              ? "text-amber-300"
                              : "text-white"
                          }`}
                        >
                          {entry.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-emerald-900/50 p-5 sm:px-6">
            <p className="text-xs leading-6 text-slate-500">
              Ogni giornata è composta da 6 incontri. Ogni
              incontro vinto assegna un punto alla squadra.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Prossima giornata
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  Giornata {nextMatchday.round}
                </h2>
              </div>

              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
                Da giocare
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {nextMatchday.matches.map((match) => {
                const isUserMatch =
                  match.homeClub.id === USER_CLUB_ID ||
                  match.awayClub.id === USER_CLUB_ID;

                return (
                  <article
                    key={match.id}
                    className={`rounded-xl border p-4 ${
                      isUserMatch
                        ? "border-amber-400/30 bg-amber-400/[0.06]"
                        : "border-emerald-900/50 bg-emerald-950/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <ClubMatchSide
                        name={match.homeClub.name}
                        shortName={match.homeClub.shortName}
                        isUser={
                          match.homeClub.id === USER_CLUB_ID
                        }
                      />

                      <span className="shrink-0 text-xs font-black text-slate-600">
                        VS
                      </span>

                      <ClubMatchSide
                        name={match.awayClub.name}
                        shortName={match.awayClub.shortName}
                        isUser={
                          match.awayClub.id === USER_CLUB_ID
                        }
                      />
                    </div>

                    {isUserMatch && (
                      <div className="mt-3 border-t border-amber-400/10 pt-3 text-center">
                        <span className="text-xs font-black text-amber-300">
                          La tua prossima partita
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <CircleDot size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Regolamento
                </p>

                <h2 className="text-xl font-black text-white">
                  Formula campionato
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow
                label="Squadre"
                value={`${clubs.length}`}
              />

              <InfoRow
                label="Girone"
                value="Andata e ritorno"
              />

              <InfoRow
                label="Giornate"
                value={`${TOTAL_ROUNDS}`}
              />

              <InfoRow
                label="Incontri per giornata"
                value="6"
                highlight
                last
              />
            </div>
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-emerald-950"
        >
          Torna alla Dashboard
        </Link>

        <Link
          href="/formation"
          className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
        >
          Prepara la formazione
        </Link>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  tone: "amber" | "neutral";
}) {
  const isAmber = tone === "amber";

  return (
    <article
      className={`rounded-2xl border p-5 ${
        isAmber
          ? "border-amber-400/25 bg-amber-400/5"
          : "border-emerald-900/60 bg-[#15261f]"
      }`}
    >
      <div
        className={`flex items-center gap-2 ${
          isAmber
            ? "text-amber-300"
            : "text-emerald-300"
        }`}
      >
        {icon}

        <p className="text-xs font-black uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p
        className={`mt-3 text-3xl font-black ${
          isAmber
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </article>
  );
}

function ClubMatchSide({
  name,
  shortName,
  isUser,
}: {
  name: string;
  shortName: string;
  isUser: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border text-[10px] font-black ${
          isUser
            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
            : "border-emerald-900/60 bg-emerald-950/50 text-emerald-300"
        }`}
      >
        {shortName}
      </div>

      <p
        className={`mt-2 truncate text-xs font-bold ${
          isUser
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {name}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
  last = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        last
          ? ""
          : "border-b border-emerald-900/50 pb-4"
      }`}
    >
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span
        className={`font-black ${
          highlight
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}