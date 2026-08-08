import { redirect } from "next/navigation";
import { CircleCheckBig, LogOut } from "lucide-react";

import { logoutManager } from "@/app/auth/actions";
import { requireAuthenticatedManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const manager = await requireAuthenticatedManager();

  if (manager.clubId !== null) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.13),transparent)]" />

      <section className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/20 bg-[#111a16] p-7 text-center shadow-2xl shadow-black/30 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <CircleCheckBig size={32} />
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
          Account manager pronto
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          Benvenuto, {manager.name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-400">
          Il tuo profilo è stato creato correttamente. Nel
          prossimo passaggio sceglierai nome, città, colori e
          stemma del club che guiderai dalla categoria più
          bassa.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-left">
          <p className="font-black text-amber-300">
            Prossimo intervento
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Creazione del club, subentro alla squadra IA e
            generazione dei cinque giocatori iniziali.
          </p>
        </div>

        <form action={logoutManager} className="mt-7">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />
            Esci dall&apos;account di prova
          </button>
        </form>
      </section>
    </main>
  );
}
