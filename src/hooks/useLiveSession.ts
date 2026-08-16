import { useEffect, useState } from "react";
import { useMission, sessionElapsedSeconds } from "@/hooks/useMission";
import { clamp01 } from "@/lib/cosmic/config";

/** Live, refresh-proof view of the running/paused session and rocket position. */
export function useLiveSession() {
  const mission = useMission();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  const session = mission.activeSession;
  const elapsedSeconds = session ? sessionElapsedSeconds(session, now) : 0;
  const required = mission.requiredMinutes;
  const segmentStartElapsed = session ? Number(session.segment_start_elapsed ?? 0) : 0;
  const segmentElapsedSeconds = Math.max(0, elapsedSeconds - segmentStartElapsed);
  const base = session ? Number(session.starting_progress) : mission.storedProgress;
  const progress =
    required > 0
      ? clamp01(base + segmentElapsedSeconds / 60 / required)
      : mission.currentSegment
        ? 0
        : 1;

  const running = session?.status === "running";
  const plannedSeconds = session?.planned_duration ? session.planned_duration * 60 : null;
  const remainingSeconds = plannedSeconds === null ? null : plannedSeconds - elapsedSeconds;

  return {
    mission,
    session,
    elapsedSeconds,
    segmentElapsedSeconds,
    remainingSeconds,
    progress,
    running,
    paused: session?.status === "paused",
    required,
  };
}
