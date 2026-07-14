import Link from "next/link";

const teams = [
  {
    pos: 1,
    name: "Biliardo Milano",
    short: "BM",
    played: 5,
    points: 21,
  },
  {
    pos: 2,
    name: "Circolo Torino",
    short: "CT",
    played: 5,
    points: 19,
  },
  {
    pos: 3,
    name: "Accademia Biliardo Pontedera",
    short: "ABP",
    played: 5,
    points: 18,
    isUser: true,
  },
  {
    pos: 4,
    name: "Sala Roma",
    short: "SR",
    played: 5,
    points: 16,
  },
  {
    pos: 5,
    name: "Boccette Napoli",
    short: "BN",
    played: 5,
    points: 14,
  },
  {
    pos: 6,
    name: "Biliardo Bologna",
    short: "BB",
    played: 5,
    points: 13,
  },
  {
    pos: 7,
    name: "Sala Genova",
    short: "SG",
    played: 5,
    points: 11,
  },
  {
    pos: 8,
    name: "Circolo Palermo",
    short: "CP",
    played: 5,
    points: 8,
  },
];

const fixtures = [
  {
    home: "Accademia Biliardo Pontedera",
    homeShort: "ABP",
    away: "Biliardo Bologna",
    awayShort: "BB",
    userMatch: true,
  },
  {
    home: "Biliardo Milano",
    homeShort: "BM",
    away: "Sala Genova",
    awayShort: "SG",
  },
  {
    home: "Circolo Torino",
    homeShort: "CT",
    away: "Boccette Napoli",
    awayShort: "BN",
  },
  {
    home: "Sala Roma",
    homeShort: "SR",
    away: "Circolo Palermo",
    awayShort: "CP",
  },
];

export default function LeaguePage() {
  return (
    <main className="min-h-screen space-y-6 bg-[#0a0a0a] p-4 text-white sm:p-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-yellow-400">
          Campionato nazionale
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Serie A
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Stagione 2025/26 · Giornata 5 di 14
        </p>
      </div>

      {/* League summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Squadre
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            8
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Campionato nazionale
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Giornata
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            5
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Su 14 giornate
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
            La tua posizione
          </p>
          <p className="mt-2 text-3xl font-bold text-yellow-400">
            3°
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Accademia Biliardo Pontedera
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Punti
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            18
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Su 30 disponibili
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Standings */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-lg font-bold text-white">
                Classifica Serie A
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                8 squadre · 6 incontri per ogni giornata
              </p>
            </div>

            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
              Giornata 5
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-4 text-center">
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
                  <th className="px-5 py-4 text-center">
                    Punti
                  </th>
                </tr>
              </thead>

              <tbody>
                {teams.map((team) => (
                  <tr
                    key={team.name}
                    className={`border-b border-white/5 last:border-b-0 ${
                      team.isUser
                        ? "bg-yellow-400/[0.08]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`font-bold ${
                          team.isUser
                            ? "text-yellow-400"
                            : "text-zinc-300"
                        }`}
                      >
                        {team.pos}°
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                            team.isUser
                              ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                              : "border-white/10 bg-white/5 text-zinc-300"
                          }`}
                        >
                          {team.short}
                        </div>

                        <div>
                          <p
                            className={`font-semibold ${
                              team.isUser
                                ? "text-yellow-400"
                                : "text-white"
                            }`}
                          >
                            {team.name}
                          </p>

                          {team.isUser && (
                            <p className="mt-0.5 text-xs text-yellow-400/70">
                              La tua squadra
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center font-medium text-zinc-300">
                      {team.played}
                    </td>

                    <td className="px-5 py-4 text-center text-zinc-500">
                      {team.played * 6}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-lg font-bold ${
                          team.isUser
                            ? "text-yellow-400"
                            : "text-white"
                        }`}
                      >
                        {team.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/10 p-4">
            <p className="text-xs leading-relaxed text-zinc-500">
              Ogni giornata è composta da 6 incontri. Ogni incontro vinto
              assegna 1 punto alla classifica della squadra.
            </p>
          </div>
        </section>

        {/* Next round */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Prossima giornata
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Giornata 6
                </h2>
              </div>

              <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                Da giocare
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {fixtures.map((match) => (
                <div
                  key={`${match.home}-${match.away}`}
                  className={`rounded-xl border p-4 ${
                    match.userMatch
                      ? "border-yellow-400/30 bg-yellow-400/[0.06]"
                      : "border-white/5 bg-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold">
                        {match.homeShort}
                      </div>
                      <p className="mt-2 truncate text-xs font-medium text-white">
                        {match.home}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-zinc-500">
                      VS
                    </span>

                    <div className="min-w-0 flex-1 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold">
                        {match.awayShort}
                      </div>
                      <p className="mt-2 truncate text-xs font-medium text-white">
                        {match.away}
                      </p>
                    </div>
                  </div>

                  {match.userMatch && (
                    <div className="mt-3 border-t border-yellow-400/10 pt-3 text-center">
                      <span className="text-xs font-semibold text-yellow-400">
                        La tua prossima partita
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Formula campionato
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Squadre
                </span>
                <span className="font-semibold text-white">
                  8
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Girone
                </span>
                <span className="font-semibold text-white">
                  Andata e ritorno
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Giornate
                </span>
                <span className="font-semibold text-white">
                  14
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Incontri per giornata
                </span>
                <span className="font-semibold text-yellow-400">
                  6
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
        >
          Torna alla Dashboard
        </Link>

        <Link
          href="/team"
          className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400/20"
        >
          Vai alla Squadra
        </Link>
      </div>
    </main>
  );
}