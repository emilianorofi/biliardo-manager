"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, CircleAlert, Save, UsersRound } from "lucide-react";

import type { FormationSubstitution, ReserveSlot } from "@/lib/formation-strategy";

type SimplePlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  age: number;
};

type StrategyResponse = {
  players?: SimplePlayer[];
  starters?: {
    A: number | null;
    B: number | null;
    C: number | null;
  };
  strategy?: {
    reserves: Record<ReserveSlot, number | null>;
    substitutions: FormationSubstitution[];
  };
  savedAt?: string;
  message?: string;
  error?: string;
};

const RESERVE_SLOTS: ReserveSlot[] = ["R1", "R2", "R3"];
const GAME_LABELS: Record<number, string> = {
  1: "Dopo il singolo di Italiana",
  2: "Dopo la coppia di Italiana",
  3: "Dopo il singolo di Goriziana",
  4: "Dopo la coppia di Goriziana",
  5: "Dopo il singolo di Tutti Doppi",
};

export default function FormationStrategyBoard() {
  const [players, setPlayers] = useState<SimplePlayer[]>([]);
  const [starters, setStarters] = useState({
    A: null as number | null,
    B: null as number | null,
    C: null as number | null,
  });
  const [reserves, setReserves] = useState<Record<ReserveSlot, number | null>>({
    R1: null,
    R2: null,
    R3: null,
  });
  const [substitutions, setSubstitutions] = useState<FormationSubstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStrategy() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/formation/strategy", {
        cache: "no-store",
      });
      const data = (await response.json()) as StrategyResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Impossibile caricare riserve e cambi.");
      }

      setPlayers(data.players ?? []);
      setStarters(
        data.starters ?? {
          A: null,
          B: null,
          C: null,
        }
      );
      setReserves(
        data.strategy?.reserves ?? {
          R1: null,
          R2: null,
          R3: null,
        }
      );
      setSubstitutions(data.strategy?.substitutions ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Errore durante il caricamento."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStrategy();
  }, []);

  const starterIds = useMemo(
    () => Object.values(starters).filter((value): value is number => value !== null),
    [starters]
  );
  const reserveIds = useMemo(
    () => Object.values(reserves).filter((value): value is number => value !== null),
    [reserves]
  );

  function updateReserve(slot: ReserveSlot, value: string) {
    const playerId = value ? Number(value) : null;
    setReserves((current) => ({
      ...current,
      [slot]: playerId,
    }));
    setSubstitutions((current) =>
      current.filter((substitution) =>
        substitution.reserveSlot !== slot || playerId !== null
      )
    );
    setMessage(null);
  }

  function addSubstitution() {
    if (substitutions.length >= 3) return;
    const availableReserve = RESERVE_SLOTS.find(
      (slot) =>
        reserves[slot] !== null &&
        !substitutions.some((substitution) => substitution.reserveSlot === slot)
    );
    if (!availableReserve) {
      setError("Seleziona prima una riserva non ancora utilizzata.");
      return;
    }

    setError(null);
    setMessage(null);
    setSubstitutions((current) => [
      ...current,
      {
        afterGame: Math.min(5, current.length + 1),
        slot: "A",
        reserveSlot: availableReserve,
      },
    ]);
  }

  function updateSubstitution(
    index: number,
    patch: Partial<FormationSubstitution>
  ) {
    setSubstitutions((current) =>
      current.map((substitution, itemIndex) =>
        itemIndex === index ? { ...substitution, ...patch } : substitution
      )
    );
    setMessage(null);
  }

  function removeSubstitution(index: number) {
    setSubstitutions((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
    setMessage(null);
  }

  async function saveStrategy() {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/formation/strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reserves,
          substitutions,
        }),
      });
      const data = (await response.json()) as StrategyResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Impossibile salvare riserve e cambi.");
      }

      setMessage(data.message ?? "Riserve e cambi salvati.");
      if (data.strategy) {
        setReserves(data.strategy.reserves);
        setSubstitutions(data.strategy.substitutions);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Errore durante il salvataggio."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-5 text-sm text-slate-400">
        Caricamento riserve e cambi programmati...
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
      <div className="flex flex-col justify-between gap-3 border-b border-emerald-900/60 p-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <UsersRound size={18} />
            <p className="text-xs font-black uppercase tracking-[0.18em]">
              Panchina e cambi
            </p>
          </div>
          <h2 className="mt-1 text-xl font-black text-white">
            Fino a 3 riserve e 3 cambi programmati
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
            I cambi si decidono adesso e scattano automaticamente soltanto al termine della prova scelta. Durante la giornata non potrai intervenire.
          </p>
        </div>

        <button
          type="button"
          onClick={saveStrategy}
          disabled={saving || starterIds.length !== 3}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-[#122018] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={17} />
          {saving ? "Salvataggio..." : "Salva riserve e cambi"}
        </button>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/25 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Riserve
          </p>
          <div className="mt-3 space-y-3">
            {RESERVE_SLOTS.map((slot) => (
              <label key={slot} className="block">
                <span className="mb-1.5 block text-xs font-black text-white">
                  {slot}
                </span>
                <select
                  value={reserves[slot] ?? ""}
                  onChange={(event) => updateReserve(slot, event.target.value)}
                  className="w-full rounded-xl border border-emerald-800 bg-[#10231c] px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-amber-400"
                >
                  <option value="">Nessuna riserva</option>
                  {players.map((player) => {
                    const disabled =
                      starterIds.includes(player.id) ||
                      (reserveIds.includes(player.id) && reserves[slot] !== player.id);
                    return (
                      <option key={player.id} value={player.id} disabled={disabled}>
                        {player.firstName} {player.lastName}
                        {starterIds.includes(player.id) ? " • titolare" : disabled ? " • già riserva" : ""}
                      </option>
                    );
                  })}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Cambi programmati
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Il cambio vale dalla prova successiva in poi.
              </p>
            </div>
            <button
              type="button"
              onClick={addSubstitution}
              disabled={substitutions.length >= 3 || reserveIds.length === 0}
              className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-300 disabled:opacity-40"
            >
              + Aggiungi cambio
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {substitutions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-900/70 p-5 text-center text-sm text-slate-500">
                Nessun cambio programmato.
              </div>
            ) : (
              substitutions.map((substitution, index) => (
                <div key={`${substitution.reserveSlot}-${index}`} className="grid gap-2 rounded-xl border border-emerald-900/60 bg-[#10231c] p-3 lg:grid-cols-[1.4fr_0.7fr_0.8fr_auto] lg:items-end">
                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Quando
                    </span>
                    <select
                      value={substitution.afterGame}
                      onChange={(event) =>
                        updateSubstitution(index, { afterGame: Number(event.target.value) })
                      }
                      className="w-full rounded-lg border border-emerald-800 bg-[#15261f] px-2 py-2 text-xs font-bold text-white"
                    >
                      {Object.entries(GAME_LABELS).map(([game, label]) => (
                        <option key={game} value={game}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Esce slot
                    </span>
                    <select
                      value={substitution.slot}
                      onChange={(event) =>
                        updateSubstitution(index, { slot: event.target.value as "A" | "B" | "C" })
                      }
                      className="w-full rounded-lg border border-emerald-800 bg-[#15261f] px-2 py-2 text-xs font-bold text-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Entra
                    </span>
                    <select
                      value={substitution.reserveSlot}
                      onChange={(event) =>
                        updateSubstitution(index, { reserveSlot: event.target.value as ReserveSlot })
                      }
                      className="w-full rounded-lg border border-emerald-800 bg-[#15261f] px-2 py-2 text-xs font-bold text-white"
                    >
                      {RESERVE_SLOTS.map((slot) => (
                        <option
                          key={slot}
                          value={slot}
                          disabled={
                            reserves[slot] === null ||
                            substitutions.some(
                              (item, itemIndex) =>
                                itemIndex !== index && item.reserveSlot === slot
                            )
                          }
                        >
                          {slot}{reserves[slot] === null ? " • vuota" : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeSubstitution(index)}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300"
                  >
                    Rimuovi
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-emerald-900/60 px-4 py-3">
        {error && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">
            <CircleAlert size={17} /> {error}
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200">
            <ArrowRightLeft size={17} /> {message}
          </div>
        )}
        {starterIds.length !== 3 && (
          <p className="text-xs text-amber-300">
            Salva prima i tre titolari A, B e C. Poi ricarica questa sezione per impostare la panchina.
          </p>
        )}
      </div>
    </section>
  );
}
