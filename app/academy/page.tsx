"use client";

import { useState } from "react";

import { academyPlayers } from "@/app/data/academyPlayers";
import type {
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

export default function AcademyPage() {
  const [players, setPlayers] =
  useState<AcademyPlayer[]>(academyPlayers);

  const promotablePlayers = players.filter(
    (player) => player.age >= 16
  ).length;

  const totalRevealed = players.reduce(
    (total, player) => total + player.revealedAttributes,
    0
  );

  const totalCharacteristics = players.reduce(
    (total, player) => total + player.totalAttributes,
    0
  );

  const scoutingProgress =
    totalCharacteristics > 0
      ? Math.round((totalRevealed / totalCharacteristics) * 100)
      : 0;

  function promotePlayer(playerId: number) {
    const player = players.find((item) => item.id === playerId);

    if (!player || player.age < 16) return;

    const confirmed = window.confirm(
      `Vuoi promuovere ${player.firstName} ${player.lastName} in prima squadra?`
    );

    if (!confirmed) return;

    setPlayers((currentPlayers) =>
      currentPlayers.filter((item) => item.id !== playerId)
    );

    alert(
      `${player.firstName} ${player.lastName} è stato promosso in prima squadra.`
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Page heading */}
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Settore giovanile
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Accademia
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Sviluppa e scopri i giovani talenti di Accademia Biliardo Pontedera
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Giovani
            </p>

            <p className="mt-2 text-3xl font-bold">
              {players.length}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Giocatori in Accademia
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Fascia d&apos;età
            </p>

            <p className="mt-2 text-3xl font-bold">
              14–16
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Anni
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Promuovibili
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {promotablePlayers}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Giocatori di almeno 16 anni
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Prossima rivelazione
            </p>

            <p className="mt-2 text-2xl font-bold">
              Mercoledì
            </p>

            <p className="mt-1 text-sm text-yellow-400">
              Ore 21:00
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
          {/* Players */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  Giovani dell&apos;Accademia
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Ogni settimana viene rivelata una nuova caratteristica reale
                </p>
              </div>

              <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
                {players.length} giocatori
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                      Giocatore
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase text-zinc-500">
                      Età
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase text-zinc-500">
                      Naz.
                    </th>

                    {characteristics.map((characteristic) => (
                      <th
                        key={characteristic.key}
                        className="px-4 py-4 text-xs font-semibold uppercase text-zinc-500"
                      >
                        {characteristic.label}
                      </th>
                    ))}

                    <th className="px-4 py-4 text-xs font-semibold uppercase text-zinc-500">
                      Scoperto
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                      Azione
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {player.firstName} {player.lastName}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Giovane dell&apos;Accademia
                        </p>
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {player.age}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {player.nationality}
                      </td>

                      {characteristics.map((characteristic) => {
                        const value = player.attributes[characteristic.key];

                        return (
                          <td
                            key={characteristic.key}
                            className="px-4 py-4"
                          >
                            {value !== null ? (
                              <span className="font-semibold text-white">
                                {value}
                              </span>
                            ) : (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-bold text-zinc-500">
                                ?
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="px-4 py-4">
                        <div className="min-w-[110px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">
                              {player.revealedAttributes}/{player.totalAttributes}
                            </span>

                            <span className="font-semibold text-yellow-400">
                              {Math.round(
                                (player.revealedAttributes / player.totalAttributes) * 100
                              )}
                              %
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{
                                width: `${
                                  (player.revealedAttributes / player.totalAttributes) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {player.age >= 16 ? (
                          <button
                            type="button"
                            onClick={() => promotePlayer(player.id)}
                            className="whitespace-nowrap rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
                          >
                            Promuovi
                          </button>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-zinc-500">
                            Non disponibile
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {players.length === 0 && (
                <div className="p-10 text-center">
                  <p className="font-semibold text-white">
                    Nessun giovane in Accademia
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    I nuovi talenti appariranno qui.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="space-y-4">
            {/* Scouting */}
            <article className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Scouting
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Conoscenza Accademia
              </h3>

              <div className="mt-5 flex items-end justify-between">
                <p className="text-4xl font-bold text-yellow-400">
                  {scoutingProgress}%
                </p>

                <p className="text-sm text-zinc-500">
                  {totalRevealed}/{totalCharacteristics}
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${scoutingProgress}%` }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Le caratteristiche dei giovani non sono completamente
                conosciute. Ogni settimana una nuova caratteristica reale viene
                rivelata.
              </p>
            </article>

            {/* Academy news */}
            <article className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Cronaca Accademia
              </p>

              <div className="mt-4 space-y-4">
                <div className="border-l-2 border-yellow-400 pl-4">
                  <p className="text-sm font-semibold text-white">
                    Nuova caratteristica rivelata
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Lorenzo Benedetti ha mostrato buone qualità nelle Sponde:
                    valore reale 81.
                  </p>
                </div>

                <div className="border-l-2 border-white/10 pl-4">
                  <p className="text-sm font-semibold text-white">
                    Progressi in allenamento
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Matteo Morelli continua il proprio percorso di crescita
                    nell&apos;Accademia.
                  </p>
                </div>

                <div className="border-l-2 border-white/10 pl-4">
                  <p className="text-sm font-semibold text-white">
                    Promozione disponibile
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Lorenzo Benedetti ha compiuto 16 anni e può essere promosso
                    in prima squadra.
                  </p>
                </div>
              </div>
            </article>

            {/* Rules */}
            <article className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Regole Accademia
              </p>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <p>
                  • Età dei giovani: <strong>14–16 anni</strong>
                </p>

                <p>
                  • Promozione disponibile dai <strong>16 anni</strong>
                </p>

                <p>
                  • Una caratteristica reale viene rivelata progressivamente
                </p>

                <p>
                  • Talento e potenziale rimangono nascosti
                </p>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </main>
  );
}