"use client";

import Link from "next/link";
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
  primaryDecline: number;
  primaryAfter: number;

  secondaryBefore: number;
  secondaryGain: number;
  secondaryDecline: number;
  secondaryAfter: number;

  overallBefore: number;
  overallDecline: number;
  overallAfter: number;

  experienceBefore: number;
  experienceGain: number;
  experienceAfter: number;

  formBefore: number;
  formChange: number;
  formAfter: number;

  moraleBefore: number;
  moraleChange: number;
  moraleAfter: number;
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
      <main className="text-white">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
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
    <main className="space-y-4 text-white">
        <header className="relative overflow-hidden rounded-2xl border border-emerald-900/60 bg-[linear-gradient(135deg,#183129_0%,#12231d_68%,#101e19_100%)] px-5 py-4 shadow-lg shadow-black/10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <Link
                href="/training"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 transition hover:text-emerald-300"
              >
                ← Allenamento
              </Link>

              <h1 className="mt-1 text-3xl font-black">
                Storico allenamenti
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Crescita ottenuta nelle sessioni settimanali.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryValue label="Sessioni" value={sessions.length.toString()} />
              <SummaryValue label="Risultati" value={totalRecordedResults.toString()} />
              <SummaryValue label="Ultima settimana" value={latestSession?.weekKey ?? "—"} highlight />
              <SummaryValue
                label="Allenatore"
                value={latestSession ? `Lv. ${latestSession.trainerLevel} · ${latestSession.trainerEfficiency}%` : "—"}
              />
            </div>
          </div>
        </header>

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
          <div className="space-y-3">
            {sessions.map(
              (session, sessionIndex) => (
                <details
                  key={session.id}
                  open={sessionIndex === 0}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#141414] open:border-emerald-900/60"
                >
                  <summary className="cursor-pointer list-none p-4 marker:hidden">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-zinc-500 transition group-open:rotate-90">
                            ▶
                          </span>

                          <h2 className="text-base font-black">
                            Settimana{" "}
                            {
                              session.weekKey
                            }
                          </h2>

                          {sessionIndex === 0 && (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400">
                              Ultima sessione
                            </span>
                          )}
                        </div>

                        <p className="mt-1 pl-5 text-xs text-zinc-500">
                          {formatDate(
                            session.processedAt
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <SessionTag label="Primario" value={getSkillLabel(session.primaryFocus)} highlight />
                        <SessionTag label="Secondario" value={getSkillLabel(session.secondaryFocus)} />
                        <SessionTag label="Allenatore" value={`Lv. ${session.trainerLevel} · ${session.trainerEfficiency}%`} />
                        <SessionTag label="Giocatori" value={session.results.length.toString()} />
                      </div>
                    </div>
                  </summary>

                  <div className="overflow-x-auto border-t border-white/10">
                    <table className="w-full min-w-[980px] text-left">
                      <thead className="border-b border-white/10 bg-white/[0.02]">
                        <tr className="text-xs uppercase tracking-wider text-zinc-500">
                          <th className="px-4 py-2.5">
                            Giocatore
                          </th>

                          <th className="px-3 py-2.5">
                            Utilizzo
                          </th>

                          <th className="px-3 py-2.5">
                            Intensità
                          </th>

                          <th className="px-3 py-2.5">
                            Primario
                          </th>

                          <th className="px-3 py-2.5">
                            Secondario
                          </th>

                          <th className="px-4 py-2.5">
                            Overall
                          </th>

                          <th className="px-4 py-2.5">
                            Stato
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
                              <td className="px-4 py-2.5">
                                <p className="font-semibold">
                                  {
                                    result.firstName
                                  }{" "}
                                  {
                                    result.lastName
                                  }
                                </p>

                                <p className="text-[10px] text-zinc-500">
                                  {
                                    result.age
                                  }{" "}
                                  anni
                                </p>
                              </td>

                              <td className="px-3 py-2.5 text-xs text-zinc-300">
                                {
                                  result.usage
                                }
                              </td>

                              <td className="px-3 py-2.5 text-sm">
                                <span className="font-bold text-yellow-400">
                                  {
                                    result.intensity
                                  }
                                  %
                                </span>
                              </td>

                              <td className="px-3 py-2.5">
                                <p className="text-sm text-zinc-300">
                                  {formatValue(
                                    result.primaryBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.primaryAfter
                                  )}
                                </p>

                                <p className="text-[10px] font-bold text-emerald-400">
                                  Crescita +
                                  {formatValue(
                                    result.primaryGain
                                  )}
                                </p>

                                <p className="text-[10px] font-bold text-red-300">
                                  Calo −
                                  {formatValue(
                                    result.primaryDecline
                                  )}
                                </p>
                              </td>

                              <td className="px-3 py-2.5">
                                <p className="text-sm text-zinc-300">
                                  {formatValue(
                                    result.secondaryBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.secondaryAfter
                                  )}
                                </p>

                                <p className="text-[10px] font-bold text-emerald-400">
                                  Crescita +
                                  {formatValue(
                                    result.secondaryGain
                                  )}
                                </p>

                                <p className="text-[10px] font-bold text-red-300">
                                  Calo −
                                  {formatValue(
                                    result.secondaryDecline
                                  )}
                                </p>
                              </td>

                              <td className="px-4 py-2.5">
                                <p className="font-semibold">
                                  {formatValue(
                                    result.overallBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.overallAfter
                                  )}
                                </p>

                                <p
                                  className={`text-[10px] font-bold ${getChangeTone(
                                    result.overallAfter -
                                      result.overallBefore
                                  )}`}
                                >
                                  Netto{" "}
                                  {formatSignedChange(
                                    result.overallAfter -
                                      result.overallBefore
                                  )}
                                </p>

                                <p className="text-[10px] font-bold text-red-300">
                                  Calo età −
                                  {formatValue(
                                    result.overallDecline
                                  )}
                                </p>
                              </td>

                              <td className="px-4 py-2.5 text-[10px] text-zinc-400">
                                <p>
                                  Esperienza{" "}
                                  {formatValue(
                                    result.experienceBefore
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    result.experienceAfter
                                  )}{" "}
                                  <span className="font-bold text-sky-300">
                                    +
                                    {formatValue(
                                      result.experienceGain
                                    )}
                                  </span>
                                </p>

                                <p className={getChangeTone(result.formChange)}>
                                  Forma{" "}
                                  {result.formBefore} → {result.formAfter}{" "}
                                  ({formatSignedInteger(result.formChange)})
                                </p>

                                <p className={getChangeTone(result.moraleChange)}>
                                  Morale{" "}
                                  {result.moraleBefore} → {result.moraleAfter}{" "}
                                  ({formatSignedInteger(result.moraleChange)})
                                </p>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </details>
              )
            )}
          </div>
        )}
    </main>
  );
}

function SummaryValue({
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

      <p className={`mt-1 text-xs font-black ${highlight ? "text-amber-300" : "text-zinc-200"}`}>
        {value}
      </p>
    </div>
  );
}

function SessionTag({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <span className={`rounded-lg border px-2.5 py-1.5 ${highlight ? "border-yellow-400/20 bg-yellow-400/[0.05] text-yellow-300" : "border-white/10 bg-[#0f0f0f] text-zinc-300"}`}>
      <span className="text-[9px] font-bold uppercase text-zinc-500">{label}</span>{" "}
      <strong>{value}</strong>
    </span>
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

function formatSignedChange(
  value: number
) {
  const formatted =
    new Intl.NumberFormat(
    "it-IT",
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }
  ).format(Math.abs(value));

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `−${formatted}`;
  }

  return formatted;
}

function getChangeTone(
  value: number
) {
  if (value > 0) {
    return "text-emerald-400";
  }

  if (value < 0) {
    return "text-red-300";
  }

  return "text-zinc-400";
}

function formatSignedInteger(
  value: number
) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;

  return "0";
}
