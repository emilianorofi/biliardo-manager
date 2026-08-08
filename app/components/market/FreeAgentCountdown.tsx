"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MINUTE_IN_MILLISECONDS = 60 * 1000;
const MINUTES_IN_DAY = 24 * 60;

interface FreeAgentCountdownProps {
  expiresAt: string;
}

export default function FreeAgentCountdown({
  expiresAt,
}: FreeAgentCountdownProps) {
  const router = useRouter();
  const hasRefreshed = useRef(false);
  const [timeRemaining, setTimeRemaining] =
    useState<string | null>(null);

  useEffect(() => {
    function updateCountdown() {
      const remainingMilliseconds =
        new Date(expiresAt).getTime() - Date.now();

      if (remainingMilliseconds <= 0) {
        setTimeRemaining("Scaduto");

        if (!hasRefreshed.current) {
          hasRefreshed.current = true;
          router.refresh();
        }

        return;
      }

      const remainingMinutes = Math.ceil(
        remainingMilliseconds /
          MINUTE_IN_MILLISECONDS
      );
      const days = Math.floor(
        remainingMinutes / MINUTES_IN_DAY
      );
      const hours = Math.floor(
        (remainingMinutes % MINUTES_IN_DAY) / 60
      );
      const minutes = remainingMinutes % 60;

      setTimeRemaining(
        `${days}g ${hours}h ${minutes}m`
      );
    }

    updateCountdown();

    const intervalId = window.setInterval(
      updateCountdown,
      MINUTE_IN_MILLISECONDS
    );

    return () => window.clearInterval(intervalId);
  }, [expiresAt, router]);

  return timeRemaining ?? "Calcolo...";
}
