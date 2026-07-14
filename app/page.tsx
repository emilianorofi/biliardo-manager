export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-[#d4af37]"
                fill="currentColor"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" opacity="0.35" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              Biliardo{" "}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0c14b] bg-clip-text text-transparent">
                Manager
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {["Home", "Features", "Rankings", "Login"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-[#d4af37]"
              >
                {item}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-lg border border-[#c9a227]/30 px-4 py-2 text-sm font-medium text-[#d4af37] transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 md:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>

          <a
            href="#login"
            className="hidden rounded-lg border border-[#c9a227]/30 px-4 py-2 text-sm font-medium text-[#d4af37] transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 md:inline-flex"
          >
            Login
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section
          id="home"
          className="relative overflow-hidden border-b border-white/5"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(212,175,55,0.12),transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_50%,rgba(212,175,55,0.06),transparent)]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div className="text-center lg:text-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/25 bg-[#c9a227]/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#d4af37]">
                Italian 5-Pin Billiards
              </p>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Biliardo{" "}
                <span className="bg-gradient-to-r from-[#d4af37] via-[#f0c14b] to-[#d4af37] bg-clip-text text-transparent">
                  Manager
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0 mx-auto">
                The ultimate browser management game dedicated to Italian
                billiards.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href="#"
                  className="w-full rounded-xl bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#c9a227] px-8 py-3.5 text-center text-sm font-semibold text-[#0a0a0a] shadow-lg shadow-[#d4af37]/20 transition hover:brightness-110 sm:w-auto"
                >
                  New Career
                </a>
                <a
                  href="#"
                  className="w-full rounded-xl border border-zinc-700 bg-[#141414] px-8 py-3.5 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-[#1a1a1a] sm:w-auto"
                >
                  Continue Career
                </a>
                <a
                  href="#rankings"
                  className="w-full rounded-xl border border-[#c9a227]/40 bg-transparent px-8 py-3.5 text-center text-sm font-semibold text-[#d4af37] transition hover:border-[#d4af37] hover:bg-[#d4af37]/5 sm:w-auto"
                >
                  Rankings
                </a>
              </div>
            </div>

            {/* Billiard table hero */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute -inset-4 rounded-3xl bg-[#d4af37]/10 blur-3xl" />
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1c1c] to-[#111111] p-4 shadow-2xl shadow-black/60 sm:p-6">
                <svg
                  viewBox="0 0 520 300"
                  className="h-auto w-full drop-shadow-2xl"
                  aria-label="Italian billiard table"
                >
                  <defs>
                    <linearGradient id="felt" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a5c38" />
                      <stop offset="50%" stopColor="#227a4a" />
                      <stop offset="100%" stopColor="#165a35" />
                    </linearGradient>
                    <linearGradient id="rail" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6b4423" />
                      <stop offset="40%" stopColor="#8b5a2b" />
                      <stop offset="100%" stopColor="#4a2f18" />
                    </linearGradient>
                    <radialGradient id="ballShine" cx="35%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <filter id="tableShadow">
                      <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* Table shadow */}
                  <ellipse cx="260" cy="280" rx="220" ry="12" fill="#000" opacity="0.4" />

                  {/* Outer rail */}
                  <rect
                    x="20"
                    y="30"
                    width="480"
                    height="240"
                    rx="18"
                    fill="url(#rail)"
                    filter="url(#tableShadow)"
                  />

                  {/* Inner rail cushion */}
                  <rect x="36" y="46" width="448" height="208" rx="12" fill="#5c3d1e" />

                  {/* Felt surface */}
                  <rect x="48" y="58" width="424" height="184" rx="8" fill="url(#felt)" />

                  {/* Felt texture lines */}
                  <line x1="48" y1="120" x2="472" y2="120" stroke="#ffffff" strokeOpacity="0.03" />
                  <line x1="48" y1="180" x2="472" y2="180" stroke="#ffffff" strokeOpacity="0.03" />
                  <line x1="260" y1="58" x2="260" y2="242" stroke="#ffffff" strokeOpacity="0.04" />

                  {/* Diamond markers */}
                  {[120, 200, 320, 400].map((x) => (
                    <circle key={x} cx={x} cy="150" r="3" fill="#ffffff" opacity="0.15" />
                  ))}

                  {/* 5-pin diamond (Italian billiards) */}
                  {[
                    { cx: 260, cy: 130, fill: "#e8c547" },
                    { cx: 240, cy: 155, fill: "#e74c3c" },
                    { cx: 280, cy: 155, fill: "#e74c3c" },
                    { cx: 220, cy: 180, fill: "#e74c3c" },
                    { cx: 300, cy: 180, fill: "#e74c3c" },
                  ].map((pin, i) => (
                    <g key={i}>
                      <ellipse cx={pin.cx} cy={pin.cy + 2} rx="5" ry="2" fill="#000" opacity="0.3" />
                      <rect
                        x={pin.cx - 4}
                        y={pin.cy - 14}
                        width="8"
                        height="16"
                        rx="2"
                        fill={pin.fill}
                      />
                      <rect
                        x={pin.cx - 3}
                        y={pin.cy - 13}
                        width="2"
                        height="14"
                        rx="1"
                        fill="#ffffff"
                        opacity="0.25"
                      />
                    </g>
                  ))}

                  {/* Cue ball */}
                  <circle cx="130" cy="190" r="14" fill="#f5f5f0" />
                  <circle cx="130" cy="190" r="14" fill="url(#ballShine)" />
                  <circle cx="124" cy="184" r="3" fill="#ffffff" opacity="0.6" />

                  {/* Red ball */}
                  <circle cx="380" cy="100" r="13" fill="#c0392b" />
                  <circle cx="380" cy="100" r="13" fill="url(#ballShine)" />

                  {/* Yellow ball */}
                  <circle cx="410" cy="200" r="13" fill="#f1c40f" />
                  <circle cx="410" cy="200" r="13" fill="url(#ballShine)" />

                  {/* Cue stick */}
                  <line
                    x1="60"
                    y1="250"
                    x2="115"
                    y2="198"
                    stroke="#d4a574"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="60"
                    y1="250"
                    x2="115"
                    y2="198"
                    stroke="#8b6914"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Corner pockets */}
                  {[
                    [48, 58],
                    [472, 58],
                    [48, 242],
                    [472, 242],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="10" fill="#0a0a0a" />
                  ))}

                  {/* Side pockets */}
                  <circle cx="48" cy="150" r="9" fill="#0a0a0a" />
                  <circle cx="472" cy="150" r="9" fill="#0a0a0a" />
                </svg>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-zinc-500">
                  <span>5-Pin · Serie A</span>
                  <span className="text-[#d4af37]">Season 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Build Your Legacy
              </h2>
              <p className="mt-4 text-zinc-400">
                Master every aspect of Italian billiards management from club
                operations to championship glory.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  title: "Manage your Club",
                  description:
                    "Upgrade facilities, set budgets, and grow your billiard hall into a national powerhouse.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                    </svg>
                  ),
                },
                {
                  title: "Train Players",
                  description:
                    "Scout talent, refine technique, and develop champions skilled in the art of 5-pin billiards.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 8l2 2m0 0l2-2m-2 2v6" />
                    </svg>
                  ),
                },
                {
                  title: "Win Championships",
                  description:
                    "Compete in regional leagues and national tournaments to claim the ultimate billiard crown.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4H3v2a4 4 0 004 4M19 4h2v2a4 4 0 01-4 4" />
                    </svg>
                  ),
                },
              ].map((feature) => (
                <article
                  key={feature.title}
                  className="group relative rounded-2xl border border-white/5 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-8 transition hover:border-[#c9a227]/30 hover:shadow-lg hover:shadow-[#d4af37]/5"
                >
                  <div className="mb-6 inline-flex rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/10 p-3 text-[#d4af37] transition group-hover:border-[#c9a227]/40 group-hover:bg-[#c9a227]/15">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Rankings teaser */}
        <section
          id="rankings"
          className="border-y border-white/5 bg-[#0d0d0d] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Global Rankings
            </h2>
            <p className="mt-3 text-zinc-400">
              Climb the leaderboard and prove your club is the finest in Italy.
            </p>
            <a
              href="#"
              className="mt-8 inline-flex rounded-xl border border-[#c9a227]/40 px-8 py-3 text-sm font-semibold text-[#d4af37] transition hover:border-[#d4af37] hover:bg-[#d4af37]/5"
            >
              View Full Rankings
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="login"
        className="mt-auto border-t border-white/5 bg-[#080808] py-8"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} Biliardo Manager. All rights
              reserved.
            </p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="transition hover:text-[#d4af37]">
                Privacy
              </a>
              <a href="#" className="transition hover:text-[#d4af37]">
                Terms
              </a>
              <a href="#" className="transition hover:text-[#d4af37]">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
