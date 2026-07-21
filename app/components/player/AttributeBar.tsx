type Props = {
  label: string;
  value: number;
};

function valueColor(value: number) {
  if (value >= 90) return "text-emerald-400";
  if (value >= 80) return "text-green-400";
  if (value >= 70) return "text-lime-400";
  if (value >= 60) return "text-yellow-400";
  if (value >= 50) return "text-orange-400";
  return "text-red-400";
}

function barColor(value: number) {
  if (value >= 90) return "bg-emerald-500";
  if (value >= 80) return "bg-green-500";
  if (value >= 70) return "bg-lime-500";
  if (value >= 60) return "bg-yellow-500";
  if (value >= 50) return "bg-orange-500";
  return "bg-red-500";
}

export default function AttributeBar({ label, value }: Props) {
  return (
    <div className="flex items-center gap-1">

      <div className="w-[76px] text-xs text-zinc-400">
        {label}
      </div>

      <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>

      <div className={`w-7 text-right text-sm font-bold ${valueColor(value)}`}>
        {value}
      </div>

    </div>
  );
}