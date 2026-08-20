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
    <div className="flex min-h-screen">
      <GameClockPulse />
      <Sidebar />
      <main className="min-w-0 flex-1 bg-[#0b1712] p-4 lg:p-5">
        {children}
      </main>
    </div>
  );
}
