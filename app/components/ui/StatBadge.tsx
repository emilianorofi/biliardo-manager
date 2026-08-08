import { ReactNode } from "react";
import clsx from "clsx";

type StatBadgeProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "yellow" | "green" | "blue" | "red" | "gray";
  className?: string;
};

export default function StatBadge({
  label,
  value,
  icon,
  color = "gray",
  className,
}: StatBadgeProps) {
  const colors = {
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    gray: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  return (
    <div
      className={clsx(
        "flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2",
        colors[color],
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {icon}
        <span className="truncate text-xs font-medium">{label}</span>
      </div>

      <span className="shrink-0 text-sm font-bold">
        {value}
      </span>
    </div>
  );
}
