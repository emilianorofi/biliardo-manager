import AttributeBar from "../components/ui/AttributeBar";
import OverallBadge from "../components/ui/OverallBadge";

export default function TestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-10">
      <div className="w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 shadow-2xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Francesco Galli
            </h1>

            <p className="mt-2 text-zinc-400">
              🇮🇹 Italia • 29 anni
            </p>
          </div>

          <OverallBadge value={84} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <AttributeBar label="Precisione" value={92} />
          <AttributeBar label="Difesa" value={65} />

          <AttributeBar label="Diretto" value={84} />
          <AttributeBar label="Realizzazione" value={89} />

          <AttributeBar label="Sponde" value={78} />
          <AttributeBar label="Creatività" value={72} />

          <AttributeBar label="Tattica" value={88} />
          <AttributeBar label="Misura" value={93} />

          <AttributeBar label="Mentalità" value={82} />
        </div>
      </div>
    </main>
  );
}