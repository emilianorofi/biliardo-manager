import AnimatedBilliardTable from "./components/AnimatedBilliardTable";

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
          </div>
        </section>
        <AnimatedBilliardTable />

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
