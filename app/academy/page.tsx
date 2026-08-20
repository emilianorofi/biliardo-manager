"use client";

import { useEffect, useState } from "react";

import type {
  AcademyAttributeValue,
  AcademyAttributes,
  AcademyPlayer,
} from "@/app/types/academyPlayer";

const characteristics: {
  key: keyof AcademyAttributes;
  label: string;
}[] = [
  { key: "precisione", label: "Precisione" },
  { key: "diretto", label: "Diretto" },
  { key: "sponde", label: "Sponde" },
  { key: "tattica", label: "Tattica" },
  { key: "mentalita", label: "Mentalità" },
  { key: "difesa", label: "Difesa" },
  { key: "realizzazione", label: "Realizzazione" },
  { key: "creativita", label: "Creatività" },
  { key: "misura", label: "Misura" },
];

type AcademyActionResponse = {
  message?: string;
  error?: string;
  player?: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

export default function AcademyPage() {
  const [players, setPlayers] =
    useState<AcademyPlayer[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [promotingPlayerId, setPromotingPlayerId] =
    useState<number | null>(null);

  const [dismissingPlayerId, setDismissingPlayerId] =
    useState<number | null>(null);

  const [youthCoachLevel, setYouthCoachLevel] = useState(1);
  const [scoutingRangeWidth, setScoutingRangeWidth] = useState(16);
  const [academyCapacity, setAcademyCapacity] = useState(10);
  const [nextAcademyCandidateAt, setNextAcademyCandidateAt] =
    useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadAcademyPlayers() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/academy", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Impossibile caricare i giovani dell'Accademia."
          );
        }

        const data: {
          players: AcademyPlayer[];
          youthCoachLevel: number;
          scoutingRangeWidth: number;
          academyCapacity: number;
          nextAcademyCandidateAt: string | null;
        } = await response.json();

        if (!isCancelled) {
          setPlayers(data.players);
          setYouthCoachLevel(data.youthCoachLevel);
          setScoutingRangeWidth(data.scoutingRangeWidth);
          setAcademyCapacity(data.academyCapacity);
          setNextAcademyCandidateAt(
            data.nextAcademyCandidateAt
          );
        }
      } catch (loadError: unknown) {
        if (isCancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Errore durante il caricamento dell'Accademia."
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAcademyPlayers();

    return () => {
      isCancelled = true;
    };
  }, []);

  const promotablePlayers = players.filter(
    (player) => player.age >= 16
  ).length;
  const decisionPlayers = players.filter(
    (player) => player.decisionRequired
  ).length;

  const totalScoutingSteps = players.reduce(
    (total, player) =>
      total + player.estimatedAttributes + player.revealedAttributes,
    0
  );

  const totalCharacteristics = players.reduce(
    (total, player) =>
      total + player.totalAttributes,
    0
  );

  const scoutingProgress =
    totalCharacteristics > 0
      ? Math.round(
          (totalScoutingSteps /
            (totalCharacteristics * 2)) *
            100
        )
      : 0;

  async function promotePlayer(playerId: number) {
    const player = players.find(
      (item) => item.id === playerId
    );

    if (!player || player.age < 16) {
      return;
    }

    const confirmed = window.confirm(
      `Vuoi promuovere ${player.firstName} ${player.lastName} in prima squadra?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPromotingPlayerId(playerId);
      setActionError(null);

      const response = await fetch("/api/academy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
        }),
      });

      const data: AcademyActionResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Impossibile completare la promozione."
        );
      }

      setPlayers((currentPlayers) =>
        currentPlayers.filter(
          (item) => item.id !== playerId
        )
      );

      window.alert(
        data.message ??
          `${player.firstName} ${player.lastName} è stato promosso in prima squadra.`
      );
    } catch (promotionError: unknown) {
      setActionError(
        promotionError instanceof Error
          ? promotionError.message
          : "Errore durante la promozione."
      );
    } finally {
      setPromotingPlayerId(null);
    }
  }

  async function dismissPlayer(playerId: number) {
    const player = players.find(
      (item) => item.id === playerId
    );

    if (!player) {
      return;
    }

    const confirmed = window.confirm(
      player.decisionRequired
        ? `Vuoi allontanare ${player.firstName} ${player.lastName}? A 17 anni devi promuoverlo o liberare il posto prima della fine della prossima stagione.`
        : `Vuoi allontanare ${player.firstName} ${player.lastName} dall'Accademia?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDismissingPlayerId(playerId);
      setActionError(null);

      const response = await fetch("/api/academy", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
        }),
      });
      const data: AcademyActionResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Impossibile allontanare il giovane."
        );
      }

      setPlayers((currentPlayers) =>
        currentPlayers.filter(
          (item) => item.id !== playerId
        )
      );

      window.alert(
        data.message ??
          `${player.firstName} ${player.lastName} è stato allontanato dall'Accademia.`
      );
    } catch (dismissalError: unknown) {
      setActionError(
        dismissalError instanceof Error
          ? dismissalError.message
          : "Errore durante l'allontanamento."
      );
    } finally {
      setDismissingPlayerId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="text-white">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
          <p className="text-lg font-semibold">
            Caricamento Accademia...
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
              Settore giovanile
            </p>

            <h1 className="mt-1 text-3xl font-black">
              Accademia
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Osserva le qualità dei tuoi giovani e preparali per la prima squadra.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <HeaderValue label="Capienza" value={`${players.length}/${academyCapacity}`} />
            <HeaderValue label="Età ingresso" value="14–16 anni" />
            <HeaderValue label="Promuovibili" value={promotablePlayers.toString()} highlight />
            <HeaderValue label="Decisioni" value={decisionPlayers.toString()} danger={decisionPlayers > 0} />
            <HeaderValue
              label="Nuovo ingresso"
              value={formatCountdown(nextAcademyCandidateAt, currentTime)}
            />
          </div>
        </div>
      </header>

      {actionError && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm font-semibold text-red-300">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-sm font-bold text-red-300 transition hover:text-white"
            aria-label="Chiudi messaggio di errore"
          >
            ×
          </button>
        </div>
      )}

      {decisionPlayers > 0 && (
        <div className="rounded-xl border border-orange-400/30 bg-orange-400/[0.08] p-3">
          <p className="text-sm font-black text-orange-200">
            {decisionPlayers === 1
              ? "1 giovane richiede una decisione"
              : `${decisionPlayers} giovani richiedono una decisione`}
          </p>
          <p className="mt-1 text-xs text-orange-100/70">
            Promuovili oppure allontanali entro la fine della prossima stagione. A 18 anni saranno rilasciati automaticamente.
          </p>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black">
              Giovani dell&apos;Accademia
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Prima vengono stimate tutte le caratteristiche, poi vengono rivelati i valori reali.
            </p>
          </div>

          <div className="min-w-[220px] rounded-xl border border-yellow-400/20 bg-yellow-400/[0.05] px-3 py-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-zinc-500">Scouting totale</span>
              <span className="text-yellow-400">{scoutingProgress}%</span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-yellow-400" style={{ width: `${scoutingProgress}%` }} />
            </div>

            <p className="mt-1.5 text-[10px] text-zinc-500">
              Allenatore Lv. {youthCoachLevel} · Range {scoutingRangeWidth} punti
            </p>
          </div>
        </div>

        {players.length > 0 ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {players.map((player) => (
              <AcademyPlayerCard
                key={player.id}
                player={player}
                isPromoting={promotingPlayerId === player.id}
                isDismissing={dismissingPlayerId === player.id}
                isActionLocked={promotingPlayerId !== null || dismissingPlayerId !== null}
                onPromote={promotePlayer}
                onDismiss={dismissPlayer}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-white/10 p-8 text-center">
            <p className="font-semibold text-white">Nessun giovane in Accademia</p>
            <p className="mt-1 text-sm text-zinc-500">
              Il prossimo candidato arriverà {formatCountdown(nextAcademyCandidateAt, currentTime)}.
            </p>
          </div>
        )}
      </section>

      <details className="group rounded-xl border border-white/10 bg-[#141414]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:hidden">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-yellow-400">
              Come funziona l&apos;Accademia
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Età, scoperta delle caratteristiche e promozione.
            </p>
          </div>

          <span className="text-sm text-zinc-500 transition group-open:rotate-90">▶</span>
        </summary>

        <div className="grid gap-2 border-t border-white/10 p-4 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <Rule label="Ingresso" value="Ogni mercoledì alle 21:00 arriva un giovane casuale di 14–16 anni, se c'è posto." />
          <Rule label="Capienza" value="L'Accademia contiene al massimo 10 giovani. Se è piena, la candidatura della settimana viene persa." />
          <Rule label="Scouting" value="All'ingresso vedi 3 stime; dopo 105 giorni tutte le 9 caratteristiche sono valori reali." />
          <Rule label="Promozione" value="Dai 16 anni un giovane può entrare nella prima squadra." />
          <Rule label="Decisione" value="A 17 anni devi promuoverlo o allontanarlo. A 18 viene rilasciato automaticamente." />
        </div>
      </details>
    </main>
  );
}

function HeaderValue({
  label,
  value,
  highlight = false,
  danger = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-black/15 px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-xs font-black ${danger ? "text-orange-300" : highlight ? "text-amber-300" : "text-zinc-200"}`}>
        {value}
      </p>
    </div>
  );
}

function AcademyPlayerCard({
  player,
  isPromoting,
  isDismissing,
  isActionLocked,
  onPromote,
  onDismiss,
}: {
  player: AcademyPlayer;
  isPromoting: boolean;
  isDismissing: boolean;
  isActionLocked: boolean;
  onPromote: (playerId: number) => void;
  onDismiss: (playerId: number) => void;
}) {
  const scoutingSteps = player.estimatedAttributes + player.revealedAttributes;
  const progress = Math.round((scoutingSteps / (player.totalAttributes * 2)) * 100);
  const canPromote = player.age >= 16;
  const scoutingLabel =
    player.estimatedAttributes < player.totalAttributes
      ? `Stime ${player.estimatedAttributes}/${player.totalAttributes}`
      : player.revealedAttributes < player.totalAttributes
        ? `Valori reali ${player.revealedAttributes}/${player.totalAttributes}`
        : "Scouting completo";

  return (
    <article className={`rounded-xl border p-3 ${player.decisionRequired ? "border-orange-400/35 bg-orange-400/[0.04]" : canPromote ? "border-yellow-400/25 bg-yellow-400/[0.025]" : "border-white/10 bg-[#101010]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-black text-white">
            {player.firstName} {player.lastName}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {player.nationality} · {player.age} anni
          </p>
        </div>

        <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase ${player.decisionRequired ? "border-orange-400/40 bg-orange-400/10 text-orange-200" : canPromote ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300" : "border-white/10 bg-white/[0.03] text-zinc-500"}`}>
          {player.decisionRequired ? "Decisione" : canPromote ? "Promuovibile" : "In crescita"}
        </span>
      </div>

      {player.decisionRequired && (
        <div className="mt-3 rounded-lg border border-orange-400/20 bg-orange-400/[0.07] px-2.5 py-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-200">
            Scadenza: fine della prossima stagione
          </p>
          <p className="mt-0.5 text-[10px] text-orange-100/60">
            Se resta qui fino ai 18 anni verrà rilasciato automaticamente.
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {characteristics.map((characteristic) => {
          const value = player.attributes[characteristic.key];

          return (
            <div key={characteristic.key} className="rounded-lg border border-white/[0.07] bg-black/20 px-2 py-1.5">
              <p className="truncate text-[8px] font-bold uppercase tracking-wide text-zinc-500">
                {characteristic.label}
              </p>
              <p className={`mt-0.5 text-sm font-black ${getAttributeValueColor(value)}`}>
                {formatAttributeValue(value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold uppercase tracking-wider text-zinc-500">{scoutingLabel}</span>
            <span className="font-black text-yellow-400">
              {progress}%
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-yellow-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDismiss(player.id)}
            disabled={isActionLocked}
            className="rounded-lg border border-red-400/25 px-2.5 py-1.5 text-xs font-black text-red-300 transition hover:border-red-300/50 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDismissing ? "Attendi..." : "Allontana"}
          </button>

          {canPromote ? (
            <button
              type="button"
              onClick={() => onPromote(player.id)}
              disabled={isActionLocked}
              className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPromoting ? "Attendi..." : "Promuovi"}
            </button>
          ) : (
            <span className="pb-0.5 text-[10px] font-semibold text-zinc-600">Dai 16 anni</span>
          )}
        </div>
      </div>
    </article>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-black/15 p-3">
      <p className="font-black text-zinc-200">{label}</p>
      <p className="mt-1 leading-5 text-zinc-500">{value}</p>
    </div>
  );
}

function getAttributeColor(value: number) {
  if (value >= 80) return "text-emerald-400";
  if (value >= 65) return "text-yellow-300";
  return "text-zinc-200";
}

function formatAttributeValue(value: AcademyAttributeValue) {
  if (value === null) return "?";
  if (typeof value === "number") return value.toString();
  return `${value.minimum}–${value.maximum}`;
}

function getAttributeValueColor(value: AcademyAttributeValue) {
  if (value === null) return "text-zinc-600";
  if (typeof value === "number") return getAttributeColor(value);
  return "text-sky-300";
}

function formatCountdown(
  value: string | null,
  currentTime: number
) {
  if (!value) {
    return "da programmare";
  }

  const remainingMilliseconds =
    new Date(value).getTime() - currentTime;

  if (remainingMilliseconds <= 0) {
    return "in arrivo";
  }

  const totalMinutes = Math.ceil(
    remainingMilliseconds / 60_000
  );
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor(
    (totalMinutes % (24 * 60)) / 60
  );
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}g ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
