import PlayerListCard from "@/app/components/player/PlayerListCard";
import type { Player } from "@/app/types/player";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const databasePlayers = await prisma.player.findMany({
    where: {
      clubId: 1,
    },
    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });

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

  return (
    <main className="space-y-7">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            Prima squadra
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Rosa giocatori
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Controlla caratteristiche, stato e specialità
            dei giocatori della tua squadra.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
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
      </header>

      <section className="space-y-4">
        {players.map((player) => (
          <PlayerListCard
            key={player.id}
            player={player}
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
    <div className="min-w-28 rounded-2xl border border-emerald-900/60 bg-[#183129] px-4 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-black ${
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