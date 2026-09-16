"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Dumbbell, GraduationCap, Landmark } from "lucide-react";
import {
  ACADEMY_LEVELS,
  TRAINING_CENTER_LEVELS,
  VENUE_LEVELS,
} from "@/lib/economy-rules";

type StructureKind = "TRAINING_CENTER" | "ACADEMY" | "VENUE";
type StructureState = {
  balance: number;
  trainingCenterLevel: number;
  trainingCenterUpgradeLevel: number | null;
  trainingCenterUpgradeCompletesAt: string | null;
  academyLevel: number;
  academyUpgradeLevel: number | null;
  academyUpgradeCompletesAt: string | null;
  venueLevel: number;
  venueUpgradeLevel: number | null;
  venueUpgradeCompletesAt: string | null;
};

type ApiResponse = {
  structures?: StructureState;
  error?: string;
};

const CARDS = [
  {
    kind: "TRAINING_CENTER" as const,
    title: "Centro Allenamento",
    description: "Aumenta i guadagni positivi prodotti dall'allenamento della prima squadra.",
    icon: Dumbbell,
  },
  {
    kind: "ACADEMY" as const,
    title: "Accademia",
    description: "Migliora la qualità media dei nuovi giovani trovati ogni settimana.",
    icon: GraduationCap,
  },
  {
    kind: "VENUE" as const,
    title: "Impianto di gioco",
    description: "Aumenta gli incassi delle partite casalinghe.",
    icon: Landmark,
  },
];

export default function StructuresPage() {
  const [state, setState] = useState<StructureState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<StructureKind | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/structures", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.structures) {
        throw new Error(data.error ?? "Impossibile caricare le strutture.");
      }
      setState(data.structures);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Errore inatteso.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function upgrade(kind: StructureKind) {
    setUpgrading(kind);
    setError("");
    try {
      const response = await fetch("/api/structures", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.structures) {
        throw new Error(data.error ?? "Impossibile avviare l'upgrade.");
      }
      setState(data.structures);
    } catch (upgradeError) {
      setError(upgradeError instanceof Error ? upgradeError.message : "Errore inatteso.");
    } finally {
      setUpgrading(null);
    }
  }

  if (loading) {
    return <main className="p-6 text-slate-300">Caricamento strutture…</main>;
  }

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-bold text-amber-400">Gestione del club</p>
        <h1 className="mt-1 flex items-center gap-3 text-3xl font-black text-white">
          <Building2 className="text-amber-300" /> Strutture
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Saldo disponibile: <strong className="text-amber-300">{formatCurrency(state?.balance ?? 0)}</strong>
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-3">
        {state ? CARDS.map((card) => (
          <StructureCard
            key={card.kind}
            kind={card.kind}
            title={card.title}
            description={card.description}
            icon={card.icon}
            state={state}
            busy={upgrading === card.kind}
            onUpgrade={upgrade}
          />
        )) : null}
      </section>
    </main>
  );
}

function StructureCard({
  kind,
  title,
  description,
  icon: Icon,
  state,
  busy,
  onUpgrade,
}: {
  kind: StructureKind;
  title: string;
  description: string;
  icon: typeof Dumbbell;
  state: StructureState;
  busy: boolean;
  onUpgrade: (kind: StructureKind) => Promise<void>;
}) {
  const currentLevel = kind === "TRAINING_CENTER"
    ? state.trainingCenterLevel
    : kind === "ACADEMY"
      ? state.academyLevel
      : state.venueLevel;
  const pendingLevel = kind === "TRAINING_CENTER"
    ? state.trainingCenterUpgradeLevel
    : kind === "ACADEMY"
      ? state.academyUpgradeLevel
      : state.venueUpgradeLevel;
  const completesAt = kind === "TRAINING_CENTER"
    ? state.trainingCenterUpgradeCompletesAt
    : kind === "ACADEMY"
      ? state.academyUpgradeCompletesAt
      : state.venueUpgradeCompletesAt;
  const rules = kind === "TRAINING_CENTER"
    ? TRAINING_CENTER_LEVELS[currentLevel as 1 | 2 | 3 | 4 | 5]
    : kind === "ACADEMY"
      ? ACADEMY_LEVELS[currentLevel as 1 | 2 | 3 | 4 | 5]
      : VENUE_LEVELS[currentLevel as 1 | 2 | 3 | 4 | 5];
  const nextLevel = Math.min(5, currentLevel + 1) as 1 | 2 | 3 | 4 | 5;
  const nextRules = kind === "TRAINING_CENTER"
    ? TRAINING_CENTER_LEVELS[nextLevel]
    : kind === "ACADEMY"
      ? ACADEMY_LEVELS[nextLevel]
      : VENUE_LEVELS[nextLevel];

  return (
    <article className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="text-sm font-bold text-emerald-300">Livello {currentLevel}/5</p>
        </div>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-5 rounded-xl bg-emerald-950/30 p-4 text-sm">
        <div className="flex justify-between gap-3 text-slate-400">
          <span>Manutenzione</span>
          <strong className="text-white">{formatCurrency(rules.weeklyMaintenance)}/sett.</strong>
        </div>
        <div className="mt-2 flex justify-between gap-3 text-slate-400">
          <span>Bonus attuale</span>
          <strong className="text-amber-300">{getBonusLabel(kind, rules)}</strong>
        </div>
      </div>

      {pendingLevel ? (
        <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4">
          <p className="font-black text-amber-300">Upgrade al livello {pendingLevel} in corso</p>
          <p className="mt-1 text-sm text-slate-400">
            Termine lavori: {completesAt ? new Date(completesAt).toLocaleString("it-IT") : "in elaborazione"}
          </p>
        </div>
      ) : currentLevel < 5 ? (
        <button
          type="button"
          onClick={() => void onUpgrade(kind)}
          disabled={busy || state.balance < nextRules.upgradeCost}
          className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? "Avvio lavori…"
            : `Livello ${nextLevel} · ${formatCurrency(nextRules.upgradeCost)} · ${nextRules.upgradeDays} giorni`}
        </button>
      ) : (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center font-black text-emerald-300">
          Livello massimo raggiunto
        </div>
      )}
    </article>
  );
}

function getBonusLabel(kind: StructureKind, rules: { growthBonus?: number; gateBonus?: number; overallBonus?: readonly [number, number] }) {
  if (kind === "TRAINING_CENTER") return `+${Math.round((rules.growthBonus ?? 0) * 100)}% crescita`;
  if (kind === "VENUE") return `+${Math.round((rules.gateBonus ?? 0) * 100)}% incassi casa`;
  const bonus = rules.overallBonus ?? [0, 0];
  return bonus[1] === 0 ? "Base" : `+${bonus[0]}–${bonus[1]} OVR nuovi giovani`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
