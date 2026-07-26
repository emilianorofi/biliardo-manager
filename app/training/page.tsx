"use client";

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
      <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
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
      <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center">
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
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Sviluppo giocatori
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Allenamento
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Programma la sessione
            settimanale della prima
            squadra
          </p>
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Prossimo allenamento
            </p>

            <p className="mt-2 text-2xl font-bold">
              Mercoledì
            </p>

            <p className="mt-1 text-sm text-yellow-400">
              Ore 21:00
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Giocatori
            </p>

            <p className="mt-2 text-3xl font-bold">
              {players.length}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Prima squadra
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Allenatore
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              Livello {trainerLevel}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Efficienza{" "}
              {trainerEfficiency}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Stato
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              Programmabile
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Modificabile fino alle
              20:59
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold">
              Programma settimanale
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Scegli le due
              caratteristiche da
              allenare questa settimana
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.05] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                    Focus primario
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Intensità 100%
                  </h3>
                </div>

                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400">
                  PRINCIPALE
                </span>
              </div>

              <label
                htmlFor="primary-focus"
                className="mt-5 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Focus secondario
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Intensità 50%
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-400">
                  SECONDARIO
                </span>
              </div>

              <label
                htmlFor="secondary-focus"
                className="mt-5 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/5 bg-[#0f0f0f] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                Impostazioni attuali
              </p>

              <p className="mt-1 text-sm text-zinc-400">
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
              className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving
                ? "Salvataggio..."
                : isDirty
                  ? "Salva allenamento"
                  : "Allenamento salvato"}
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-lg font-bold">
                Giocatori allenati
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                L&apos;intensità
                individuale dipende
                dall&apos;utilizzo nella
                formazione salvata
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-4">
                      Giocatore
                    </th>

                    <th className="px-4 py-4">
                      Utilizzo
                    </th>

                    <th className="px-4 py-4">
                      Intensità
                    </th>

                    <th className="px-5 py-4">
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
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">
                            {
                              player.firstName
                            }{" "}
                            {
                              player.lastName
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
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

                        <td className="px-4 py-4 text-sm text-zinc-300">
                          {player.usage}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-bold text-yellow-400">
                            {
                              player.intensity
                            }
                            %
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {player.formationSlot ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                              Slot{" "}
                              {
                                player.formationSlot
                              }
                            </span>
                          ) : (
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-400">
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

          <aside className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <h2 className="text-lg font-bold">
              Intensità di utilizzo
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Percentuale di
              allenamento ricevuta in
              base alle partite giocate
            </p>

            <div className="mt-5 space-y-3">
              {TRAINING_USAGE.map(
                (item) => (
                  <div
                    key={item.usage}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0f0f0f] px-4 py-3"
                  >
                    <span className="text-sm text-zinc-300">
                      {item.usage}
                    </span>

                    <span className="font-bold text-yellow-400">
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

        <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
            Regole allenamento
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Sessione ogni mercoledì
            alle 21:00
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-400">
            Il focus primario viene
            allenato al 100% e il focus
            secondario al 50%.
            L&apos;efficacia finale
            dipende dall&apos;utilizzo
            del giocatore e dal livello
            dell&apos;allenatore. Le
            impostazioni possono essere
            modificate fino a un minuto
            prima della sessione.
          </p>

          {lastProcessedAt && (
            <p className="mt-3 text-xs font-semibold text-yellow-400">
              Ultima sessione
              elaborata:{" "}
              {formatDate(
                lastProcessedAt
              )}
            </p>
          )}
        </section>
      </div>
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