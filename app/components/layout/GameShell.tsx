"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

type Props = {
  children: ReactNode;
};

export default function GameShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07140f] text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}