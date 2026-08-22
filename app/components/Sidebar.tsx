"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  User,
  Trophy,
  Medal,
  ArrowRightLeft,
  Euro,
  Dumbbell,
  GraduationCap,
  Target,
  Settings,
} from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Squadra",
    href: "/team",
    icon: Users,
  },
  {
    label: "Giocatori",
    href: "/players",
    icon: User,
  },
  {
    label: "Formazione",
    href: "/formation",
    icon: Target,
  },
  {
    label: "Lega",
    href: "/campionato",
    icon: Trophy,
  },
  {
    label: "Individuale",
    href: "/individuale",
    icon: Medal,
  },
  {
    label: "Mercato",
    href: "/market",
    icon: ArrowRightLeft,
  },
  {
    label: "Finanze",
    href: "/finance",
    icon: Euro,
  },
  {
    label: "Allenamento",
    href: "/training",
    icon: Dumbbell,
  },
  {
    label: "Accademia",
    href: "/academy",
    icon: GraduationCap,
  },
  {
    label: "Impostazioni",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-yellow-700 bg-[#121212]">
      <div className="p-6 text-2xl font-bold text-yellow-400">
        🎱 Biliardo Manager
      </div>

      <nav className="flex flex-col gap-2 px-3">
        {menu.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? "bg-yellow-500 font-semibold text-black"
                  : "text-gray-300 hover:bg-zinc-800 hover:text-yellow-400"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
