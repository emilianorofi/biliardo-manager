"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

const PLAYERS = [
  {
    name: "Luca Bianchi",
    role: "Categoria A",
    age: 33,
    overall: 91,
    form: "Excellent",
    morale: "High",
    contract: "3 years",
    value: "€ 185,000",
    initials: "LB",
    accent: true,
  },
  {
    name: "Andrea Conti",
    role: "Categoria B",
    age: 28,
    overall: 84,
    form: "Good",
    morale: "High",
    contract: "2 years",
    value: "€ 98,000",
    initials: "AC",
  },
  {
    name: "Marco Ferri",
    role: "Categoria C",
    age: 24,
    overall: 79,
    form: "Average",
    morale: "Medium",
    contract: "4 years",
    value: "€ 62,000",
    initials: "MF",
  },
];

const FACILITIES = [
  {
    name: "Training Center",
    level: 3,
    maxLevel: 5,
    description: "Improves player development speed and technique gains.",
    upgradeCost: "€ 45,000",
    icon: "training",
  },
  {
    name: "Youth Academy",
    level: 2,
    maxLevel: 5,
    description: "Generates youth prospects and lowers scouting costs.",
    upgradeCost: "€ 60,000",
    icon: "youth",
  },
  {
    name: "Club House",
    level: 4,
    maxLevel: 5,
    description: "Boosts squad morale and fan satisfaction.",
    upgradeCost: "€ 35,000",
    icon: "clubhouse",
  },
  {
    name: "Equipment Quality",
    level: 3,
    maxLevel: 5,
    description: "Enhances match performance and shot accuracy.",
    upgradeCost: "€ 28,000",
    icon: "equipment",
  },
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

function FacilityIcon({ name }: { name: string }) {
  const cls = "h-6 w-6 text-[#d4af37]";
  switch (name) {
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
    case "clubhouse":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
        </svg>
      );
    case "equipment":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return null;
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Reputation ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 sm:h-5 sm:w-5 ${i < rating ? "text-[#d4af37]" : "text-zinc-700"}`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function LevelBar({ level, maxLevel }: { level: number; maxLevel: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < level ? "bg-gradient-to-r from-[#b8941f] to-[#d4af37]" : "bg-zinc-800"}`}
        />
      ))}
    </div>
  );
}


function formColor(form: string) {
  if (form === "Excellent") return "text-emerald-400";
  if (form === "Good") return "text-[#d4af37]";
  return "text-zinc-400";
}

function moraleColor(morale: string) {
  if (morale === "High") return "text-emerald-400";
  if (morale === "Medium") return "text-[#d4af37]";
  return "text-red-400";
}

export default function TeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-[#0a0a0a] text-zinc-100">

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#0d0d0d] shadow-2xl">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

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
                  Club{" "}
                  <span className="bg-gradient-to-r from-[#d4af37] to-[#f0c14b] bg-clip-text text-transparent">
                    Management
                  </span>
                </h1>
                <p className="text-xs text-zinc-500 sm:text-sm">Circolo Firenze · Season 2025/26</p>
              </div>
            </div>
            <div className="rounded-lg border border-[#c9a227]/25 bg-[#c9a227]/5 px-3 py-1.5 sm:px-4 sm:py-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Balance</p>
              <p className="text-sm font-semibold text-[#d4af37] sm:text-base">€ 248,500</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              {/* Main column */}
              <div className="space-y-6">
                {/* Club Header */}
                <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#161616] via-[#121212] to-[#0f0f0f]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_0%,rgba(212,175,55,0.08),transparent)]" />
                  <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:p-8">
                    <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#c9a227]/40 bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 shadow-lg shadow-[#d4af37]/10 sm:h-28 sm:w-28">
                        <span className="text-2xl font-bold text-[#d4af37] sm:text-3xl">CF</span>
                      </div>
                      <StarRating rating={4} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d4af37]">
                        Serie A Club
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        Circolo{" "}
                        <span className="bg-gradient-to-r from-[#d4af37] to-[#f0c14b] bg-clip-text text-transparent">
                          Firenze
                        </span>
                      </h2>

                      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                        {[
                          { label: "Founded", value: "1984" },
                          { label: "President", value: "Giuseppe Neri" },
                          { label: "Coach", value: "Marco Rossi" },
                          { label: "Home Venue", value: "Sala Oltrarno" },
                          { label: "Fans", value: "2,840" },
                          { label: "Reputation", value: "4 / 5 stars" },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-xs">
                              {item.label}
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-white">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Finance + Objectives */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Finance Card */}
                  <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg border border-[#c9a227]/20 bg-[#c9a227]/10 p-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-white">Finance</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-lg border border-[#c9a227]/20 bg-[#c9a227]/5 px-4 py-3">
                        <p className="text-xs text-zinc-500">Balance</p>
                        <p className="text-xl font-bold text-[#d4af37]">€ 248,500</p>
                      </div>
                      {[
                        { label: "Weekly Income", value: "+ € 12,400", positive: true },
                        { label: "Weekly Expenses", value: "− € 8,750", positive: false },
                        { label: "Sponsor Income", value: "+ € 5,200 / week", positive: true },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-[#111111] px-4 py-2.5"
                        >
                          <span className="text-sm text-zinc-400">{row.label}</span>
                          <span className={`text-sm font-semibold ${row.positive ? "text-emerald-400" : "text-red-400"}`}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>

                  {/* Season Objectives */}
                  <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg border border-[#c9a227]/20 bg-[#c9a227]/10 p-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-white">Season Objectives</h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          title: "League Objective",
                          target: "Finish in top 4",
                          progress: 72,
                          status: "On track",
                        },
                        {
                          title: "Cup Objective",
                          target: "Reach semi-finals",
                          progress: 50,
                          status: "In progress",
                        },
                        {
                          title: "Youth Objective",
                          target: "Promote 2 academy players",
                          progress: 50,
                          status: "1 of 2 done",
                        },
                      ].map((obj) => (
                        <div key={obj.title} className="rounded-lg border border-white/5 bg-[#111111] p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                                {obj.title}
                              </p>
                              <p className="mt-1 text-sm font-medium text-white">{obj.target}</p>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-2 py-0.5 text-[10px] font-medium text-[#d4af37]">
                              {obj.status}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#b8941f] to-[#d4af37]"
                                style={{ width: `${obj.progress}%` }}
                              />
                            </div>
                            <p className="mt-1 text-right text-[10px] text-zinc-500">{obj.progress}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                {/* Squad Overview */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Squad Overview</h3>
                      <p className="text-sm text-zinc-500">Key players by category</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#d4af37] transition hover:text-[#f0c14b] sm:text-sm"
                    >
                      View all →
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PLAYERS.map((player) => (
                      <article
                        key={player.name}
                        className={`group relative overflow-hidden rounded-xl border bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 transition hover:shadow-lg hover:shadow-[#d4af37]/5 ${
                          player.accent
                            ? "border-[#c9a227]/30 hover:border-[#c9a227]/50"
                            : "border-white/5 hover:border-white/10"
                        }`}
                      >
                        {player.accent && (
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(212,175,55,0.06),transparent)]" />
                        )}
                        <div className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ${
                                  player.accent
                                    ? "border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#d4af37]"
                                    : "border border-white/10 bg-[#141414] text-zinc-300"
                                }`}
                              >
                                {player.initials}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{player.name}</p>
                                <p className="text-xs text-[#d4af37]">{player.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">{player.overall}</p>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-500">OVR</p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-md bg-[#111111] px-2.5 py-1.5">
                              <span className="text-zinc-500">Age </span>
                              <span className="font-medium text-white">{player.age}</span>
                            </div>
                            <div className="rounded-md bg-[#111111] px-2.5 py-1.5">
                              <span className="text-zinc-500">Form </span>
                              <span className={`font-medium ${formColor(player.form)}`}>{player.form}</span>
                            </div>
                            <div className="rounded-md bg-[#111111] px-2.5 py-1.5">
                              <span className="text-zinc-500">Morale </span>
                              <span className={`font-medium ${moraleColor(player.morale)}`}>{player.morale}</span>
                            </div>
                            <div className="rounded-md bg-[#111111] px-2.5 py-1.5">
                              <span className="text-zinc-500">Contract </span>
                              <span className="font-medium text-white">{player.contract}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                            <span className="text-xs text-zinc-500">Market value</span>
                            <span className="text-sm font-semibold text-[#d4af37]">{player.value}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {/* Club Facilities */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">Club Facilities</h3>
                    <p className="text-sm text-zinc-500">Upgrade infrastructure to improve performance</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {FACILITIES.map((facility) => (
                      <article
                        key={facility.name}
                        className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5 transition hover:border-[#c9a227]/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-[#c9a227]/20 bg-[#c9a227]/10 p-2.5">
                              <FacilityIcon name={facility.icon} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{facility.name}</h4>
                              <p className="text-xs text-zinc-500">
                                Level {facility.level} / {facility.maxLevel}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full border border-white/10 bg-[#111111] px-2.5 py-0.5 text-xs font-semibold text-[#d4af37]">
                            Lv.{facility.level}
                          </span>
                        </div>

                        <p className="mt-3 text-xs leading-relaxed text-zinc-400">{facility.description}</p>

                        <div className="mt-4">
                          <LevelBar level={facility.level} maxLevel={facility.maxLevel} />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-xs text-zinc-500">
                            Upgrade: <span className="font-medium text-white">{facility.upgradeCost}</span>
                          </span>
                          <button
                            type="button"
                            disabled={facility.level >= facility.maxLevel}
                            className="rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 px-3 py-1.5 text-xs font-semibold text-[#d4af37] transition hover:border-[#c9a227]/50 hover:bg-[#c9a227]/15 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {facility.level >= facility.maxLevel ? "Max Level" : "Upgrade"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right sidebar */}
              <aside className="space-y-4 xl:sticky xl:top-[73px] xl:self-start">
                {/* Upcoming Match */}
                <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Upcoming Match
                  </h3>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 text-xs font-bold text-[#d4af37]">
                        CF
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-white">Firenze</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-zinc-500">VS</p>
                      <p className="text-[10px] text-zinc-500">Sat 12 Jul</p>
                      <p className="text-[10px] text-[#d4af37]">20:30</p>
                    </div>
                    <div className="text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-xs font-bold text-zinc-300">
                        BB
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-white">Bologna</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#c9a227] py-2 text-xs font-semibold text-[#0a0a0a] transition hover:brightness-110"
                  >
                    Match Preview
                  </button>
                </article>

                {/* Board Confidence */}
                <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Board Confidence
                  </h3>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-3xl font-bold text-white">78</p>
                    <p className="mb-1 text-sm text-zinc-500">/ 100</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#b8941f] to-[#d4af37]" />
                  </div>
                  <p className="mt-2 text-xs text-emerald-400">Board is satisfied with progress</p>
                </article>

                {/* Sponsor */}
                <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sponsor</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#141414] text-xs font-bold text-[#d4af37]">
                      PB
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Peroni Biliardo</p>
                      <p className="text-xs text-zinc-500">Main sponsor · 2 seasons left</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-white/5 bg-[#111111] px-3 py-2">
                    <p className="text-xs text-zinc-500">Weekly contribution</p>
                    <p className="text-sm font-semibold text-emerald-400">+ € 5,200</p>
                  </div>
                </article>

                {/* Season Progress */}
                <article className="rounded-xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Season Progress
                  </h3>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "League", value: "14 / 28 matches", pct: 50 },
                      { label: "Cup", value: "Quarter-finals", pct: 75 },
                      { label: "Transfer window", value: "Closed", pct: 100 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">{item.label}</span>
                          <span className="font-medium text-white">{item.value}</span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#b8941f] to-[#d4af37]"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
