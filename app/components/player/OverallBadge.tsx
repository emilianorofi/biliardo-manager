type Props = {
  value: number;
};

function ringColor(value: number) {
  if (value >= 90) return "#34d399";
  if (value >= 80) return "#22c55e";
  if (value >= 70) return "#84cc16";
  if (value >= 60) return "#facc15";
  if (value >= 50) return "#fb923c";
  return "#f87171";
}

export default function OverallBadge({ value }: Props) {
  const circumference = 251.2;
  const offset = circumference - (circumference * value) / 100;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">

      <svg
        className="-rotate-90"
        width="96"
        height="96"
        viewBox="0 0 96 96"
      >
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="#3f3f46"
          strokeWidth="7"
          fill="none"
        />

        <circle
          cx="48"
          cy="48"
          r="40"
          stroke={ringColor(value)}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <span className="text-4xl font-black leading-none text-white">
          {value}
        </span>

        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          OVR
        </span>

      </div>

    </div>
  );
}