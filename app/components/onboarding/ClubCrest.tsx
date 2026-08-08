import {
  Crown,
  Gem,
  Shield,
  Star,
  Target,
} from "lucide-react";

import type { ClubCrestStyle } from "@/lib/onboarding/club-rules";

const CREST_ICONS = {
  CLASSIC: Shield,
  DIAMOND: Gem,
  CROWN: Crown,
  STAR: Star,
  PINS: Target,
} satisfies Record<ClubCrestStyle, typeof Shield>;

export default function ClubCrest({
  style,
  primaryColor,
  secondaryColor,
  size = "large",
}: {
  style: ClubCrestStyle;
  primaryColor: string;
  secondaryColor: string;
  size?: "small" | "large";
}) {
  const Icon = CREST_ICONS[style];
  const isLarge = size === "large";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border-2 shadow-lg ${
        isLarge
          ? "h-24 w-24 rounded-[2rem]"
          : "h-14 w-14 rounded-2xl"
      }`}
      style={{
        backgroundColor: primaryColor,
        borderColor: secondaryColor,
        color: secondaryColor,
      }}
    >
      <span
        className="absolute -right-5 -top-7 h-16 w-16 rotate-45 opacity-20"
        style={{ backgroundColor: secondaryColor }}
      />
      <Icon size={isLarge ? 42 : 25} strokeWidth={2.2} />
    </span>
  );
}
