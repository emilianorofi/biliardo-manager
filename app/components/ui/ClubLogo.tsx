interface ClubLogoProps {
  name: string;
  shortName?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-24 w-24 text-3xl",
};

export default function ClubLogo({
  name,
  shortName,
  color = "#10b981",
  size = "lg",
}: ClubLogoProps) {
  const initials =
    shortName ??
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full border-4 font-bold text-white shadow-lg`}
      style={{
        backgroundColor: color,
        borderColor: color,
      }}
    >
      {initials}
    </div>
  );
}