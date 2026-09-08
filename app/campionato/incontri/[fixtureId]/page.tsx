import {
  Activity,
  ArrowLeft,
  CircleDot,
  Medal,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createLeagueTable } from "@/lib/league-table";
import { prisma } from "@/lib/prisma";
import { ROME_TIME_ZONE } from "@/lib/rome-calendar";

export const dynamic = "force-dynamic";

type LeagueFixtureDetailPageProps = {
  params: Promise<{
    fixtureId: string;
  }>;
};

export default async function LeagueFixtureDetailPage({
  params,
}: LeagueFixtureDetailPageProps) {
  const fixtureId = Number.parseInt((await params).fixtureId, 10);

  if (!Number.isInteger(fixtureId)) notFound();

  const fixture = await prisma.leagueFixture.findFirst({
    where: {
      id: fixtureId,
      league: {
        season: {
          status: {
            in: ["PREPARATION", "ACTIVE", "COMPLETED"],
          },
        },
      },
    },
    include: {
      homeClub: {
        select: {
          id: true,
          name: true,
          shortName: true,
          city: true,
        },
      },
      awayClub: {
        select: {
          id: true,
          name: true,
          shortName: true,
          city: true,
        },
      },
      league: {
        include: {
          season: {
            select: {
              name: true,
            },
          },
          entries: {
            include: {
              club: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      games: {
        orderBy: {
          order: "asc",
        },
        include: {
          playerPerformances: {
            include: {
              appearance: true,
            },
          },
        },
      },
      playerAppearances: {
        orderBy: [{ side: "asc" }, { formationSlot: "asc" }],
        include: {
          gamePerformances: {
            select: {
              result: true,
            },
          },
        },
      },
    },
  });

  if (!fixture) notFound();

  const isPlayed = fixture.status === "PLAYED";
  const hasDetailedReport =
    fixture.games.length === 6 && fixture.playerAppearances.length === 6;
  const homeScore = fixture.homeScore ?? 0;
  const awayScore = fixture.awayScore ?? 0;
  const table = createLeagueTable(
    fixture.league.entries.map((entry) => ({
      clubId: entry.clubId,
      clubName: entry.club.name,
      played: entry.played,
      won: entry.won,
      drawn: entry.drawn,
      lost: entry.lost,
      pointsFor: entry.pointsFor,
      pointsAgainst: entry.pointsAgainst,
      points: entry.points,
    }))
  );
  const homePosition = table.find(
    (entry) => entry.clubId === fixture.homeClubId
  );
  const awayPosition = table.find(
    (entry) => entry.clubId === fixture.awayClubId
  );
  const homeFormation = fixture.playerAppearances.filter(
    (appearance) => appearance.side === "HOME"
  );
  const awayFormation = fixture.playerAppearances.filter(
    (appearance) => appearance.side === "AWAY"
  );
  const mvp = [...fixture.playerAppearances].sort(
    (first, second) =>
      countWins(second) - countWins(first) ||
      second.performanceRating - first.performanceRating
  )[0];
  const story = buildFixtureStory({
    homeName: fixture.homeClub.name,
    awayName: fixture.awayClub.name,
    homeScore,
    awayScore,
    games: fixture.games,
  });
  const hasReconstructedScores = fixture.games.some(
    (game) => game.reconstructed
  );

  return (
    <main className="space-y-4 text-zinc-100">
      <Link
        href={`/campionato?league=${fixture.leagueId}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-amber-300"
      >
        <ArrowLeft size={15} />
        Torna al campionato
      </Link>

      <header className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[linear-gradient(135deg,#293127_0%,#16271f_60%,#101d18_100%)] px-5 py-5">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                {fixture.league.name} · Giornata {fixture.round}
              </p>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Il referto dell&apos;incontro
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {fixture.league.season.name} · {formatDateTime(fixture.playedAt ?? fixture.scheduledAt)}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                {isPlayed ? "Risultato finale" : "Incontro programmato"}
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {isPlayed ? `${homeScore}–${awayScore}` : "VS"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
            <ClubHeading
              name={fixture.homeClub.name}
              shortName={fixture.homeClub.shortName}
              city={fixture.homeClub.city}
              position={homePosition?.position}
            />
            <p className="text-center text-xs font-black uppercase tracking-wider text-zinc-600">
              contro
            </p>
            <ClubHeading
              name={fixture.awayClub.name}
              shortName={fixture.awayClub.shortName}
              city={fixture.awayClub.city}
              position={awayPosition?.position}
              align="right"
            />
          </div>
        </div>
      </header>

      {!isPlayed ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center">
          <CircleDot className="mx-auto text-emerald-400" size={28} />
          <h2 className="mt-3 text-xl font-black text-white">
            Il referto sarà disponibile dopo l&apos;incontro
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Le sei prove, le formazioni e i protagonisti verranno registrati al termine della simulazione.
          </p>
        </section>
      ) : !hasDetailedReport ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center">
          <Trophy className="mx-auto text-amber-300" size={28} />
          <h2 className="mt-3 text-xl font-black text-white">
            Risultato storico: {homeScore}–{awayScore}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Questo incontro è stato giocato prima dell&apos;introduzione del referto dettagliato. Il risultato complessivo resta disponibile, mentre formazioni e singole prove non erano ancora archiviate.
          </p>
        </section>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <h2 className="text-lg font-black text-white">
                  La storia dell&apos;incontro
                </h2>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Tre passaggi per seguire come è cambiato il confronto tra le due squadre.
              </p>
            </div>

            <div className="grid divide-y divide-zinc-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {story.map((passage, index) => (
                <article key={passage.title} className="p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">
                    Passaggio {index + 1} · {passage.score}
                  </p>
                  <h3 className="mt-1 text-base font-black text-white">
                    {passage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {passage.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <CircleDot size={18} className="text-amber-300" />
                  <h2 className="text-lg font-black text-white">Le sei prove</h2>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Specialità, giocatori impiegati e punteggio completo.
                </p>
              </div>
              <p className="text-xs font-black text-zinc-400">
                {fixture.homeClub.shortName} {homeScore}–{awayScore} {fixture.awayClub.shortName}
              </p>
            </div>

            <div className="divide-y divide-zinc-800">
              {fixture.games.map((game) => {
                const homePlayers = game.playerPerformances
                  .filter((performance) => performance.appearance.side === "HOME")
                  .map((performance) => performance.appearance);
                const awayPlayers = game.playerPerformances
                  .filter((performance) => performance.appearance.side === "AWAY")
                  .map((performance) => performance.appearance);

                return (
                  <article
                    key={game.id}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[130px_minmax(0,1fr)_110px_minmax(0,1fr)] md:items-center"
                  >
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                        Prova {game.order} · {game.gameType === "SINGLES" ? "Singolo" : "Coppia"}
                      </p>
                      <p className="mt-1 text-sm font-black text-emerald-300">
                        {formatSpecialty(game.specialty)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">
                        Traguardo {game.targetPoints}
                      </p>
                    </div>

                    <PlayersLine
                      players={homePlayers}
                      won={game.winnerSide === "HOME"}
                    />

                    <div className="order-first text-center md:order-none">
                      <p className="text-2xl font-black text-white">
                        <span className={game.winnerSide === "HOME" ? "text-amber-300" : ""}>
                          {game.homePoints}
                        </span>
                        <span className="px-2 text-zinc-600">–</span>
                        <span className={game.winnerSide === "AWAY" ? "text-amber-300" : ""}>
                          {game.awayPoints}
                        </span>
                      </p>
                    </div>

                    <PlayersLine
                      players={awayPlayers}
                      won={game.winnerSide === "AWAY"}
                      align="right"
                    />
                  </article>
                );
              })}
            </div>

            {hasReconstructedScores && (
              <p className="border-t border-zinc-800 bg-zinc-950/30 px-4 py-3 text-[10px] leading-5 text-zinc-600">
                I punteggi in birilli delle prove più vecchie sono ricostruiti dal risultato registrato; i nuovi incontri conservano il punteggio originale della simulazione.
              </p>
            )}
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <UsersRound size={18} className="text-emerald-400" />
                  <h2 className="text-lg font-black text-white">Le formazioni</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 md:divide-x md:divide-zinc-800">
                <FormationList
                  clubName={fixture.homeClub.name}
                  appearances={homeFormation}
                />
                <FormationList
                  clubName={fixture.awayClub.name}
                  appearances={awayFormation}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-amber-400/20 bg-[linear-gradient(145deg,#2b2b20_0%,#171c18_75%)] p-5">
              <div className="flex items-center gap-2 text-amber-300">
                <Medal size={20} />
                <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                  Protagonista
                </p>
              </div>
              {mvp ? (
                <>
                  <Link
                    href={mvp.playerId ? `/players/${mvp.playerId}` : "#"}
                    className="mt-3 block text-xl font-black text-white transition hover:text-amber-200"
                  >
                    {mvp.playerFirstName} {mvp.playerLastName}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">
                    {mvp.clubName} · slot {mvp.formationSlot}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Stat label="Prove vinte" value={`${countWins(mvp)}/3`} />
                    <Stat label="Rendimento" value={formatRating(mvp.performanceRating)} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    È il giocatore che ha inciso con maggiore continuità nel risultato complessivo dell&apos;incontro.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  I dati del protagonista non sono disponibili.
                </p>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-emerald-900/60 bg-[#15261f] p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Trophy size={22} className="text-amber-300" />
                <div>
                  <p className="text-sm font-black text-white">Effetto sulla classifica</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Posizioni attuali dopo gli incontri già disputati.
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-emerald-300">
                {fixture.homeClub.shortName} {formatPosition(homePosition?.position)} · {fixture.awayClub.shortName} {formatPosition(awayPosition?.position)}
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

type PlayerIdentity = {
  playerId: number | null;
  playerFirstName: string;
  playerLastName: string;
  side: string;
  formationSlot: string;
};

type Appearance = PlayerIdentity & {
  clubName: string;
  overall: number;
  form: number;
  morale: number;
  performanceRating: number;
  gamePerformances: Array<{
    result: string;
  }>;
};

function ClubHeading({
  name,
  shortName,
  city,
  position,
  align = "left",
}: {
  name: string;
  shortName: string;
  city: string;
  position?: number;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-lg font-black text-white sm:text-2xl">{name}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {city} · {shortName} · {formatPosition(position)} in classifica
      </p>
    </div>
  );
}

function PlayersLine({
  players,
  won,
  align = "left",
}: {
  players: PlayerIdentity[];
  won: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className={`text-sm font-black ${won ? "text-amber-300" : "text-zinc-200"}`}>
        {players.map((player, index) => (
          <span key={`${player.side}-${player.formationSlot}`}>
            {index > 0 && <span className="text-zinc-600"> · </span>}
            {player.playerId ? (
              <Link
                href={`/players/${player.playerId}`}
                className="transition hover:text-amber-200"
              >
                {player.playerFirstName} {player.playerLastName}
              </Link>
            ) : (
              `${player.playerFirstName} ${player.playerLastName}`
            )}
          </span>
        ))}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
        {players.map((player) => `Slot ${player.formationSlot}`).join(" + ")}
      </p>
    </div>
  );
}

function FormationList({
  clubName,
  appearances,
}: {
  clubName: string;
  appearances: Appearance[];
}) {
  return (
    <div className="p-4">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
        {clubName}
      </p>
      <div className="mt-3 space-y-2">
        {appearances.map((appearance) => (
          <div
            key={`${appearance.side}-${appearance.formationSlot}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/25 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-black text-emerald-300">
                {appearance.formationSlot}
              </span>
              <div className="min-w-0">
                {appearance.playerId ? (
                  <Link
                    href={`/players/${appearance.playerId}`}
                    className="block truncate text-sm font-black text-white transition hover:text-amber-200"
                  >
                    {appearance.playerFirstName} {appearance.playerLastName}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-black text-white">
                    {appearance.playerFirstName} {appearance.playerLastName}
                  </p>
                )}
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  Forma {appearance.form}/10 · Morale {appearance.morale}/10
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-amber-300">
                OVR {Math.round(appearance.overall)}
              </p>
              <p className="mt-0.5 text-[9px] text-zinc-600">
                {countWins(appearance)} vittorie
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black text-amber-300">{value}</p>
    </div>
  );
}

type StoryGame = {
  order: number;
  specialty: string;
  winnerSide: string;
};

function buildFixtureStory({
  homeName,
  awayName,
  homeScore,
  awayScore,
  games,
}: {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  games: StoryGame[];
}) {
  const scoreAfter = (count: number) => {
    const played = games.slice(0, count);
    return {
      home: played.filter((game) => game.winnerSide === "HOME").length,
      away: played.filter((game) => game.winnerSide === "AWAY").length,
    };
  };
  const opening = scoreAfter(2);
  const middle = scoreAfter(4);
  const finalWinner = homeScore === awayScore ? null : homeScore > awayScore ? "HOME" : "AWAY";
  const winningName = finalWinner === "HOME" ? homeName : awayName;
  const losingName = finalWinner === "HOME" ? awayName : homeName;
  const decisiveGame = finalWinner
    ? [...games].reverse().find((game) => game.winnerSide === finalWinner)
    : games.at(-1);

  return [
    {
      title: "L'avvio",
      score: `${opening.home}–${opening.away}`,
      text:
        opening.home === opening.away
          ? `${homeName} e ${awayName} si dividono le prime due prove. Nessuno prende subito il comando: l'incontro nasce in equilibrio.`
          : `${opening.home > opening.away ? homeName : awayName} parte meglio e conquista entrambe le prove iniziali. L'altra formazione è costretta a inseguire già dal primo cambio di specialità.`,
    },
    {
      title: "Il centro dell'incontro",
      score: `${middle.home}–${middle.away}`,
      text:
        middle.home === middle.away
          ? `Dopo Italiana e Goriziana il conto torna in parità. Le formazioni arrivano alle due prove di Tutti Doppi sapendo che il margine di errore si è quasi esaurito.`
          : `${middle.home > middle.away ? homeName : awayName} conserva il vantaggio dopo le prove di Goriziana. ${middle.home > middle.away ? awayName : homeName} deve cambiare il finale nelle due sfide di Tutti Doppi.`,
    },
    {
      title: homeScore === awayScore ? "Nessun padrone" : "La prova decisiva",
      score: `${homeScore}–${awayScore}`,
      text:
        finalWinner && decisiveGame
          ? `${winningName} trova nella prova ${decisiveGame.order}, a ${formatSpecialty(decisiveGame.specialty)}, il punto che mette al sicuro il risultato. ${losingName} resta dentro l'incontro fino al finale, ma il ${homeScore}–${awayScore} premia la squadra più concreta nei passaggi decisivi.`
          : `Le ultime due prove non spezzano l'equilibrio. Il ${homeScore}–${awayScore} racconta un incontro senza un vero padrone, nel quale ogni tentativo di fuga trova una risposta.`,
    },
  ];
}

function countWins(appearance: Appearance) {
  return appearance.gamePerformances.filter(
    (performance) => performance.result === "WIN"
  ).length;
}

function formatSpecialty(specialty: string) {
  switch (specialty) {
    case "ITALIANA":
      return "Italiana";
    case "GORIZIANA":
      return "Goriziana";
    case "TUTTI_DOPPI":
      return "Tutti Doppi";
    default:
      return specialty;
  }
}

function formatPosition(position?: number) {
  return position ? `${position}ª` : "–";
}

function formatRating(rating: number) {
  return rating.toLocaleString("it-IT", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ROME_TIME_ZONE,
  }).format(date);
}
