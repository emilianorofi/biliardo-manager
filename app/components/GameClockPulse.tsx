"use client";

import {
  useEffect,
} from "react";
import {
  useRouter,
} from "next/navigation";

const PULSE_INTERVAL =
  60 * 1000;

export default function GameClockPulse() {
  const router = useRouter();

  useEffect(() => {
    let isCancelled = false;
    let isRunning = false;

    async function pulse() {
      if (isRunning) return;

      isRunning = true;

      try {
        const response = await fetch(
          "/api/game-clock",
          {
            method: "POST",
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data =
          (await response.json()) as {
            processedEvents?: number;
          };

        if (
          !isCancelled &&
          (data.processedEvents ?? 0) > 0
        ) {
          router.refresh();
        }
      } catch {
        // Il recupero verrà ritentato al prossimo impulso.
      } finally {
        isRunning = false;
      }
    }

    void pulse();

    const intervalId =
      window.setInterval(
        pulse,
        PULSE_INTERVAL
      );

    return () => {
      isCancelled = true;
      window.clearInterval(
        intervalId
      );
    };
  }, [router]);

  return null;
}
