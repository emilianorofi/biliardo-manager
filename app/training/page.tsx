"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

const SKILLS = [
  {
    key: "precisione",
    label: "Precisione",
  },
  {
    key: "diretto",
    label: "Diretto",
  },
  {
    key: "sponde",
    label: "Sponde",
  },
  {
    key: "tattica",
    label: "Tattica",
  },
  {
    key: "mentalita",
    label: "Mentalità",
  },
  {
    key: "difesa",
    label: "Difesa",
  },
  {
    key: "realizzazione",
    label: "Realizzazione",
  },
  {
    key: "creativita",
    label: "Creatività",
  },
  {
    key: "misura",
    label: "Misura",
  },
] as const;

const TRAINING_USAGE = [
  {
    usage: "Panchina",
    intensity: "15%",
  },
  {
    usage: "1 partita in coppia",
    intensity: "30%",
  },
  {
    usage: "2 partite in coppia",
    intensity: "60%",
  },
  {
    usage: "1 partita singola",
    intensity: "40%",
  },
  {
    usage: "Singolo + 1 coppia",
    intensity: "70%",
  },
  {
    usage: "Singolo + 2 coppie",
    intensity: "100%",
  },
];

type TrainingFocus =
  (typeof SKILLS)[number]["key"];

type TrainingPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  age: number;
  overall: number;
  form: number;
  morale: number;
  usage: string;
  intensity: number;
  formationSlot:
    | "A"
    | "B"
    | "C"
    | null;
};

type TrainingApiResponse = {
  players?: TrainingPlayer[];

  trainer?: {
    level: number;
    efficiency: number;
  };

  trainingPlan?: {
    primaryFocus: TrainingFocus;
    secondaryFocus: TrainingFocus;
    savedAt: string | null;
    lastProcessedAt: string | null;
  };

  formation?: {
    slotAPlayerId: number | null;
    slotBPlayerId: number | null;
    slotCPlayerId: number | null;
  };

  message?: string;
  error?: string;
};

export default function TrainingPage() {
  const [players, setPlayers] =
    useState<TrainingPlayer[]>([]);

  const [trainerLevel, setTrainerLevel] =
    useState(1);

  const [
    trainerEfficiency,
    setTrainerEfficiency,
  ] = useState(60);

  const [
    primaryFocus,
    setPrimaryFocus,
  ] =
    useState<TrainingFocus>(
      "precisione"
    );

  const [
    secondaryFocus,
    setSecondaryFocus,
  ] =
    useState<TrainingFocus>(
      "tattica"
    );

  const [
    savedPrimaryFocus,
    setSavedPrimaryFocus,
  ] =
    useState<TrainingFocus>(
      "precisione"
    );

  const [
    savedSecondaryFocus,
    setSavedSecondaryFocus,
  ] =
    useState<TrainingFocus>(
      "tattica"
    );

  const [savedAt, setSavedAt] =
    useState<Date | null>(null);

  const [
    lastProcessedAt,
    setLastProcessedAt,
  ] = useState<Date | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadTraining() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "/api/training",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as TrainingApiResponse;

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Impossibile caricare l'allenamento."
          );
        }

        if (isCancelled) {
          return;
        }

        setPlayers(
          data.players ?? []
        );

        setTrainerLevel(
          data.trainer?.level ?? 1
        );

        setTrainerEfficiency(
          data.trainer?.efficiency ??
            60
        );

        const loadedPrimary =
          data.trainingPlan
            ?.primaryFocus ??
          "precisione";

        const loadedSecondary =
          data.trainingPlan
            ?.secondaryFocus ??
          "tattica";

        setPrimaryFocus(
          loadedPrimary
        );

        setSecondaryFocus(
          loadedSecondary
        );

        setSavedPrimaryFocus(
          loadedPrimary
        );

        setSavedSecondaryFocus(
          loadedSecondary
        );

        setSavedAt(
          data.trainingPlan?.savedAt
            ? new Date(
                data.trainingPlan
                  .savedAt
              )
            : null
        );

        setLastProcessedAt(
          data.trainingPlan
            ?.lastProcessedAt
            ? new Date(
                data.trainingPlan
                  .lastProcessedAt
              )
            : null
        );
      } catch (loadError: unknown) {
        if (isCancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Errore durante il caricamento dell'allenamento."
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTraining();

    return () => {
      isCancelled = true;
    };
  }, []);

  const isDirty =
    primaryFocus !==
      savedPrimaryFocus ||
    secondaryFocus !==
      savedSecondaryFocus;

  async function saveTraining() {
    if (
      primaryFocus ===
      secondaryFocus
    ) {
      setSuccessMessage(null);

      setActionError(
        "Il focus primario e quello secondario devono essere diversi."
      );

      return;
    }

    try {
      setIsSaving(true);
      setActionError(null);
      setSuccessMessage(null);

      const response = await fetch(
        "/api/training",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            primaryFocus,
            secondaryFocus,
          }),
        }
      );

      const data =
        (await response.json()) as TrainingApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Impossibile salvare l'allenamento."
        );
      }

      const savedPlan =
        data.trainingPlan;

      const newPrimary =
        savedPlan?.primaryFocus ??
        primaryFocus;

      const newSecondary =
        savedPlan?.secondaryFocus ??
        secondaryFocus;

      setPrimaryFocus(
        newPrimary
      );

      setSecondaryFocus(
        newSecondary
      );

      setSavedPrimaryFocus(
        newPrimary
      );

      setSavedSecondaryFocus(
        newSecondary
      );

      setSavedAt(
        savedPlan?.savedAt
          ? new Date(
              savedPlan.savedAt
            )
          : new Date()
      );

      setLastProcessedAt(
        savedPlan?.lastProcessedAt
          ? new Date(
              savedPlan
                .lastProcessedAt
            )
          : null
      );

      setSuccessMessage(
        data.message ??
          "Programma di allenamento salvato correttamente."
      );
    } catch (saveError: unknown) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : "Errore durante il salvataggio dell'allenamento."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="text-white">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
          <p className="text-lg font-semibold">
            Caricamento allenamento...
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            Recupero della rosa e del
            programma settimanale.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center">
          <p className="font-semibold text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-red-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-red-300"
          >
            Riprova
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-4 text-white">
        <header className="relative overflow-hidden rounded-2xl border border-emerald-900/60 bg-[linear-gradient(135deg,#183129_0%,#12231d_68%,#101e19_100%)] px-5 py-4 shadow-lg shadow-black/10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Sviluppo giocatori
              </p>

              <h1 className="mt-1 text-3xl font-black">
                Allenamento
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Programma la sessione settimanale della prima squadra.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <HeaderValue
                label="Prossima sessione"
                value="Mercoledì · 21:00"
                highlight
              />

              <HeaderValue
                label="Allenatore"
                value={`Livello ${trainerLevel} · ${trainerEfficiency}%`}
              />

              <Link
                href="/training/history"
                className="rounded-xl border border-zinc-700 bg-black/15 px-3 py-2 transition hover:border-amber-400/40 hover:bg-amber-400/5"
              >
                <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                  Ultima sessione
                </p>

                <p className="mt-1 text-xs font-black text-zinc-200">
                  {lastProcessedAt
                    ? formatShortDate(lastProcessedAt)
                    : "Nessun risultato"}
                </p>
              </Link>
            </div>
          </div>
        </header>

        {actionError && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-300">
              {actionError}
            </p>

            <button
              type="button"
              onClick={() =>
                setActionError(null)
              }
              className="font-bold text-red-300 transition hover:text-white"
              aria-label="Chiudi errore"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                {successMessage}
              </p>

              {savedAt && (
                <p className="mt-1 text-xs text-emerald-200/60">
                  Ultimo salvataggio:{" "}
                  {formatDate(
                    savedAt
                  )}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  null
                )
              }
              className="font-bold text-emerald-300 transition hover:text-white"
              aria-label="Chiudi messaggio"
            >
              ×
            </button>
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-[#141414] p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
            <h2 className="text-lg font-bold">
              Programma settimanale
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Seleziona due caratteristiche diverse entro mercoledì alle 20:59.
            </p>
            </div>

            <span className="text-xs font-semibold text-zinc-500">
              {players.length} giocatori coinvolti
            </span>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/[0.05] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                    Focus primario
                  </p>

                  <h3 className="mt-0.5 text-base font-bold">
                    Intensità 100%
                  </h3>
                </div>

                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 text-[9px] font-bold text-yellow-400">
                  PRINCIPALE
                </span>
              </div>

              <label
                htmlFor="primary-focus"
                className="sr-only"
              >
                Caratteristica
              </label>

              <select
                id="primary-focus"
                value={primaryFocus}
                onChange={(event) => {
                  setPrimaryFocus(
                    event.target
                      .value as TrainingFocus
                  );

                  setActionError(null);
                  setSuccessMessage(null);
                }}
                disabled={isSaving}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SKILLS.map(
                  (skill) => (
                    <option
                      key={skill.key}
                      value={skill.key}
                    >
                      {skill.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Focus secondario
                  </p>

                  <h3 className="mt-0.5 text-base font-bold">
                    Intensità 50%
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold text-zinc-400">
                  SECONDARIO
                </span>
              </div>

              <label
                htmlFor="secondary-focus"
                className="sr-only"
              >
                Caratteristica
              </label>

              <select
                id="secondary-focus"
                value={secondaryFocus}
                onChange={(event) => {
                  setSecondaryFocus(
                    event.target
                      .value as TrainingFocus
                  );

                  setActionError(null);
                  setSuccessMessage(null);
                }}
                disabled={isSaving}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SKILLS.map(
                  (skill) => (
                    <option
                      key={skill.key}
                      value={skill.key}
                    >
                      {skill.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/5 bg-[#0f0f0f] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                Impostazioni attuali
              </p>

              <p className="mt-0.5 text-xs text-zinc-400">
                {getSkillLabel(
                  primaryFocus
                )}{" "}
                100% ·{" "}
                {getSkillLabel(
                  secondaryFocus
                )}{" "}
                50%
              </p>

              {savedAt && (
                <p className="mt-1 text-xs text-zinc-500">
                  Salvato il{" "}
                  {formatDate(
                    savedAt
                  )}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={saveTraining}
              disabled={
                isSaving ||
                !isDirty ||
                primaryFocus ===
                  secondaryFocus
              }
              className="rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving
                ? "Salvataggio..."
                : isDirty
                  ? "Salva allenamento"
                  : "Allenamento salvato"}
            </button>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
            <div className="border-b border-white/10 px-4 py-3">
              <h2 className="text-base font-bold">
                Giocatori allenati
              </h2>

              <p className="mt-0.5 text-xs text-zinc-400">
                Intensità calcolata in base alla formazione salvata.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-[9px] uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-2.5">
                      Giocatore
                    </th>

                    <th className="px-3 py-2.5">
                      Utilizzo
                    </th>

                    <th className="px-3 py-2.5">
                      Intensità
                    </th>

                    <th className="px-4 py-2.5">
                      Stato
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {players.map(
                    (player) => (
                      <tr
                        key={player.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-4 py-2.5">
                          <p className="text-sm font-semibold text-white">
                            {
                              player.firstName
                            }{" "}
                            {
                              player.lastName
                            }
                          </p>

                          <p className="mt-0.5 text-[10px] text-zinc-500">
                            Overall{" "}
                            {
                              player.overall
                            }{" "}
                            · Forma{" "}
                            {player.form}/10 ·
                            Morale{" "}
                            {
                              player.morale
                            }
                            /10
                          </p>
                        </td>

                        <td className="px-3 py-2.5 text-xs text-zinc-300">
                          {player.usage}
                        </td>

                        <td className="px-3 py-2.5">
                          <span className="text-sm font-bold text-yellow-400">
                            {
                              player.intensity
                            }
                            %
                          </span>
                        </td>

                        <td className="px-4 py-2.5">
                          {player.formationSlot ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                              Slot{" "}
                              {
                                player.formationSlot
                              }
                            </span>
                          ) : (
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                              Panchina
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {players.length === 0 && (
                <div className="p-10 text-center">
                  <p className="font-semibold">
                    Nessun giocatore in
                    prima squadra
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-white/10 bg-[#141414] p-4">
            <h2 className="text-base font-bold">
              Intensità di utilizzo
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Percentuale ricevuta in base alle partite giocate.
            </p>

            <div className="mt-3 space-y-2">
              {TRAINING_USAGE.map(
                (item) => (
                  <div
                    key={item.usage}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0f0f0f] px-3 py-2"
                  >
                    <span className="text-xs text-zinc-300">
                      {item.usage}
                    </span>

                    <span className="text-sm font-bold text-yellow-400">
                      {
                        item.intensity
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>

        <details className="group rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-bold text-yellow-300">
            Regole dell&apos;allenamento
            <span className="text-base text-yellow-300/60 transition group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="border-t border-yellow-400/15 px-4 py-3">
            <p className="max-w-4xl text-xs leading-5 text-zinc-400">
              Il focus primario viene allenato al 100% e il secondario al 50%.
              L&apos;efficacia finale dipende dall&apos;utilizzo del giocatore e
              dal livello dell&apos;allenatore. Le impostazioni possono essere
              modificate fino a un minuto prima della sessione.
            </p>
          </div>
        </details>
    </main>
  );
}

function getSkillLabel(
  focus: TrainingFocus
) {
  return (
    SKILLS.find(
      (skill) =>
        skill.key === focus
    )?.label ?? focus
  );
}

function HeaderValue({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-black/15 px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className={`mt-1 text-xs font-black ${highlight ? "text-yellow-300" : "text-zinc-200"}`}>
        {value}
      </p>
    </div>
  );
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}
