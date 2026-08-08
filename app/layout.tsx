import "./globals.css";
import type { Metadata } from "next";
import AppShell from "./components/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
