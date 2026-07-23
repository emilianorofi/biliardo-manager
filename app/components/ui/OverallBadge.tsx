"use client";

interface OverallBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

export default function OverallBadge({
  value,
  size = "md",
}: OverallBadgeProps) {
  const color =
    value >= 90
      ? "bg-purple-600"
      : value >= 80
      ? "bg-green-600"
      : value >= 70
      ? "bg-yellow-500"
      : value >= 60
      ? "bg-orange-500"
      : "bg-red-600";

  const dimensions = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <div
      className={`
        ${color}
        ${dimensions[size]}
        rounded-full
        flex
        items-center
        justify-center
        font-extrabold
        text-white
        shadow-lg
        border-4
        border-white/10
      `}
    >
      {value}
    </div>
  );
}