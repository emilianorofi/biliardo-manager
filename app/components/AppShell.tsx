"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import GameClockPulse from "@/app/components/GameClockPulse";

const PAGES_WITHOUT_GAME_SHELL = [
  "/",
  "/login",
  "/register",
  "/onboarding",
];

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isOutsideGameShell =
    PAGES_WITHOUT_GAME_SHELL.includes(pathname) ||
    pathname.startsWith("/onboarding/");

  if (isOutsideGameShell) {
    return children;
  }

  return (
    <div className="min-h-screen lg:flex">
      <GameClockPulse />
      <Sidebar />
      <main className="min-w-0 bg-[#0b1712] px-3 pb-4 pt-[4.25rem] sm:px-4 lg:flex-1 lg:p-5">
        {children}
      </main>
    </div>
  );
}
