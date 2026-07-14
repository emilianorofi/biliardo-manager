import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Biliardo Manager",
  description: "Browser Game Manageriale sul Biliardo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-[#0a0a0a] text-white">
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 min-w-0 p-6">
      {children}
    </main>
  </div>
</body>
    </html>
  );
}