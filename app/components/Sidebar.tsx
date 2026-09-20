"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  User,
  Trophy,
  Medal,
  ListOrdered,
  Crown,
  ArrowRightLeft,
  Euro,
  Dumbbell,
  GraduationCap,
  Target,
  Flag,
  CalendarDays,
  Building2,
  Settings,
  Menu,
  X,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Squadra", href: "/team", icon: Users },
  { label: "Giocatori", href: "/players", icon: User },
  { label: "Formazione", href: "/formation", icon: Target },
  { label: "Lega", href: "/campionato", icon: Trophy },
  { label: "Individuale", href: "/individuale", icon: Medal },
  { label: "Coppa Nazioni", href: "/coppa-nazioni", icon: Flag },
  { label: "Coppa Specialità", href: "/coppa-specialita", icon: Trophy },
  { label: "Calendario", href: "/calendario", icon: CalendarDays },
  { label: "Ranking", href: "/ranking", icon: ListOrdered },
  { label: "Record", href: "/records", icon: Crown },
  { label: "Mercato", href: "/market", icon: ArrowRightLeft },
  { label: "Finanze", href: "/finance", icon: Euro },
  { label: "Strutture", href: "/structures", icon: Building2 },
  { label: "Allenamento", href: "/training", icon: Dumbbell },
  { label: "Accademia", href: "/academy", icon: GraduationCap },
  { label: "Impostazioni", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-yellow-700/80 bg-[#121212]/95 px-3 shadow-lg shadow-black/20 backdrop-blur lg:hidden">
        <Link
          href="/dashboard"
          className="min-w-0 truncate text-base font-black text-yellow-400"
        >
          🎱 Biliardo Manager
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 transition hover:border-yellow-600 hover:text-yellow-400"
          aria-label={isMobileOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Chiudi menu"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(84vw,320px)] flex-col border-r border-yellow-700 bg-[#121212] shadow-2xl shadow-black/40 transition-transform duration-200 lg:static lg:z-auto lg:min-h-screen lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4 lg:h-auto lg:border-b-0 lg:px-5 lg:py-4">
          <Link
            href="/dashboard"
            className="text-lg font-black text-yellow-400 lg:text-[22px]"
          >
            🎱 Biliardo Manager
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label="Chiudi menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-2 pb-5 lg:gap-1.5 lg:pt-0">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] transition-all lg:min-h-0 ${
                  isActive
                    ? "bg-yellow-500 font-semibold text-black"
                    : "text-gray-300 hover:bg-zinc-800 hover:text-yellow-400"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
