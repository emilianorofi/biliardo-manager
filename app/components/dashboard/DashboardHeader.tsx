export default function DashboardHeader() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-7">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Biliardo Manager
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Accademia Biliardo Pontedera
          </h1>

          <div className="mt-4 flex items-center gap-6 text-sm text-zinc-400">

            <span>🏆 Prima Squadra</span>

            <span>Stagione 1</span>

            <span>Giornata 5</span>

          </div>

        </div>

        <div className="rounded-xl bg-green-600/15 px-6 py-4 text-right">

          <div className="text-xs uppercase tracking-wider text-green-400">
            Prossima partita
          </div>

          <div className="mt-2 text-2xl font-bold text-white">
            Balalaika Pisa
          </div>

          <div className="mt-1 text-sm text-zinc-400">
            Mercoledì • 21:00
          </div>

        </div>

      </div>

    </div>
  );
}