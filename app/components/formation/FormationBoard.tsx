"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";

import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Clock3,
  RotateCcw,
  Save,
  Sparkles,
  Users,
} from "lucide-react";

import type { Player } from "../../types/player";
import FormationSlot from "./FormationSlot";

type SlotKey = "A" | "B" | "C";

type SpecialtyKey =
  keyof Player["specialties"];

type Formation = Record<
  SlotKey,
  number | null
>;

type FormationStats = {
  overall: number;
  italiana: number;
  goriziana: number;
  tuttiDoppi: number;
  form: number;
  morale: number;
  chemistry: number;
};

type FormationApiResponse = {
  players?: Player[];

  formation?: {
    slotAPlayerId: number | null;
    slotBPlayerId: number | null;
    slotCPlayerId: number | null;
    savedAt: string | null;
  };

  message?: string;
  error?: string;
};

const emptyFormation: Formation = {
  A: null,
  B: null,
  C: null,
};

export default function FormationBoard() {
  const [players, setPlayers] =
    useState<Player[]>([]);

  const [formation, setFormation] =
    useState<Formation>(emptyFormation);

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [isDirty, setIsDirty] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadFormation() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "/api/formation",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as FormationApiResponse;

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Impossibile caricare la formazione."
          );
        }

        if (isCancelled) {
          return;
        }

        setPlayers(data.players ?? []);

        setFormation({
          A:
            data.formation
              ?.slotAPlayerId ?? null,

          B:
            data.formation
              ?.slotBPlayerId ?? null,

          C:
            data.formation
              ?.slotCPlayerId ?? null,
        });

        setLastSavedAt(
          data.formation?.savedAt
            ? new Date(
                data.formation.savedAt
              )
            : null
        );

        setIsDirty(false);
      } catch (loadError: unknown) {
        if (isCancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Errore durante il caricamento della formazione."
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFormation();

    return () => {
      isCancelled = true;
    };
  }, []);

  const playerA = players.find(
    (player) =>
      player.id === formation.A
  );

  const playerB = players.find(
    (player) =>
      player.id === formation.B
  );

  const playerC = players.find(
    (player) =>
      player.id === formation.C
  );

  const selectedPlayers = useMemo(
    () =>
      [
        playerA,
        playerB,
        playerC,
      ].filter(
        (player): player is Player =>
          Boolean(player)
      ),
    [playerA, playerB, playerC]
  );

  const selectedIds = useMemo(
    () =>
      Object.values(formation).filter(
        (
          playerId
        ): playerId is number =>
          playerId !== null
      ),
    [formation]
  );

  const formationComplete =
    selectedPlayers.length === 3;

  const formationStats = useMemo(
    () =>
      calculateFormationStats(
        selectedPlayers
      ),
    [selectedPlayers]
  );

  const warnings = useMemo(
    () =>
      getFormationWarnings(
        selectedPlayers
      ),
    [selectedPlayers]
  );

  function assignPlayer(
    slot: SlotKey,
    value: string
  ) {
    const playerId =
      value.length > 0
        ? Number(value)
        : null;

    setFormation((current) => ({
      ...current,
      [slot]: playerId,
    }));

    setActionError(null);
    setIsDirty(true);
  }

  function resetFormation() {
    setFormation({
      A: null,
      B: null,
      C: null,
    });

    setActionError(null);
    setIsDirty(true);
  }

  function createRecommendedFormation() {
    const recommended =
      getRecommendedFormation(players);

    setFormation(recommended);
    setActionError(null);
    setIsDirty(true);
  }

  async function saveFormation() {
    if (
      formation.A === null ||
      formation.B === null ||
      formation.C === null
    ) {
      return;
    }

    try {
      setIsSaving(true);
      setActionError(null);

      const response = await fetch(
        "/api/formation",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            slotAPlayerId:
              formation.A,

            slotBPlayerId:
              formation.B,

            slotCPlayerId:
              formation.C,
          }),
        }
      );

      const data =
        (await response.json()) as FormationApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Impossibile salvare la formazione."
        );
      }

      setFormation({
        A:
          data.formation
            ?.slotAPlayerId ??
          formation.A,

        B:
          data.formation
            ?.slotBPlayerId ??
          formation.B,

        C:
          data.formation
            ?.slotCPlayerId ??
          formation.C,
      });

      setLastSavedAt(
        data.formation?.savedAt
          ? new Date(
              data.formation.savedAt
            )
          : new Date()
      );

      setIsDirty(false);
    } catch (saveError: unknown) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : "Errore durante il salvataggio della formazione."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-10 text-center">
        <p className="font-bold text-white">
          Caricamento formazione...
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Recupero della rosa e degli
          slot salvati.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <p className="font-bold text-red-300">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-5 rounded-xl bg-red-400 px-4 py-2 text-sm font-black text-black transition hover:bg-red-300"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f]">
        <div className="flex flex-col justify-between gap-3 border-b border-emerald-900/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
              Schieramento
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Assegna gli slot A, B e C
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
              Scegli tre giocatori
              diversi. Le sei partite
              della giornata verranno
              generate automaticamente.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={
                createRecommendedFormation
              }
              disabled={
                players.length < 3 ||
                isSaving
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-300 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles size={17} />

              Formazione consigliata
            </button>

            <button
              type="button"
              onClick={resetFormation}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-800 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} />

              Azzera
            </button>

            <button
              type="button"
              onClick={saveFormation}
              disabled={
                !formationComplete ||
                isSaving
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-[#122018] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={17} />

              {isSaving
                ? "Salvataggio..."
                : "Salva"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-3">
          <FormationSlot
            slot="A"
            player={playerA}
            players={players}
            selectedIds={selectedIds}
            currentValue={formation.A}
            onChange={(value) =>
              assignPlayer(
                "A",
                value
              )
            }
          />

          <FormationSlot
            slot="B"
            player={playerB}
            players={players}
            selectedIds={selectedIds}
            currentValue={formation.B}
            onChange={(value) =>
              assignPlayer(
                "B",
                value
              )
            }
          />

          <FormationSlot
            slot="C"
            player={playerC}
            players={players}
            selectedIds={selectedIds}
            currentValue={formation.C}
            onChange={(value) =>
              assignPlayer(
                "C",
                value
              )
            }
          />
        </div>

        <div className="px-4 pb-4">
          {actionError && (
            <div className="mb-3 flex items-start justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <div className="flex gap-3">
                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-red-300"
                />

                <p className="text-sm font-bold text-red-200">
                  {actionError}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActionError(
                    null
                  )
                }
                className="font-black text-red-300 transition hover:text-white"
                aria-label="Chiudi errore"
              >
                ×
              </button>
            </div>
          )}

          <FormationStatus
            complete={
              formationComplete
            }
            dirty={isDirty}
            lastSavedAt={
              lastSavedAt
            }
          />

          {warnings.length > 0 && (
            <div className="mt-3 rounded-xl border border-orange-400/30 bg-orange-400/10 p-4">
              <div className="flex gap-3">
                <CircleAlert
                  size={19}
                  className="mt-0.5 shrink-0 text-orange-300"
                />

                <div>
                  <p className="text-sm font-black text-orange-200">
                    Attenzione alla
                    condizione
                  </p>

                  <div className="mt-2 space-y-1">
                    {warnings.map(
                      (warning) => (
                        <p
                          key={
                            warning
                          }
                          className="text-sm text-orange-100/70"
                        >
                          {warning}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
        <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Users size={21} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Generazione automatica
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Incontri della giornata
              </h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            <MatchCard
              number={1}
              specialty="Italiana 80"
              specialtyKey="italiana"
              position="A"
              matchPlayers={[
                playerA,
              ]}
            />

            <MatchCard
              number={2}
              specialty="Italiana 80"
              specialtyKey="italiana"
              position="B–C"
              matchPlayers={[
                playerB,
                playerC,
              ]}
            />

            <MatchCard
              number={3}
              specialty="Goriziana 400"
              specialtyKey="goriziana"
              position="B"
              matchPlayers={[
                playerB,
              ]}
            />

            <MatchCard
              number={4}
              specialty="Goriziana 400"
              specialtyKey="goriziana"
              position="A–C"
              matchPlayers={[
                playerA,
                playerC,
              ]}
            />

            <MatchCard
              number={5}
              specialty="Tutti Doppi 600"
              specialtyKey="tuttiDoppi"
              position="C"
              matchPlayers={[
                playerC,
              ]}
            />

            <MatchCard
              number={6}
              specialty="Tutti Doppi 600"
              specialtyKey="tuttiDoppi"
              position="A–B"
              matchPlayers={[
                playerA,
                playerB,
              ]}
            />
          </div>
        </section>

        <FormationSummary
          complete={
            formationComplete
          }
          stats={formationStats}
        />
      </div>
    </div>
  );
}

function MatchCard({
  number,
  specialty,
  specialtyKey,
  position,
  matchPlayers,
}: {
  number: number;
  specialty: string;
  specialtyKey: SpecialtyKey;
  position: string;

  matchPlayers: Array<
    Player | undefined
  >;
}) {
  const complete =
    matchPlayers.every(Boolean);

  const validPlayers =
    matchPlayers.filter(
      (
        player
      ): player is Player =>
        Boolean(player)
    );

  const matchRating = complete
    ? Math.round(
        validPlayers.reduce(
          (total, player) =>
            total +
            player.specialties[
              specialtyKey
            ],
          0
        ) /
          validPlayers.length
      )
    : null;

  return (
    <article className="rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-4 transition hover:border-emerald-700/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-[#122018]">
            {number}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
              {specialty}
            </p>

            <p className="mt-1 font-black text-white">
              Posizione {position}
            </p>
          </div>
        </div>

        {matchRating !== null ? (
          <div className="rounded-xl border border-emerald-700/50 bg-emerald-900/40 px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/70">
              Valutazione
            </p>

            <p className="mt-0.5 text-xl font-black text-white">
              {matchRating}
            </p>
          </div>
        ) : (
          <CircleAlert
            size={20}
            className="mt-2 shrink-0 text-slate-600"
          />
        )}
      </div>

      <div className="mt-4 rounded-xl border border-emerald-900/60 bg-[#10231c] px-4 py-3">
        {complete ? (
          <div>
            <div className="flex flex-wrap gap-3">
              {validPlayers.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="flex items-center gap-2 font-bold text-white transition hover:text-amber-200 hover:underline">
                  <PlayerPortrait player={player} className="aspect-[2/3] w-12" />
                  <span>{player.firstName} {player.lastName}</span>
                </Link>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {validPlayers.map(
                (player) => (
                  <span
                    key={player.id}
                    className="rounded-lg bg-emerald-900/50 px-2 py-1 text-[11px] font-bold text-emerald-200"
                  >
                    {
                      player
                        .specialties[
                        specialtyKey
                      ]
                    }{" "}
                    {
                      specialty.split(
                        " "
                      )[0]
                    }
                  </span>
                )
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Completa gli slot
            richiesti
          </p>
        )}
      </div>
    </article>
  );
}

function FormationSummary({
  complete,
  stats,
}: {
  complete: boolean;
  stats: FormationStats | null;
}) {
  return (
    <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-5 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
          <BarChart3 size={21} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            Analisi
          </p>

          <h2 className="mt-1 text-2xl font-black text-white">
            Riepilogo formazione
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300/80">
            Overall medio
          </p>

          <p className="mt-2 text-5xl font-black text-amber-300">
            {complete && stats
              ? stats.overall
              : "--"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
          <SummaryValue
            label="Italiana"
            value={
              complete && stats
                ? stats.italiana
                : "--"
            }
          />

          <SummaryValue
            label="Goriziana"
            value={
              complete && stats
                ? stats.goriziana
                : "--"
            }
          />

          <SummaryValue
            label="Tutti Doppi"
            value={
              complete && stats
                ? stats.tuttiDoppi
                : "--"
            }
          />
        </div>

        <div className="mt-5 space-y-4 border-t border-emerald-900/60 pt-5">
          <SummaryProgress
            label="Forma media"
            value={
              complete && stats
                ? stats.form
                : null
            }
          />

          <SummaryProgress
            label="Morale medio"
            value={
              complete && stats
                ? stats.morale
                : null
            }
          />

          <SummaryProgress
            label="Affiatamento stimato"
            value={
              complete && stats
                ? stats.chemistry
                : null
            }
          />
        </div>

        {!complete && (
          <div className="mt-5 rounded-xl border border-slate-700 bg-black/10 p-4 text-sm leading-6 text-slate-400">
            Completa gli slot A, B
            e C per visualizzare
            l’analisi della
            formazione.
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryValue({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/70">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryProgress({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-300">
          {label}
        </p>

        <p className="text-sm font-black text-white">
          {value !== null
            ? `${value}%`
            : "--"}
        </p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-950">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500"
          style={{
            width:
              value !== null
                ? `${value}%`
                : "0%",
          }}
        />
      </div>
    </div>
  );
}

function FormationStatus({
  complete,
  dirty,
  lastSavedAt,
}: {
  complete: boolean;
  dirty: boolean;
  lastSavedAt: Date | null;
}) {
  if (
    lastSavedAt &&
    !dirty
  ) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/40 bg-emerald-400/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm font-bold text-emerald-300">
          <CheckCircle2
            size={18}
          />

          Formazione salvata
          correttamente.
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200/60">
          <Clock3 size={14} />

          Ultimo salvataggio:{" "}
          {formatSavedDate(
            lastSavedAt
          )}
        </div>
      </div>
    );
  }

  if (
    complete &&
    dirty
  ) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-300">
        <CircleAlert
          size={18}
        />

        Formazione completa ma
        non ancora salvata.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-black/10 px-4 py-3 text-sm text-slate-400">
      <CircleAlert size={18} />

      Assegna un giocatore
      diverso a ciascuno dei tre
      slot.
    </div>
  );
}

function calculateFormationStats(
  selectedPlayers: Player[]
): FormationStats | null {
  if (
    selectedPlayers.length !== 3
  ) {
    return null;
  }

  const overall = average(
    selectedPlayers.map(
      (player) =>
        player.overall
    )
  );

  const italiana = average(
    selectedPlayers.map(
      (player) =>
        player.specialties
          .italiana
    )
  );

  const goriziana = average(
    selectedPlayers.map(
      (player) =>
        player.specialties
          .goriziana
    )
  );

  const tuttiDoppi = average(
    selectedPlayers.map(
      (player) =>
        player.specialties
          .tuttiDoppi
    )
  );

  const form = average(
    selectedPlayers.map(
      (player) =>
        player.form * 10
    )
  );

  const morale = average(
    selectedPlayers.map(
      (player) =>
        player.morale * 10
    )
  );

  const experience = average(
    selectedPlayers.map(
      (player) =>
        player.experience
    )
  );

  const chemistry = Math.min(
    100,
    Math.round(
      form * 0.35 +
        morale * 0.4 +
        experience * 0.25
    )
  );

  return {
    overall,
    italiana,
    goriziana,
    tuttiDoppi,
    form,
    morale,
    chemistry,
  };
}

function getFormationWarnings(
  selectedPlayers: Player[]
) {
  const warnings: string[] = [];

  selectedPlayers.forEach(
    (player) => {
      const fullName =
        `${player.firstName} ${player.lastName}`;

      if (player.form <= 4) {
        warnings.push(
          `${fullName} ha una forma bassa (${player.form}/10).`
        );
      }

      if (player.morale <= 4) {
        warnings.push(
          `${fullName} ha un morale basso (${player.morale}/10).`
        );
      }
    }
  );

  return warnings;
}

function getRecommendedFormation(
  roster: Player[]
): Formation {
  if (roster.length < 3) {
    return {
      A: null,
      B: null,
      C: null,
    };
  }

  let bestFormation: Formation = {
    A: roster[0].id,
    B: roster[1].id,
    C: roster[2].id,
  };

  let bestScore =
    Number.NEGATIVE_INFINITY;

  for (const playerA of roster) {
    for (const playerB of roster) {
      if (
        playerB.id === playerA.id
      ) {
        continue;
      }

      for (
        const playerC of roster
      ) {
        if (
          playerC.id ===
            playerA.id ||
          playerC.id ===
            playerB.id
        ) {
          continue;
        }

        const score =
          calculateSlotScore(
            playerA,
            "A"
          ) +
          calculateSlotScore(
            playerB,
            "B"
          ) +
          calculateSlotScore(
            playerC,
            "C"
          );

        if (
          score > bestScore
        ) {
          bestScore = score;

          bestFormation = {
            A: playerA.id,
            B: playerB.id,
            C: playerC.id,
          };
        }
      }
    }
  }

  return bestFormation;
}

function calculateSlotScore(
  player: Player,
  slot: SlotKey
) {
  const conditionBonus =
    player.form * 2 +
    player.morale +
    player.experience * 0.25;

  if (slot === "A") {
    return (
      player.specialties
        .italiana *
        2 +
      player.specialties
        .goriziana +
      player.specialties
        .tuttiDoppi +
      player.overall +
      conditionBonus
    );
  }

  if (slot === "B") {
    return (
      player.specialties
        .goriziana *
        2 +
      player.specialties
        .italiana +
      player.specialties
        .tuttiDoppi +
      player.overall +
      conditionBonus
    );
  }

  return (
    player.specialties
      .tuttiDoppi *
      2 +
    player.specialties
      .italiana +
    player.specialties
      .goriziana +
    player.overall +
    conditionBonus
  );
}

function average(
  values: number[]
) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce(
      (total, value) =>
        total + value,
      0
    ) / values.length
  );
}

function formatSavedDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}
