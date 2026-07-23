"use client";

import type { Player } from "@/app/types/player";

interface FormationSlotProps {
  slot: "A" | "B" | "C";
  player?: Player;
  currentValue: number | null;
  selectedIds: number[];
  players: Player[];
  onChange: (value: string) => void;
}

export default function FormationSlot({
  slot,
  player,
  currentValue,
  selectedIds,
  players,
  onChange,
}: FormationSlotProps) {
  return (
    <div className="rounded-2xl border border-emerald-900 bg-[#16271f] shadow-lg">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-emerald-900 px-5 py-4">

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            Slot
          </p>

          <h2 className="text-3xl font-black text-amber-300">
            {slot}
          </h2>
        </div>

        {player && (
          <div className="text-right">
            <p className="text-xs uppercase text-slate-400">
              Overall
            </p>

            <p className="text-3xl font-black text-white">
              {player.overall}
            </p>
          </div>
        )}

      </div>

      {/* Select */}

      <div className="p-5">

        <select
          value={currentValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-emerald-800 bg-[#10231c] px-4 py-3 font-semibold text-white outline-none transition focus:border-amber-400"
        >
          <option value="">
            Seleziona giocatore
          </option>

          {players.map((p) => {

            const disabled =
              selectedIds.includes(p.id) &&
              p.id !== currentValue;

            return (
              <option
                key={p.id}
                value={p.id}
                disabled={disabled}
              >
                {p.firstName} {p.lastName}
                {disabled ? " • già schierato" : ""}
              </option>
            );
          })}
        </select>

      </div>

      {/* Giocatore */}

      {player ? (
        <div className="px-5 pb-5">

          <div className="rounded-2xl bg-[#10231c] p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 text-2xl font-black text-[#122018]">

                {player.firstName.charAt(0)}
                {player.lastName.charAt(0)}

              </div>

              <div>

                <h3 className="text-xl font-black text-white">
                  {player.firstName} {player.lastName}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {player.nationality}
                </p>

                <p className="text-sm text-slate-400">
                  {player.age} anni
                </p>

              </div>

            </div>

            {/* Statistiche */}

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Stat
                label="Forma"
                value={`${player.form}/10`}
              />

              <Stat
                label="Morale"
                value={`${player.morale}/10`}
              />

              <Stat
                label="Esperienza"
                value={player.experience}
              />

              <Stat
                label="Valore"
                value={`€ ${player.value.toLocaleString()}`}
              />

            </div>

            {/* Specialità */}

            <div className="mt-6 border-t border-emerald-900 pt-5">

              <p className="mb-3 text-xs uppercase tracking-widest text-emerald-400">
                Specialità
              </p>

              <div className="space-y-2">

                <Speciality
                  name="Italiana"
                  value={player.specialties.italiana}
                />

                <Speciality
                  name="Goriziana"
                  value={player.specialties.goriziana}
                />

                <Speciality
                  name="Tutti Doppi"
                  value={player.specialties.tuttiDoppi}
                />

              </div>

            </div>

          </div>

        </div>

      ) : (

        <div className="px-5 pb-5">

          <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-900 text-center text-slate-500">

            Nessun giocatore selezionato

          </div>

        </div>

      )}

    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-emerald-950/60 p-3">

      <p className="text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white">
        {value}
      </p>

    </div>
  );
}

function Speciality({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  return (
    <div>

      <div className="mb-1 flex justify-between text-sm">

        <span className="text-slate-300">
          {name}
        </span>

        <span className="font-bold text-white">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
          style={{ width: `${value}%` }}
        />

      </div>

    </div>
  );
}