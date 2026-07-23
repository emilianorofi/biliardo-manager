interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "green" | "red" | "yellow" | "blue" | "purple";
  height?: "sm" | "md" | "lg";
  showValue?: boolean;
  animated?: boolean;
}

const colors = {
  green: "bg-emerald-500",
  red: "bg-red-500",
  yellow: "bg-amber-500",
  blue: "bg-sky-500",
  purple: "bg-violet-500",
};

const heights = {
  sm: "h-2",
  md: "h-3",
  lg: "h-5",
};

export default function ProgressBar({
  value,
  max = 100,
  color = "green",
  height = "md",
  showValue = false,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {showValue && (
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-400">Valore</span>
          <span className="font-semibold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className={`overflow-hidden rounded-full bg-zinc-700 ${heights[height]}`}
      >
        <div
          className={`${colors[color]} ${
            animated ? "transition-all duration-500" : ""
          } h-full rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}