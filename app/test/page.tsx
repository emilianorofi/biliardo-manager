import OverallBadge from "../components/ui/OverallBadge";
import AttributeBar from "../components/ui/AttributeBar";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-10">
      <div className="w-full max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 shadow-2xl">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold text-white">
              Francesco Galli
            </h1>

            <p className="text-zinc-400 mt-2">
              🇮🇹 Italia • 29 anni
            </p>

          </div>

          <OverallBadge overall={84} />

        </div>

        <div className="grid grid-cols-2 gap-6">

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