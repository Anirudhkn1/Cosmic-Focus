import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Rocket, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JourneyTrack } from "@/components/cosmic/JourneyTrack";
import { DiscoveryPopup } from "@/components/cosmic/DiscoveryPopup";
import { useLiveSession } from "@/hooks/useLiveSession";
import {
  finishSession,
  registerArrival,
  pauseSession,
  resumeSession,
  startSession,
  type FinishResult,
} from "@/hooks/useMission";
import {
  FOCUS_METHODS,
  flowtimeBreakMinutes,
  formatClock,
  formatFocusTime,
  getMethod,
  type FocusMethodId,
} from "@/lib/cosmic/config";
import { cue } from "@/lib/cosmic/sound";
import { cn } from "@/lib/utils";
import BlurText from "@/components/BlurText";

export const Route = createFileRoute("/_authenticated/focus")({
  head: () => ({
    meta: [
      { title: "Flight Deck — Cosmic Focus" },
      {
        name: "description",
        content:
          "Run Pomodoro, 52/17, 90-minute or Flowtime focus sessions that continuously propel your spacecraft between worlds.",
      },
      { property: "og:title", content: "Flight Deck — Cosmic Focus" },
      {
        property: "og:description",
        content: "Focus sessions that continuously propel your spacecraft between worlds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FocusPage,
});

function FocusPage() {
  const {
    mission,
    session,
    elapsedSeconds,
    segmentElapsedSeconds,
    remainingSeconds,
    progress,
    running,
    paused,
    required,
  } = useLiveSession();
  const { profile, currentObject, destination, currentSegment, segments, objectById, userId, refresh } =
    mission;

  const [methodId, setMethodId] = useState<FocusMethodId>("pomodoro");
  const [manualMinutes, setManualMinutes] = useState(30);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [discoveredId, setDiscoveredId] = useState<string | null>(null);
  const [breakEndsAt, setBreakEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const finishing = useRef(false);
  const arriving = useRef(false);
  const handledSegments = useRef<Set<string>>(new Set());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);

  const soundOn = profile?.sound_enabled ?? true;
  const beepOn = profile?.break_beep_enabled ?? true;
  const method = getMethod(session?.method ?? methodId);

  const handleFinish = async (endedEarly: boolean) => {
    if (!session || !profile || finishing.current) return;
    finishing.current = true;
    try {
      const res = await finishSession({
        session,
        segments,
        segment: currentSegment,
        startingProgress: Number(session.starting_progress),
        elapsedSeconds,
        segmentElapsedSeconds,
        endedEarly,
        userId,
        profile: {
          xp: profile.xp,
          level: profile.level,
          total_focus_minutes: Number(profile.total_focus_minutes),
          completed_sessions: profile.completed_sessions,
          current_streak: profile.current_streak,
          longest_streak: profile.longest_streak,
          last_focus_date: profile.last_focus_date,
        },
      });
      await refresh();
      setResult(res);
      if (res.reachedDestination && res.discoveredObjectId) {
        setDiscoveredId(res.discoveredObjectId);
      } else {
        cue.beep(beepOn);
      }
      if (res.leveledUpTo) {
        toast.success(`Promoted to level ${res.leveledUpTo} — ${res.newRank}`);
      }
      const sessionMethod = getMethod(session.method);
      const breakMin =
        sessionMethod.id === "flowtime"
          ? flowtimeBreakMinutes(res.focusedMinutes)
          : sessionMethod.breakMinutes;
      if (breakMin && !endedEarly) setBreakEndsAt(Date.now() + breakMin * 60_000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not close the session");
    } finally {
      finishing.current = false;
    }
  };

  // Arrival (non-blocking) + planned-duration completion detection.
  useEffect(() => {
    if (!session || session.status !== "running" || finishing.current) return;

    const arrived = required > 0 && progress >= 1 && currentSegment !== null;
    if (arrived && currentSegment && !arriving.current && !handledSegments.current.has(currentSegment.id)) {
      arriving.current = true;
      handledSegments.current.add(currentSegment.id);
      void (async () => {
        try {
          const res = await registerArrival({
            session,
            segments,
            segment: currentSegment,
            userId,
          });
          await refresh();
          setDiscoveredId(res.discoveredObjectId);
        } catch (err) {
          handledSegments.current.delete(currentSegment.id);
          toast.error(err instanceof Error ? err.message : "Could not register the arrival");
        } finally {
          arriving.current = false;
        }
      })();
      return;
    }

    const timeUp = remainingSeconds !== null && remainingSeconds <= 0;
    if (timeUp) void handleFinish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.status, progress, remainingSeconds, required, currentSegment?.id]);

  const launch = async () => {
    if (!profile) return;
    const m = getMethod(methodId);
    const planned = m.id === "manual" ? Math.max(1, Math.round(manualMinutes)) : m.focusMinutes;
    setResult(null);
    setBreakEndsAt(null);
    await startSession({
      userId,
      method: m.id,
      plannedMinutes: planned,
      segmentId: currentSegment?.id ?? null,
      startingProgress: mission.storedProgress,
    });
    cue.launch(soundOn);
    await refresh();
  };

  const breakRemaining = breakEndsAt ? Math.max(0, (breakEndsAt - now) / 1000) : null;
  useEffect(() => {
    if (breakEndsAt !== null && breakRemaining === 0) {
      cue.beep(beepOn);
      setBreakEndsAt(null);
      toast.info("Break complete. Ready for the next burn.");
    }
  }, [breakRemaining, breakEndsAt, beepOn]);

  const discoveredObject = discoveredId ? (objectById.get(discoveredId) ?? null) : null;
  const reportObject = result?.discoveredObjectId
    ? (objectById.get(result.discoveredObjectId) ?? null)
    : null;

  const timerValue =
    remainingSeconds !== null ? formatClock(remainingSeconds) : formatClock(elapsedSeconds);

  return (
    <div className="space-y-6">
      <div>
        <p className="label-tech">Flight deck</p>
        <BlurText
          key={session ? "session-active" : "session-idle"}
          as="h1"
          text={session ? `Burn in progress · ${method.name}` : "Select a focus protocol"}
          delay={60}
          animateBy="words"
          direction="top"
          className="font-display text-3xl font-semibold"
        />
      </div>

      {!session ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FOCUS_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethodId(m.id)}
              className={cn(
                "panel p-5 text-left transition-colors",
                methodId === m.id ? "border-primary shadow-glow" : "hover:border-primary/50",
              )}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">{m.name}</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {m.focusMinutes ? `${m.focusMinutes}m` : "open"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">Best for: {m.bestFor}</p>
            </button>
          ))}
        </section>
      ) : null}

      {!session && methodId === "manual" ? (
        <div className="panel max-w-xs space-y-2 p-5">
          <Label htmlFor="minutes">Custom duration (minutes)</Label>
          <Input
            id="minutes"
            type="number"
            min={1}
            max={600}
            value={manualMinutes}
            onChange={(e) => setManualMinutes(Number(e.target.value))}
          />
        </div>
      ) : null}

      <section className="panel p-5 sm:p-6">
        <div className="text-center">
          <p className="label-tech">
            {remainingSeconds !== null ? "Time remaining" : "Elapsed focus"}
          </p>
          <div className="mt-2 font-mono text-6xl font-semibold tabular-nums sm:text-7xl">
            {timerValue}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {destination
              ? `${formatFocusTime(Math.max(0, (1 - progress) * required))} of focus to reach ${destination.name}`
              : "Final destination reached — the Oort Cloud is behind you."}
          </p>
        </div>

        <JourneyTrack
          originName={currentObject?.name ?? "Sun"}
          originImage={currentObject?.image_url ?? null}
          originId={currentObject?.id}
          destinationName={destination?.name ?? "Oort Cloud"}
          destinationImage={destination?.image_url ?? null}
          destinationId={destination?.id}
          progress={progress}
          moving={running === true}
        />

        <div className="flex flex-wrap justify-center gap-3">
          {!session ? (
            <Button size="lg" onClick={launch}>
              <Rocket className="mr-2 h-4 w-4" /> Ignite thrusters
            </Button>
          ) : (
            <>
              {running ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={async () => {
                    await pauseSession(session);
                    await refresh();
                  }}
                >
                  <Pause className="mr-2 h-4 w-4" /> Pause burn
                </Button>
              ) : null}
              {paused ? (
                <Button
                  size="lg"
                  onClick={async () => {
                    await resumeSession(session);
                    await refresh();
                  }}
                >
                  <Play className="mr-2 h-4 w-4" /> Resume burn
                </Button>
              ) : null}
              <Button size="lg" variant="destructive" onClick={() => void handleFinish(true)}>
                <Square className="mr-2 h-4 w-4" /> End session
              </Button>
            </>
          )}
        </div>
      </section>

      {breakRemaining !== null && breakRemaining > 0 ? (
        <section className="panel p-5 text-center">
          <p className="label-tech">Recovery break</p>
          <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">
            {formatClock(breakRemaining)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Thrusters cold. Your spacecraft holds position until the next burn.
          </p>
          <Button variant="secondary" className="mt-3" onClick={() => setBreakEndsAt(null)}>
            Skip break
          </Button>
        </section>
      ) : null}

      {result ? (
        <section className="panel animate-arrival p-5">
          <p className="label-tech">Session report</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <div className="font-display text-2xl font-semibold">
                {formatFocusTime(result.focusedMinutes)}
              </div>
              <div className="text-xs text-muted-foreground">Focused time</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold">+{result.xpEarned} XP</div>
              <div className="text-xs text-muted-foreground">Experience earned</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold">
                {result.reachedDestination ? "Arrived" : "In transit"}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.reachedDestination && reportObject
                  ? `${reportObject.name} discovered`
                  : "Position saved"}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <DiscoveryPopup object={discoveredObject} onDismiss={() => setDiscoveredId(null)} />
    </div>
  );
}
