import type { ReactNode } from "react";
import Link from "next/link";
import { CircleDot, Trophy } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-12 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,55,0.15),transparent)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/40 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#14271f] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-xl font-black text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/10 text-amber-300">
                <CircleDot size={24} />
              </span>
              Biliardo Manager
            </Link>

            <div className="mt-16">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                La tua nuova carriera
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight">
                Costruisci il club.
                <br />
                Scegli la strategia.
                <br />
                Vinci il campionato.
              </h2>
              <p className="mt-5 max-w-sm leading-7 text-slate-400">
                Parti dall&apos;ultima categoria e guida la
                tua sala fino ai massimi livelli del
                biliardo italiano.
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <Trophy className="text-amber-300" size={24} />
            <p className="text-sm text-slate-300">
              Ogni grande squadra comincia da una prima
              scelta.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-black text-amber-300 lg:hidden"
          >
            <CircleDot size={20} />
            Biliardo Manager
          </Link>

          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 leading-6 text-zinc-400">
            {description}
          </p>

          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
