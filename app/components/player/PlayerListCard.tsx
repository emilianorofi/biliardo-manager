import Link from "next/link";

import type { Player } from "../../types/player";

type Props = {
  player: Player;
};

const attributes: {
  key: keyof Player["attributes"];
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

export default function PlayerListCard({
  player,
}: Props) {
  const fullName =
    `${player.firstName} ${player.lastName}`;

  const initials =
    `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;

  return (
    <Link
      href={`/players/${player.id}`}
      className="group block"
    >
      <article className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#15261f] transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:shadow-xl hover:shadow-black/20">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_220px]">
          <section className="border-b border-emerald-900/60 p-5 xl:border-b-0 xl:border-r">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-xl font-black text-[#122018]">
                {initials}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-black text-white">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {player.nationality} · {player.age} anni
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {player.style.map((style) => (
                    <span
                      key={style}
                      className="rounded-full border border-emerald-800/70 bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-200"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Status
                label="Forma"
                value={`${player.form}/10`}
              />

              <Status
                label="Morale"
                value={`${player.morale}/10`}
              />

              <Status
                label="Esperienza"
                value={player.experience}
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-emerald-900/50 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Valore
                </p>

                <p className="mt-1 font-black text-amber-300">
                  {formatCurrency(player.value)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Stipendio
                </p>

                <p className="mt-1 font-bold text-white">
                  {formatCurrency(player.salary)}
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-emerald-900/60 p-5 xl:border-b-0 xl:border-r">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Caratteristiche
            </p>

            <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-3">
              {attributes.map((attribute) => {
                const value =
                  player.attributes[attribute.key];

                return (
                  <div key={attribute.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-300">
                        {attribute.label}
                      </span>

                      <span
                        className={`text-sm font-black ${getValueClass(
                          value
                        )}`}
                      >
                        {value}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{
                          width: `${value}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col justify-between p-5">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Overall
              </p>

              <div className="mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-400/10 text-4xl font-black text-amber-300">
                {player.overall}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Speciality
                label="Italiana"
                value={player.specialties.italiana}
              />

              <Speciality
                label="Goriziana"
                value={player.specialties.goriziana}
              />

              <Speciality
                label="Tutti Doppi"
                value={player.specialties.tuttiDoppi}
              />
            </div>
          </section>
        </div>
      </article>
    </Link>
  );
}

function Status({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/35 p-2.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function Speciality({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-emerald-950/40 px-3 py-2">
      <span className="text-xs font-semibold text-slate-300">
        {label}
      </span>

      <span
        className={`font-black ${getValueClass(value)}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getValueClass(value: number) {
  if (value >= 90) return "text-amber-300";
  if (value >= 80) return "text-emerald-300";
  if (value >= 70) return "text-sky-300";

  return "text-slate-300";
}