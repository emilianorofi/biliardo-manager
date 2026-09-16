import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Medal,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import {
  getSpecialtyCupAssignment,
  type SpecialtyCupType,
} from "@/lib/specialty-cup-assignment";
import {
  SPECIALTY_CUP_NAME,
  SPECIALTY_CUP_SEASON_WEEK,
} from "@/lib/specialty-cup-calendar";
import { prisma } from "@/lib/prisma";
import { ROME_TIME_ZONE } from "@/lib/rome-calendar";

export const dynamic = "force-dynamic";

type CupConfig = {
  type: SpecialtyCupType;
  name: string;
  specialty: string;
};

type DrawSlot = {
  position: number;
  playerId: number;
  firstName: string;
  lastName: string;
  nationality: string;
  bye: boolean;
};

type DrawStage = {
  order: number;
  key: string;
  label: string;
  playersAtStart: number;
  scheduledAt: string;
};

type DrawGame = {
  order: number;
  specialty: string;
  winnerPlayerId: number;
  playerOneScore: number;
  playerTwoScore: number;
};

type DrawMatch = {
  position: number;
  playerOneId: number | null;
  playerTwoId: number | null;
  winnerPlayerId: number | null;
  playerOneWins: number;
  playerTwoWins: number;
  walkover: boolean;
  games: DrawGame[];
};

type DrawRound = {
  stageOrder: number;
  stageKey: string;
  stageLabel: string;
  scheduledAt: string;
  matches: DrawMatch[];
};

type CupDraw = {
  type: SpecialtyCupType;
  name: string;
  entrants: number;
  bracketSize: number;
  byes: number;
  firstRoundMatches: number;
  slots: DrawSlot[];
  stages: DrawStage[];
  currentStageIndex: number;
  currentPlayerIds: Array<number | null>;
  rounds: DrawRound[];
  championPlayerId: number | null;
};

type SpecialtyCupPayload = {
  seasonId: number;
  drawnAt: string;
  cups: Record<SpecialtyCupType, CupDraw>;
};

const cups: CupConfig[] = [
  { type: "ITALIANA", name: "Coppa Italiana", specialty: "Italiana" },
  { type: "GORIZIANA", name: "Coppa Goriziana", specialty: "Goriziana" },
  { type: "TUTTI_DOPPI", name: "Coppa Tutti Doppi", specialty: "Tutti Doppi" },
];

export default async function SpecialtyCupPage() {
  const [players, tournamentRows] = await Promise.all([
    prisma.player.findMany({
      where: {
        careerStatus: "ACTIVE",
        clubId: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationality: true,
        precisione: true,
        diretto: true,
        sponde: true,
      },
    }),
    prisma.$queryRaw<
      Array<{
        status: string;
        drawAt: Date;
        drawnAt: Date | null;
        nextStageAt: Date | null;
        payload: SpecialtyCupPayload | null;
      }>
    >`
      SELECT "status", "drawAt", "drawnAt", "nextStageAt", "payload"
      FROM "SpecialtyCupTournament"
      ORDER BY "seasonId" DESC
      LIMIT 1
    `,
  ]);

  const tournament = tournamentRows[0] ?? null;
  const payload = tournament?.payload ?? null;
  const playerNames = new Map(
    players.map((player) => [player.id, `${player.firstName} ${player.lastName}`])
  );

  const counts: Record<SpecialtyCupType, number> = {
    ITALIANA: 0,
    GORIZIANA: 0,
    TUTTI_DOPPI: 0,
  };

  for (const player of players) {
    const assignment = getSpecialtyCupAssignment({
      id: player.id,
      specialties: {
        italiana: (player.precisione + player.diretto) / 2,
        goriziana: (player.precisione + player.sponde) / 2,
        tuttiDoppi: (player.diretto + player.sponde) / 2,
      },
      attributes: {
        precisione: player.precisione,
        diretto: player.diretto,
        sponde: player.sponde,
      },
    });
    counts[assignment] += 1;
  }

  return (
    <main className="space-y-5 text-zinc-100">
      <header className="rounded-3xl border border-amber-400/20 bg-[linear-gradient(135deg,#312816_0%,#263018_58%,#101d18_100%)] p-6">
        <div className="flex items-center gap-2 text-amber-300">
          <Medal size={17} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Settimana {SPECIALTY_CUP_SEASON_WEEK}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-black text-white">{SPECIALTY_CUP_NAME}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Tre tornei a eliminazione diretta, uno per specialità. Ogni giocatore
          partecipa alla coppa legata al suo valore di specialità migliore nella
          stagione corrente.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          <Metric icon={<Trophy size={16} />} label="Coppe" value="3" />
          <Metric icon={<CalendarDays size={16} />} label="Settimana" value="14" />
          <Metric icon={<Users size={16} />} label="Iscritti" value={String(players.length)} />
          <Metric
            icon={tournament?.status === "COMPLETED" ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
            label="Stato"
            value={statusLabel(tournament?.status)}
          />
        </div>

        {tournament && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-400">
            <span>Sorteggio: {formatDateTime(tournament.drawAt)}</span>
            {tournament.nextStageAt && <span>Prossimo turno: {formatDateTime(tournament.nextStageAt)}</span>}
          </div>
        )}
      </header>

      {!payload ? (
        <section className="grid gap-4 xl:grid-cols-3">
          {cups.map((cup) => (
            <article key={cup.type} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center gap-2 text-amber-300">
                <Target size={15} />
                <span className="text-[9px] font-black uppercase tracking-[0.18em]">{cup.specialty}</span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white">{cup.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">In attesa del sorteggio.</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-amber-300">{counts[cup.type]}</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">iscritti previsti</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="space-y-6">
          {cups.map((config) => (
            <CupSection
              key={config.type}
              config={config}
              cup={payload.cups[config.type]}
              playerNames={playerNames}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function CupSection({
  config,
  cup,
  playerNames,
}: {
  config: CupConfig;
  cup: CupDraw;
  playerNames: Map<number, string>;
}) {
  const championName = cup.championPlayerId
    ? playerNames.get(cup.championPlayerId) ?? `Giocatore #${cup.championPlayerId}`
    : null;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70">
      <div className="border-b border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-300">
              <Target size={15} />
              <span className="text-[9px] font-black uppercase tracking-[0.18em]">{config.specialty}</span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-white">{config.name}</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
            <Badge>{cup.entrants} iscritti</Badge>
            <Badge>{cup.bracketSize} posti</Badge>
            <Badge>{cup.byes} bye</Badge>
          </div>
        </div>

        {championName && (
          <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">Campione</p>
            <p className="mt-1 text-xl font-black text-white">🏆 {championName}</p>
          </div>
        )}
      </div>

      <div className="space-y-5 p-4 md:p-5">
        {cup.rounds.length === 0 && <FirstRoundDraw cup={cup} />}

        {cup.rounds.map((round) => (
          <RoundBlock key={`${config.type}-${round.stageOrder}`} round={round} playerNames={playerNames} />
        ))}

        {cup.currentStageIndex < cup.stages.length && cup.rounds.length > 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">Prossimo turno</p>
            <p className="mt-1 font-black text-white">{cup.stages[cup.currentStageIndex].label}</p>
            <p className="mt-1 text-xs text-zinc-500">{formatDateTime(new Date(cup.stages[cup.currentStageIndex].scheduledAt))}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FirstRoundDraw({ cup }: { cup: CupDraw }) {
  const pairs = Array.from({ length: cup.bracketSize / 2 }, (_, index) => {
    const positionOne = index * 2 + 1;
    const positionTwo = positionOne + 1;
    const one = cup.slots.find((slot) => slot.position === positionOne) ?? null;
    const two = cup.slots.find((slot) => slot.position === positionTwo) ?? null;
    return { position: index + 1, one, two };
  });

  return (
    <div>
      <RoundTitle label={cup.stages[0]?.label ?? "Primo turno"} date={cup.stages[0]?.scheduledAt} />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {pairs.map((pair) => (
          <div key={pair.position} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <PlayerLine slot={pair.one} />
            <div className="my-2 border-t border-zinc-800" />
            <PlayerLine slot={pair.two} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundBlock({ round, playerNames }: { round: DrawRound; playerNames: Map<number, string> }) {
  return (
    <div>
      <RoundTitle label={round.stageLabel} date={round.scheduledAt} />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {round.matches.map((match) => {
          const one = match.playerOneId ? playerNames.get(match.playerOneId) ?? `Giocatore #${match.playerOneId}` : "BYE";
          const two = match.playerTwoId ? playerNames.get(match.playerTwoId) ?? `Giocatore #${match.playerTwoId}` : "BYE";
          return (
            <article key={match.position} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className={match.winnerPlayerId === match.playerOneId ? "font-black text-white" : "font-bold text-zinc-400"}>{one}</p>
                <span className="font-black text-amber-300">{match.playerOneWins}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className={match.winnerPlayerId === match.playerTwoId ? "font-black text-white" : "font-bold text-zinc-400"}>{two}</p>
                <span className="font-black text-amber-300">{match.playerTwoWins}</span>
              </div>

              {match.walkover ? (
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-600">Passaggio con bye</p>
              ) : (
                <div className="mt-3 space-y-1 border-t border-zinc-800 pt-2">
                  {match.games.map((game) => (
                    <div key={game.order} className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Manche {game.order}</span>
                      <span className="font-bold text-zinc-300">{game.playerOneScore}–{game.playerTwoScore}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PlayerLine({ slot }: { slot: DrawSlot | null }) {
  if (!slot) {
    return <p className="text-xs font-black uppercase tracking-wider text-zinc-700">BYE</p>;
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-sm font-black text-white">{slot.firstName} {slot.lastName}</p>
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{slot.nationality}</p>
      </div>
      {slot.bye && <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase text-amber-300">bye</span>}
    </div>
  );
}

function RoundTitle({ label, date }: { label: string; date?: string }) {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
      <h3 className="font-black text-white">{label}</h3>
      {date && <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{formatDateTime(new Date(date))}</p>}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-zinc-700 bg-black/20 px-2.5 py-1 text-zinc-400">{children}</span>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-3">
      <div className="flex items-center gap-2 text-amber-300">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function statusLabel(status?: string) {
  if (status === "SCHEDULED") return "Da sorteggiare";
  if (status === "DRAWN") return "Sorteggiata";
  if (status === "IN_PROGRESS") return "In corso";
  if (status === "COMPLETED") return "Conclusa";
  return "In preparazione";
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
