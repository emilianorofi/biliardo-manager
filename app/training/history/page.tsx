"use client";

import {
  useEffect,
  useState,
} from "react";

const SKILL_LABELS: Record<
  string,
  string
> = {
  precisione: "Precisione",
  diretto: "Diretto",
  sponde: "Sponde",
  tattica: "Tattica",
  mentalita: "Mentalità",
  difesa: "Difesa",
  realizzazione: "Realizzazione",
  creativita: "Creatività",
  misura: "Misura",
};

type TrainingResult = {
  id: number;
  playerId: number | null;

  firstName: string;
  lastName: string;
  age: number;

  usage: string;
  intensity: number;

  primaryBefore: number;
  primaryGain: number;
  primaryAfter: number;

  secondaryBefore: number;
  secondaryGain: number;
  secondaryAfter: number;

  overallBefore: number;
  overallAfter: number;
};

type TrainingSession = {
  id: number;
  weekKey: string;

  primaryFocus: string;
  secondaryFocus: string;

  trainerLevel: number;
  trainerEfficiency: number;

  processedAt: string;

  results: TrainingResult[];
};

type TrainingHistoryResponse = {
  sessions?: TrainingSession[];
  error?: string;
};

export default function TrainingHistoryPage() {
  const [
    sessions,
    setSessions,
  ] = useState<TrainingSession[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "/api/training/history",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as TrainingHistoryResponse;

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Impossibile caricare lo storico degli allenamenti."
          );
        }

        if (isCancelled) {
          return;
        }

        setSessions(
          data.sessions ?? []
        );
      } catch (
        loadError: unknown
      ) {
        if (isCancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Errore durante il caricamento dello storico."
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
          <p className="text-lg font-semibold">
            Caricamento storico...
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            Recupero delle sessioni
            di allenamento.
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

  const latestSession =
    sessions[0] ?? null;

  const totalRecordedResults =
    sessions.reduce(
      (total, session) =>
        total +
        session.results.length,
      0
    );

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Sviluppo giocatori
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Storico allenamenti
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Controlla la crescita
            ottenuta dai giocatori
            durante ogni sessione
            settimanale
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Sessioni registrate
            </p>

            <p className="mt-2 text-3xl font-bold">
              {sessions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Risultati giocatori
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalRecordedResults}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Ultima settimana
            </p>

            <p className="mt-2 text-2xl font-bold">
              {latestSession?.weekKey ??
                "Nessuna"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Ultimo allenatore
            </p>

            <p className="mt-2 text-2xl font-bold">
              {latestSession
                ? `Livello ${latestSession.trainerLevel}`
                : "—"}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {latestSession
                ? `Efficienza ${latestSession.trainerEfficiency}%`
                : "Nessuna sessione"}
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
            <p className="text-lg font-semibold">
              Nessun allenamento
              registrato
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Lo storico comparirà
              dopo la prima sessione
              elaborata.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            {sessions.map(
              (session) => (
                <section
                  key={session.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
                >
                  <div className="border-b border-white/10 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold">
                            Settimana{" "}
                            {
                              session.weekKey
                            }
                          </h2>

                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            Elaborato
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                          {formatDate(
                            session.processedAt
                          )}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/[0.05] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                            Primario
                          </p>

                          <p className="mt-1 font-bold">
                            {getSkillLabel(
                              session.primaryFocus
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Secondario
                          </p>

                          <p className="mt-1 font-bold">
                            {getSkillLabel(
                              session.secondaryFocus
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Allenatore
                          </p>

                          <p className="mt-1 font-bold">
                            Livello{" "}
                            {
                              session.trainerLevel
                            }{" "}
                            ·{" "}
                            {
                              session.trainerEfficiency
                            }
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left">
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

                          <th className="px-4 py-4">
                            Primario
                          </th>

                          <th className="px-4 py-4">
                            Secondario
                          </th>

                          <th className="px-5 py-4">
                            Overall
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {session.results.map(
                          (result) => (
                            <tr
                              key={
                                result.id
                              }
                              className="border-b border-white/5 last:border-0"
                            >
                              <td className="px-5 py-4">
                                <p className="font-semibold">
                                  {
                                    result.firstName
                                  }{" "}
                                  {
                                    result.lastName
                                  }
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                  {
                                    result.age
                                  }{" "}
                                  anni
                                </p>
                              </td>

                              <td className="px-4 py-4 text-sm text-zinc-300">
                                {
                                  result.usage
                                }
                              </td>

                              <td className="px-4 py-4">
                                <span className="font-bold text-yellow-400">
                                  {
                                    result.intensity
                                  }
                                  %
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <p className="text-sm text-zinc-300">
                                  {formatValue(
                                    result.primaryBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.primaryAfter
                                  )}
                                </p>

                                <p className="mt-1 text-xs font-bold text-emerald-400">
                                  +
                                  {formatGain(
                                    result.primaryGain
                                  )}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <p className="text-sm text-zinc-300">
                                  {formatValue(
                                    result.secondaryBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.secondaryAfter
                                  )}
                                </p>

                                <p className="mt-1 text-xs font-bold text-emerald-400">
                                  +
                                  {formatGain(
                                    result.secondaryGain
                                  )}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-semibold">
                                  {formatValue(
                                    result.overallBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.overallAfter
                                  )}
                                </p>

                                <p className="mt-1 text-xs font-bold text-emerald-400">
                                  +
                                  {formatGain(
                                    result.overallAfter -
                                      result.overallBefore
                                  )}
                                </p>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function getSkillLabel(
  skill: string
) {
  return (
    SKILL_LABELS[skill] ??
    skill
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function formatValue(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }
  ).format(value);
}

function formatGain(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }
  ).format(
    Math.max(0, value)
  );
}