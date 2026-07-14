"use client";

import { useState } from "react";
import { club, players } from "@/lib/mock";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", active: true },
  { label: "Team", icon: "team", active: false },
  { label: "Players", icon: "players", active: false },
  { label: "League", icon: "league", active: false },
  { label: "Transfers", icon: "transfers", active: false },
  { label: "Finance", icon: "finance", active: false },
  { label: "Training", icon: "training", active: false },
  { label: "Youth Academy", icon: "youth", active: false },
  { label: "Settings", icon: "settings", active: false },
] as const;

const LEAGUE_TABLE = [
  { pos: 1, team: "Biliardo Milano", played: 14, won: 10, drawn: 2, lost: 2, pts: 32 },
  { pos: 2, team: "Circolo Torino", played: 14, won: 9, drawn: 3, lost: 2, pts: 30 },
  { pos: 3, team: "Sala Roma", played: 14, won: 8, drawn: 4, lost: 2, pts: 28 },
  { pos: 4, team: "Boccette Napoli", played: 14, won: 7, drawn: 3, lost: 4, pts: 24 },
  { pos: 5, team: "Circolo Firenze", played: 14, won: 6, drawn: 4, lost: 4, pts: 22, isUser: true },
  { pos: 6, team: "Biliardo Bologna", played: 14, won: 5, drawn: 3, lost: 6, pts: 18 },
  { pos: 7, team: "Sala Genova", played: 14, won: 3, drawn: 4, lost: 7, pts: 13 },
  { pos: 8, team: "Circolo Palermo", played: 14, won: 2, drawn: 3, lost: 9, pts: 9 },
];

const STATS = [
  { label: "Matches Played", value: "14", change: "Season total" },
  { label: "Win Rate", value: "43%", change: "+5% vs last season" },
  { label: "Avg. Points", value: "18.4", change: "Per match" },
  { label: "Squad Morale", value: "78%", change: "Good form" },
];

function NavIcon({ name }: { name: string }) {
  const cls = "h-5 w-5 shrink-0";
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "players":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "league":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "transfers":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case "finance":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "training":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "youth":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#d4af37]" fill="currentColor" aria-hidden>
            <circle cx="12" cy="12" r="9" opacity="0.35" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Biliardo Manager</p>
          <p className="text-xs text-zinc-500">Career Mode</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={onNavigate}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              item.active
                ? "border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#d4af37]"
                : "border border-transparent text-zinc-400 hover:border-white/5 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/5 px-5 py-4">
        <div className="rounded-lg border border-white/5 bg-[#111111] p-3">
          <p className="text-xs text-zinc-500">Manager</p>
          <p className="mt-0.5 text-sm font-medium text-white">Marco Rossi</p>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-[#0a0a0a] text-zinc-100">
      {/* Desktop sidebar */}
      

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-[#c9a227]/30 hover:text-[#d4af37] lg:hidden"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
              <h1 className="text-base font-semibold text-white sm:text-lg">
                {club.name.split(" ")[0]}{" "}
                <span className="bg-gradient-to-r from-[#d4af37] to-[#f0c14b] bg-clip-text text-transparent">
                  {club.name.split(" ").slice(1).join(" ")}
                </span>
              </h1>  
                <p className="text-xs text-zinc-500 sm:text-sm">{club.city} · {club.hallName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden rounded-lg border border-white/5 bg-[#141414] px-3 py-1.5 sm:block">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Season</p>
                <p className="text-sm font-semibold text-[#d4af37]">2025/26</p>
              </div>
              <div className="rounded-lg border border-[#c9a227]/25 bg-[#c9a227]/5 px-3 py-1.5 sm:px-4 sm:py-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Balance</p>
                <p className="text-sm font-semibold text-[#d4af37] sm:text-base">€ 248,500</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            {/* Page title */}
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Dashboard</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Overview of your club&apos;s season performance
              </p>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {STATS.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-4 sm:p-5"
                >
                  <p className="text-xs text-zinc-500 sm:text-sm">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[10px] text-[#d4af37]/80 sm:text-xs">{stat.change}</p>
                </article>
              ))}
            </div>

            {/* Match cards row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Upcoming match */}
              <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                    Upcoming Match
                  </h3>
                  <span className="rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-2.5 py-0.5 text-xs font-medium text-[#d4af37]">
                    Matchday 15
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 text-sm font-bold text-[#d4af37]">
                      CF
                    </div>
                    <p className="text-sm font-semibold text-white">Circolo Firenze</p>
                    <p className="text-xs text-zinc-500">Home</p>
                  </div>

                  <div className="shrink-0 text-center">
                    <p className="text-lg font-bold text-zinc-600">VS</p>
                    <p className="mt-1 text-xs text-zinc-500">Sat, 12 Jul</p>
                    <p className="text-xs text-[#d4af37]">20:30</p>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-sm font-bold text-zinc-300">
                      BB
                    </div>
                    <p className="text-sm font-semibold text-white">Biliardo Bologna</p>
                    <p className="text-xs text-zinc-500">Away</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#c9a227] py-2 text-sm font-semibold text-[#0a0a0a] transition hover:brightness-110"
                  >
                    Prepare Tactics
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-[#141414]"
                  >
                    Scout
                  </button>
                </div>
              </article>

              {/* Last result */}
              <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                    Last Result
                  </h3>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    Win
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-sm font-bold text-zinc-300">
                      SG
                    </div>
                    <p className="text-sm font-semibold text-white">Sala Genova</p>
                  </div>

                  <div className="shrink-0 text-center">
                    <p className="text-3xl font-bold text-white">
                      18
                      <span className="mx-2 text-zinc-600">–</span>
                      14
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">Matchday 14 · Away</p>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 text-sm font-bold text-[#d4af37]">
                      CF
                    </div>
                    <p className="text-sm font-semibold text-white">Circolo Firenze</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-white">6</p>
                    <p className="text-[10px] text-zinc-500">Carom avg.</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">82%</p>
                    <p className="text-[10px] text-zinc-500">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#d4af37]">MVP</p>
                    <p className="text-[10px] text-zinc-500">L. Bianchi</p>
                  </div>
                </div>
              </article>
            </div>

            {/* League table */}
            <article className="overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f]">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">Serie A Standings</h3>
                  <p className="text-xs text-zinc-500 sm:text-sm">8 teams · 14 matches played</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-[#d4af37] transition hover:text-[#f0c14b] sm:text-sm"
                >
                  Full table →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3 font-medium sm:px-6">#</th>
                      <th className="px-4 py-3 font-medium sm:px-6">Team</th>
                      <th className="px-3 py-3 text-center font-medium">P</th>
                      <th className="px-3 py-3 text-center font-medium">W</th>
                      <th className="px-3 py-3 text-center font-medium">D</th>
                      <th className="px-3 py-3 text-center font-medium">L</th>
                      <th className="px-4 py-3 text-center font-medium sm:px-6">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEAGUE_TABLE.map((row) => (
                      <tr
                        key={row.team}
                        className={`border-b border-white/5 transition last:border-0 ${
                          row.isUser
                            ? "bg-[#c9a227]/5 hover:bg-[#c9a227]/10"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-4 py-3 sm:px-6">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-semibold ${
                              row.pos <= 2
                                ? "bg-[#c9a227]/20 text-[#d4af37]"
                                : row.pos >= 7
                                  ? "bg-red-500/10 text-red-400"
                                  : "text-zinc-400"
                            }`}
                          >
                            {row.pos}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium sm:px-6">
                          <span className={row.isUser ? "text-[#d4af37]" : "text-white"}>
                            {row.team}
                            {row.isUser && (
                              <span className="ml-2 text-[10px] font-normal text-zinc-500">(You)</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-zinc-400">{row.played}</td>
                        <td className="px-3 py-3 text-center text-zinc-400">{row.won}</td>
                        <td className="px-3 py-3 text-center text-zinc-400">{row.drawn}</td>
                        <td className="px-3 py-3 text-center text-zinc-400">{row.lost}</td>
                        <td className="px-4 py-3 text-center font-semibold text-white sm:px-6">
                          {row.pts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
