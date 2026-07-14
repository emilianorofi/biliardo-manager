"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  User,
  Trophy,
  ArrowRightLeft,
  Euro,
  Dumbbell,
  GraduationCap,
  Settings,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Squadra", href: "/team", icon: Users },
  { label: "Giocatori", href: "/players", icon: User },
  { label: "Lega", href: "/league", icon: Trophy },
  { label: "Trasferimenti", href: "/transfers", icon: ArrowRightLeft },
  { label: "Finanze", href: "/finance", icon: Euro },
  { label: "Allenamento", href: "/training", icon: Dumbbell },
  { label: "Accademia", href: "/academy", icon: GraduationCap },
  { label: "Impostazioni", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#121212] border-r border-yellow-700 flex flex-col">
      <div className="p-6 text-2xl font-bold text-yellow-400">
        🎱 Biliardo Manager
      </div>

      <nav className="flex flex-col gap-2 px-3">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all
              ${
                pathname === item.href
                  ? "bg-yellow-500 text-black font-semibold"
                  : "text-gray-300 hover:bg-zinc-800 hover:text-yellow-400"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}