"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Crosshair,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Store,
  Trophy,
  Users,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Rosa", href: "/players", icon: Users },
  { name: "Formazione", href: "/formation", icon: Crosshair },
  { name: "Mercato", href: "/transfers", icon: Store },
  { name: "Accademia", href: "/academy", icon: GraduationCap },
  { name: "Allenamento", href: "/training", icon: Dumbbell },
  { name: "Lega", href: "/league", icon: Trophy },
  { name: "Diario", href: "/diary", icon: BookOpen },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-emerald-900 bg-[#10231c] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-emerald-900 p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-2xl shadow-lg">
              🎱
            </div>

            <div>

              <h1 className="text-lg font-black text-white">
                Biliardo Manager
              </h1>

              <p className="text-xs uppercase tracking-widest text-emerald-300">
                Alpha 0.3
              </p>

            </div>

          </div>

        </div>

        <div className="border-b border-emerald-900 p-5">

          <p className="text-xs uppercase tracking-widest text-emerald-400">
            Club
          </p>

          <h2 className="mt-2 text-lg font-bold text-white">
            Accademia Pontedera
          </h2>

          <div className="mt-3 flex gap-2">

            <Badge value="⭐ 42" />

            <Badge value="🏆 2°" />

          </div>

        </div>

        <nav className="flex-1 space-y-2 p-4">

          {menu.map((item) => {

            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition ${
                  active
                    ? "bg-yellow-400 text-black shadow-lg"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.name}
                </span>

              </Link>
            );
          })}

        </nav>

        <div className="border-t border-emerald-900 p-4">

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5">

            <Settings size={20} />

            Impostazioni

          </button>

        </div>

      </aside>
    </>
  );
}

function Badge({ value }: { value: string }) {
  return (
    <div className="rounded-lg bg-emerald-900 px-3 py-1 text-xs font-bold text-white">
      {value}
    </div>
  );
}