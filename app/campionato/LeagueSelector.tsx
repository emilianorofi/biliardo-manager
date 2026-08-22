"use client";

import { useRouter } from "next/navigation";

type LeagueOption = {
  id: number;
  name: string;
  level: number;
  groupCode: string;
};

export default function LeagueSelector({
  leagues,
  selectedLeagueId,
  managedLeagueId,
}: {
  leagues: LeagueOption[];
  selectedLeagueId: number;
  managedLeagueId: number;
}) {
  const router = useRouter();
  const levels = Array.from(
    new Set(leagues.map((league) => league.level))
  ).sort((first, second) => first - second);

  function selectLeague(value: string) {
    const leagueId = Number.parseInt(value, 10);

    if (!leagues.some((league) => league.id === leagueId)) {
      return;
    }

    router.replace(`/campionato?league=${leagueId}`, {
      scroll: false,
    });
  }

  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
      <label
        htmlFor="league-selector"
        className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500"
      >
        Consulta campionato
      </label>

      <select
        id="league-selector"
        value={selectedLeagueId}
        onChange={(event) => selectLeague(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-xs font-bold text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      >
        {levels.map((level) => (
          <optgroup key={level} label={getLevelName(level)}>
            {leagues
              .filter((league) => league.level === level)
              .map((league) => (
                <option key={league.id} value={league.id}>
                  Girone {league.groupCode}
                  {league.id === managedLeagueId ? " · La tua squadra" : ""}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function getLevelName(level: number) {
  const names: Record<number, string> = {
    1: "Prima Serie",
    2: "Seconda Serie",
    3: "Terza Serie",
    4: "Quarta Serie",
  };

  return names[level] ?? `Serie ${level}`;
}
