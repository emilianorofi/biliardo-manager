type Props = {
  italiana: number;
  goriziana: number;
  tuttiDoppi: number;
};

function valueColor(value: number) {
  if (value >= 90) return "text-emerald-400";
  if (value >= 80) return "text-green-400";
  if (value >= 70) return "text-lime-400";
  if (value >= 60) return "text-yellow-400";
  if (value >= 50) return "text-orange-400";
  return "text-red-400";
}

export default function SpecialityScores({
  italiana,
  goriziana,
  tuttiDoppi,
}: Props) {
  return (
    <div className="w-full space-y-4">

      <div className="flex items-center justify-between">

        <span className="text-sm text-zinc-400">
          Italiana
        </span>

        <span className={`text-xl font-bold ${valueColor(italiana)}`}>
          {italiana}
        </span>

      </div>

      <div className="flex items-center justify-between">

        <span className="text-sm text-zinc-400">
          Goriziana
        </span>

        <span className={`text-xl font-bold ${valueColor(goriziana)}`}>
          {goriziana}
        </span>

      </div>

      <div className="flex items-center justify-between">

        <span className="text-sm text-zinc-400">
          Tutti Doppi
        </span>

        <span className={`text-xl font-bold ${valueColor(tuttiDoppi)}`}>
          {tuttiDoppi}
        </span>

      </div>

    </div>
  );
}