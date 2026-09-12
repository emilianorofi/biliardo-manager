"use client";

import type { Player } from "@/app/types/player";
import Link from "next/link";
import PlayerPortrait from "@/app/components/player/PlayerPortrait";

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
    <article className="overflow-hidden rounded-2xl border border-emerald-900/70 bg-[#16271f] shadow-lg shadow-black/10">
      <div className="flex items-center gap-3 border-b border-emerald-900/60 p-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-[#122018]">
          {slot}
        </div>

        <select
          value={currentValue ?? ""}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Giocatore per lo slot ${slot}`}
          className="min-w-0 flex-1 rounded-xl border border-emerald-800 bg-[#10231c] px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-amber-400"
        >
          <option value="">Seleziona giocatore</option>

          {players.map((availablePlayer) => {
            const disabled =
              selectedIds.includes(availablePlayer.id) &&
              availablePlayer.id !== currentValue;

            return (
              <option
                key={availablePlayer.id}
                value={availablePlayer.id}
                disabled={disabled}
              >
                {availablePlayer.firstName} {availablePlayer.lastName}
                {disabled ? " • già schierato" : ""}
              </option>
            );
          })}
        </select>

        <div className="w-11 shrink-0 text-center">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">
            Ovr
          </p>

          <p className="mt-0.5 text-xl font-black text-amber-300">
            {player?.overall ?? "--"}
          </p>
        </div>
      </div>

      {player ? (
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl bg-[#10231c] p-3">
            <Link href={`/players/${player.id}`} aria-label={`Apri la scheda di ${player.firstName} ${player.lastName}`}>
              <PlayerPortrait player={player} className="h-20 w-16 shrink-0" />
            </Link>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-black text-white">
                <Link href={`/players/${player.id}`} className="transition hover:text-amber-200 hover:underline">
                  {player.firstName} {player.lastName}
                </Link>
              </h3>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {player.nationality} · {player.age} anni
              </p>
            </div>

            <div className="flex gap-4 text-center">
              <CompactStat label="Forma" value={`${player.form}/10`} />
              <CompactStat label="Morale" value={`${player.morale}/10`} />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Speciality name="Italiana" value={player.specialties.italiana} />
            <Speciality name="Goriziana" value={player.specialties.goriziana} />
            <Speciality name="Tutti doppi" value={player.specialties.tuttiDoppi} />
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-900/45 bg-black/10 px-3 py-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Esperienza
            </span>

            <span className="text-xs font-black text-slate-300">
              {player.experience}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex h-[9.6rem] items-center justify-center rounded-xl border border-dashed border-emerald-900/80 bg-black/10 px-4 text-center text-sm text-slate-500">
            Scegli un giocatore per lo slot {slot}
          </div>
        </div>
      )}
    </article>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-black text-slate-300">{value}</p>
    </div>
  );
}

function Speciality({ name, value }: { name: string; value: number }) {
  return (
    <div className="rounded-xl border border-emerald-900/45 bg-emerald-950/45 px-2 py-2.5 text-center">
      <p className="text-base font-black text-white">{value}</p>

      <p className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-wide text-emerald-300/70">
        {name}
      </p>
    </div>
  );
}
