import { redirect } from "next/navigation";
import {
  Coins,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

import { logoutManager } from "@/app/auth/actions";
import ClubIdentityForm from "@/app/components/onboarding/ClubIdentityForm";
import { requireAuthenticatedManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const manager = await requireAuthenticatedManager();

  if (manager.clubId !== null) {
    redirect("/onboarding/complete");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.13),transparent)]" />

      <section className="relative w-full max-w-4xl rounded-3xl border border-emerald-500/20 bg-[#111a16] p-6 shadow-2xl shadow-black/30 sm:p-10">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            Fondazione del club
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            È il tuo momento, {manager.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
            Crea l&apos;identità della tua squadra: prenderai il
            posto di un club dell&apos;ultima serie, conservandone
            classifica e calendario.
          </p>
        </div>

        <div className="my-8 grid gap-3 sm:grid-cols-3">
          <OnboardingFact
            icon={<Coins size={19} />}
            value="€10.000"
            label="Bilancio iniziale"
          />
          <OnboardingFact
            icon={<Users size={19} />}
            value="5 giocatori"
            label="Nuova rosa personale"
          />
          <OnboardingFact
            icon={<ShieldCheck size={19} />}
            value="Subentro IA"
            label="Posizione mantenuta"
          />
        </div>

        <ClubIdentityForm />

        <form action={logoutManager} className="mt-7 text-center">
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

function OnboardingFact({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
      <span className="mx-auto flex w-fit text-amber-300">
        {icon}
      </span>
      <p className="mt-2 font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
