import { notFound } from "next/navigation";
import { players } from "@/lib/mock";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = players.find((p) => p.id === id);

  if (!player) {
    notFound();
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);

  const stats = [
    { label: "Precisione", value: player.precision },
    { label: "Diretto", value: player.direct },
    { label: "Sponde", value: player.banks },
    { label: "Tattica", value: player.tactics },
    { label: "Mentalità", value: player.mentality },
    { label: "Difesa", value: player.defense },
    { label: "Realizzazione", value: player.finishing },
    { label: "Creatività", value: player.creativity },
    { label: "Misura", value: player.touch },
  ];
  const specialties = [
    {
      name: "Italiana",
      value: Math.round((player.precision + player.direct) / 2),
    },
    {
      name: "Goriziana",
      value: Math.round((player.precision + player.banks) / 2),
    },
    {
      name: "Tutti Doppi",
      value: Math.round((player.direct + player.banks) / 2),
    },
  ];

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-yellow-400">
          Scheda giocatore
        </p>

        <h1 className="mt-1 text-3xl font-bold text-zinc-900">
          {player.firstName} {player.lastName}
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Categoria {player.category} • {player.age} anni •{" "}
          {player.nationality}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-yellow-400">
            Overall
          </p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">
            {player.overall}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Forma
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {player.form}/10
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Morale
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {player.morale}/10
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Esperienza
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {player.experience}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">
            Caratteristiche tecniche
          </h2>
          <p className="text-sm text-zinc-400">
            Valori attuali del giocatore
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <span className="text-sm text-zinc-400">
                {stat.label}
              </span>

              <span className="text-lg font-bold text-white">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <h2 className="text-lg font-bold text-white">
            Informazioni
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400">Valore</span>
              <span className="font-semibold text-white">
                {formatMoney(player.marketValue)}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400">Stipendio</span>
              <span className="font-semibold text-white">
                {formatMoney(player.salary)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Contratto</span>
              <span className="font-semibold text-white">
                {player.contractYears} anni
              </span>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
  <h2 className="text-lg font-bold text-white">
    Specialità
  </h2>

  <div className="mt-4 space-y-3">
    {specialties.map((specialty) => (
      <div
        key={specialty.name}
        className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
      >
        <span className="text-zinc-400">{specialty.name}</span>

        <span className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 font-bold text-yellow-400">
          {specialty.value}
        </span>
      </div>
    ))}
  </div>
</section>
      </div>
    </main>
  );
}