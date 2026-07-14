"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [managerName, setManagerName] = useState("Emiliano Rofi");
  const [language, setLanguage] = useState("Italiano");
  const [dateFormat, setDateFormat] = useState("GG/MM/AAAA");
  const [confirmActions, setConfirmActions] = useState(true);

  const [matchNotifications, setMatchNotifications] = useState(true);
  const [trainingNotifications, setTrainingNotifications] = useState(true);
  const [transferNotifications, setTransferNotifications] = useState(true);
  const [academyNotifications, setAcademyNotifications] = useState(true);

  const [saved, setSaved] = useState(false);

  function saveSettings() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Page heading */}
        <div>
          <p className="text-sm font-medium text-yellow-400">
            Preferenze
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Impostazioni
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Gestisci il tuo profilo e le preferenze di Biliardo Manager
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profilo manager */}
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
                👤
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Profilo manager
                </h2>

                <p className="text-sm text-zinc-500">
                  Informazioni del tuo account
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Nome manager
                </label>

                <input
                  type="text"
                  value={managerName}
                  onChange={(event) => setManagerName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Lingua
                </label>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/50"
                >
                  <option>Italiano</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </section>

          {/* Preferenze gioco */}
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
                🎱
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Preferenze di gioco
                </h2>

                <p className="text-sm text-zinc-500">
                  Personalizza la tua esperienza
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Formato data
                </label>

                <select
                  value={dateFormat}
                  onChange={(event) => setDateFormat(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/50"
                >
                  <option>GG/MM/AAAA</option>
                  <option>MM/GG/AAAA</option>
                  <option>AAAA/MM/GG</option>
                </select>
              </div>

              <ToggleRow
                title="Conferma azioni importanti"
                description="Richiedi conferma prima di promozioni, offerte e altre operazioni importanti"
                enabled={confirmActions}
                onChange={setConfirmActions}
              />
            </div>
          </section>

          {/* Notifiche */}
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
                🔔
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Notifiche
                </h2>

                <p className="text-sm text-zinc-500">
                  Scegli quali aggiornamenti ricevere
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ToggleRow
                title="Partite"
                description="Promemoria e risultati delle partite"
                enabled={matchNotifications}
                onChange={setMatchNotifications}
              />

              <ToggleRow
                title="Allenamento"
                description="Aggiornamenti della sessione settimanale"
                enabled={trainingNotifications}
                onChange={setTrainingNotifications}
              />

              <ToggleRow
                title="Trasferimenti"
                description="Offerte superate e aste in scadenza"
                enabled={transferNotifications}
                onChange={setTransferNotifications}
              />

              <ToggleRow
                title="Accademia"
                description="Nuove caratteristiche e giovani promuovibili"
                enabled={academyNotifications}
                onChange={setAcademyNotifications}
              />
            </div>
          </section>

          {/* Aspetto */}
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
                ◐
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Aspetto
                </h2>

                <p className="text-sm text-zinc-500">
                  Tema dell&apos;interfaccia
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-yellow-400/30 bg-yellow-400/[0.05] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">
                    Tema scuro
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Tema predefinito di Biliardo Manager
                  </p>
                </div>

                <div className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black">
                  ATTIVO
                </div>
              </div>
            </div>
          </section>

          {/* Informazioni gioco */}
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
                ℹ
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Biliardo Manager
                </h2>

                <p className="text-sm text-zinc-500">
                  Informazioni sul gioco
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <InfoRow label="Versione" value="0.1.0 Alpha" />
              <InfoRow label="Modalità" value="Career Mode" />
              <InfoRow label="Squadra" value="Accademia Biliardo Pontedera" />
              <InfoRow label="Stagione" value="2025/26" />
            </div>
          </section>
        </div>

        {/* Save area */}
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/10 bg-[#141414] p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-white">
              Salva le modifiche
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Applica le nuove preferenze al tuo profilo
            </p>
          </div>

          <div className="flex items-center gap-4">
            {saved && (
              <p className="text-sm font-semibold text-green-400">
                Impostazioni salvate ✓
              </p>
            )}

            <button
              type="button"
              onClick={saveSettings}
              className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Salva impostazioni
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
      <div>
        <p className="font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-zinc-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-yellow-400" : "bg-zinc-700"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-white">
        {value}
      </span>
    </div>
  );
}