interface OverallBadgeProps {
  overall: number;
}

export default function OverallBadge({
  overall,
}: OverallBadgeProps) {
  let borderColor = "border-gray-500";
  let textColor = "text-gray-300";

  if (overall >= 90) {
    borderColor = "border-yellow-400";
    textColor = "text-yellow-400";
  } else if (overall >= 80) {
    borderColor = "border-emerald-500";
    textColor = "text-emerald-400";
  } else if (overall >= 70) {
    borderColor = "border-sky-500";
    textColor = "text-sky-400";
  } else if (overall >= 60) {
    borderColor = "border-orange-500";
    textColor = "text-orange-400";
  }

  return (
    <div
      className={`
        w-20 h-20
        rounded-2xl
        border-2
        ${borderColor}
        bg-zinc-900
        flex
        flex-col
        items-center
        justify-center
        shadow-lg
      `}
    >
      <span className="text-xs uppercase text-zinc-500">
        OVR
      </span>

      <span className={`text-3xl font-bold ${textColor}`}>
        {overall}
      </span>
    </div>
  );
}