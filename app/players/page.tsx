import PlayerListCard from "@/app/components/player/PlayerListCard";
import type { Player } from "@/app/types/player";
import { getCurrentClubId } from "@/lib/current-club";
import { buildGlobalPlayerRanking } from "@/lib/player-ranking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const clubId = await getCurrentClubId();
  const [club, rankablePlayers] = await Promise.all([
    prisma.club.findUnique({
      where: {
        id: clubId,
      },
      include: {
        players: {
          orderBy: [
            {
              lastName: "asc",
            },
            {
              firstName: "asc",
            },
          ],
          include: {
            fixtureAppearances: {
              orderBy: {
                playedAt: "desc",
              },
              take: 1,
              select: {
                playedAt: true,
                opponentClubName: true,
                teamScore: true,
                opponentScore: true,
                formationSlot: true,
                performanceRating: true,
              },
            },
          },
        },
      },
    }),
    prisma.player.findMany({
      where: {
        careerStatus: "ACTIVE",
      },
      select: {
        id: true,
        precisione: true,
        diretto: true,
        sponde: true,
        tattica: true,
        mentalita: true,
        difesa: true,
        realizzazione: true,
        creativita: true,
        misura: true,
      },
    }),
  ]);

  if (!club) {
    throw new Error("Club principale non disponibile.");
  }

  const databasePlayers = club.players;
  const globalRanking = buildGlobalPlayerRanking(rankablePlayers);

  const players: Player[] = databasePlayers.map(
    (player) => {
      const attributes = {
        precisione: Math.round(player.precisione),
        diretto: Math.round(player.diretto),
        sponde: Math.round(player.sponde),
        tattica: Math.round(player.tattica),
        mentalita: Math.round(player.mentalita),
        difesa: Math.round(player.difesa),
        realizzazione: Math.round(
          player.realizzazione
        ),
        creativita: Math.round(player.creativita),
        misura: Math.round(player.misura),
      };

      return {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        nationality: player.nationality,
        age: player.age,

        overall: calculateOverall(attributes),

        form: player.form,
        morale: player.morale,
        experience: Math.round(player.experience),

        value: player.value,
        salary: player.salary,

        image: player.image,
        style: player.style,

        specialties: {
          italiana: Math.round(
            (attributes.precisione +
              attributes.diretto) /
              2
          ),
          goriziana: Math.round(
            (attributes.precisione +
              attributes.sponde) /
              2
          ),
          tuttiDoppi: Math.round(
            (attributes.diretto +
              attributes.sponde) /
              2
          ),
        },

        attributes,
      };
    }
  );

  const averageAge =
    players.length > 0
      ? Math.round(
          players.reduce(
            (total, player) => total + player.age,
            0
          ) / players.length
        )
      : 0;

  const averageOverall =
    players.length > 0
      ? Math.round(
          players.reduce(
            (total, player) =>
              total + player.overall,
            0
          ) / players.length
        )
      : 0;

  const latestPerformances = new Map(
    databasePlayers.map((player) => {
      const performance = player.fixtureAppearances[0];

      return [
        player.id,
        performance
          ? {
              playedAt: performance.playedAt.toISOString(),
              opponentClubName: performance.opponentClubName,
              teamScore: performance.teamScore,
              opponentScore: performance.opponentScore,
              formationSlot: performance.formationSlot,
              performanceRating: performance.performanceRating,
            }
          : null,
      ] as const;
    })
  );

  return (
    <main className="space-y-3">
      <header className="relative overflow-hidden rounded-2xl border border-emerald-900/60 bg-[linear-gradient(135deg,#183129_0%,#12231d_68%,#101e19_100%)] px-4 py-3 shadow-xl shadow-black/10 sm:px-5">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${club.primaryColor}, ${club.secondaryColor})`,
          }}
        />

        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: club.secondaryColor }}
        />

        <div className="relative flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              Prima squadra
            </p>

            <h1 className="text-2xl font-black text-white">
              Rosa giocatori
            </h1>

            <p className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-400">
              Tutti i dati tecnici e l&apos;ultima prestazione dei
              giocatori in un unico elenco.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <TeamStat
              label="Giocatori"
              value={players.length}
            />

            <TeamStat
              label="Età media"
              value={averageAge}
            />

            <TeamStat
              label="Overall medio"
              value={averageOverall}
              highlight
            />
          </div>
        </div>
      </header>

      <section className="space-y-2">
        {players.map((player) => (
          <PlayerListCard
            key={player.id}
            player={player}
            clubColors={{
              primary: club.primaryColor,
              secondary: club.secondaryColor,
            }}
            latestPerformance={
              latestPerformances.get(player.id) ?? null
            }
            globalRanking={globalRanking.get(player.id)?.position ?? null}
          />
        ))}

        {players.length === 0 && (
          <div className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-10 text-center">
            <p className="font-bold text-white">
              Nessun giocatore presente
            </p>

            <p className="mt-2 text-sm text-slate-500">
              La rosa del club è ancora vuota.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function TeamStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-20 rounded-lg border border-emerald-900/60 bg-[#183129] px-2.5 py-1.5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
        {label}
      </p>

      <p
        className={`text-lg font-black ${
          highlight
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function calculateOverall(
  attributes: Player["attributes"]
) {
  const values = Object.values(attributes);

  return Math.round(
    values.reduce(
      (total, value) => total + value,
      0
    ) / values.length
  );
}
