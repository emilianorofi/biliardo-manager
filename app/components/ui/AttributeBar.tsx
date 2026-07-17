interface AttributeBarProps {
  label: string;
  value: number;
}

export default function AttributeBar({
  label,
  value,
}: AttributeBarProps) {
  const width = `${value}%`;

  let color = "bg-red-500";

  if (value >= 90) color = "bg-emerald-500";
  else if (value >= 80) color = "bg-green-500";
  else if (value >= 70) color = "bg-lime-500";
  else if (value >= 60) color = "bg-yellow-500";
  else if (value >= 50) color = "bg-orange-500";

  return (
    <div className="space-y-1">

      <div className="flex justify-between text-sm">

        <span className="text-zinc-300">
          {label}
        </span>

        <span className="font-semibold text-white">
          {value}
        </span>

      </div>

      <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">

        <div
          className={`h-full ${color} transition-all duration-700`}
          style={{ width }}
        />

      </div>

    </div>
  );
}