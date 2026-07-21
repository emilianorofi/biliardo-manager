type Props = {
  experience: number;
  form: number;
  morale: number;
};

function valueColor(value: number) {
  if (value >= 90) return "text-emerald-400";
  if (value >= 80) return "text-green-400";
  if (value >= 70) return "text-lime-400";
  if (value >= 60) return "text-yellow-400";
  if (value >= 50) return "text-orange-400";
  return "text-red-400";
}

export default function PlayerStatus({
  experience,
  form,
  morale,
}: Props) {
  return (
    <div className="mt-3 flex items-center gap-8">

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          ESP
        </span>

        <span className={`text-lg font-bold ${valueColor(experience)}`}>
          {experience}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          FOR
        </span>

        <span className={`text-lg font-bold ${valueColor(form * 10)}`}>
          {form}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          MOR
        </span>

        <span className={`text-lg font-bold ${valueColor(morale * 10)}`}>
          {morale}
        </span>
      </div>

    </div>
  );
}