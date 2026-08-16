import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  activeSessionQuery,
  catalogQuery,
  discoveriesQuery,
  journeyQuery,
  profileQuery,
  recentSessionsQuery,
  type CelestialObject,
  type FocusSession,
  type JourneySegment,
} from "@/lib/cosmic/api";
import { clamp01, levelForXp, rankForLevel, xpForMinutes } from "@/lib/cosmic/config";

export function sessionElapsedSeconds(session: FocusSession, now: number): number {
  const start = new Date(session.start_time).getTime();
  const pausedNow = session.paused_at ? (now - new Date(session.paused_at).getTime()) / 1000 : 0;
  return Math.max(0, (now - start) / 1000 - Number(session.paused_duration) - pausedNow);
}

export interface MissionData {
  loading: boolean;
  userId: string;
  objects: CelestialObject[];
  segments: JourneySegment[];
  objectById: Map<string, CelestialObject>;
  profile: ReturnType<typeof useProfileQuery>["data"];
  journey: ReturnType<typeof useJourneyQuery>["data"];
  discoveredIds: Set<string>;
  activeSession: FocusSession | null;
  currentObject: CelestialObject | null;
  currentSegment: JourneySegment | null;
  destination: CelestialObject | null;
  requiredMinutes: number;
  storedProgress: number;
  refresh: () => Promise<void>;
}

function useProfileQuery(uid: string) {
  return useQuery({ ...profileQuery(uid), enabled: uid.length > 0 });
}
function useJourneyQuery(uid: string) {
  return useQuery({ ...journeyQuery(uid), enabled: uid.length > 0 });
}

export function useMission(): MissionData {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const catalog = useQuery(catalogQuery);
  const profile = useProfileQuery(uid);
  const journey = useJourneyQuery(uid);
  const discoveries = useQuery({ ...discoveriesQuery(uid), enabled: uid.length > 0 });
  const active = useQuery({ ...activeSessionQuery(uid), enabled: uid.length > 0 });

  const objects = catalog.data?.objects ?? [];
  const segments = catalog.data?.segments ?? [];
  const objectById = new Map(objects.map((o) => [o.id, o]));

  const j = journey.data ?? null;
  const currentSegment = j?.current_segment_id
    ? (segments.find((s) => s.id === j.current_segment_id) ?? null)
    : null;
  const currentObject = j ? (objectById.get(j.current_object_id) ?? null) : null;
  const destination = currentSegment
    ? (objectById.get(currentSegment.destination_object_id) ?? null)
    : null;

  return {
    loading:
      catalog.isLoading || profile.isLoading || journey.isLoading || active.isLoading || discoveries.isLoading,
    userId: uid,
    objects,
    segments,
    objectById,
    profile: profile.data,
    journey: journey.data,
    discoveredIds: new Set((discoveries.data ?? []).map((d) => d.object_id)),
    activeSession: active.data ?? null,
    currentObject,
    currentSegment,
    destination,
    requiredMinutes: currentSegment?.required_focus_minutes ?? 0,
    storedProgress: j ? clamp01(Number(j.segment_progress)) : 0,
    refresh: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["profile", uid] }),
        qc.invalidateQueries({ queryKey: ["journey", uid] }),
        qc.invalidateQueries({ queryKey: ["discoveries", uid] }),
        qc.invalidateQueries({ queryKey: ["active-session", uid] }),
        qc.invalidateQueries({ queryKey: ["sessions", uid] }),
        qc.invalidateQueries({ queryKey: ["leaderboard"] }),
      ]);
    },
  };
}

export function useRecentSessions() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  return useQuery({ ...recentSessionsQuery(uid), enabled: uid.length > 0 });
}

/* ------------------------------------------------------------------ */
/* Session lifecycle                                                    */
/* ------------------------------------------------------------------ */

export async function startSession(input: {
  userId: string;
  method: string;
  plannedMinutes: number | null;
  segmentId: string | null;
  startingProgress: number;
}): Promise<void> {
  await supabase.from("focus_sessions").insert({
    user_id: input.userId,
    method: input.method,
    planned_duration: input.plannedMinutes,
    segment_id: input.segmentId,
    starting_progress: input.startingProgress,
    status: "running",
  });
}

export async function pauseSession(session: FocusSession): Promise<void> {
  if (session.status !== "running") return;
  await supabase
    .from("focus_sessions")
    .update({ status: "paused", paused_at: new Date().toISOString() })
    .eq("id", session.id);
}

export async function resumeSession(session: FocusSession): Promise<void> {
  if (session.status !== "paused" || !session.paused_at) return;
  const extra = (Date.now() - new Date(session.paused_at).getTime()) / 1000;
  await supabase
    .from("focus_sessions")
    .update({
      status: "running",
      paused_at: null,
      paused_duration: Number(session.paused_duration) + extra,
    })
    .eq("id", session.id);
}

export interface FinishResult {
  focusedMinutes: number;
  xpEarned: number;
  reachedDestination: boolean;
  discoveredObjectId: string | null;
  leveledUpTo: number | null;
  newRank: string | null;
}

/**
 * Finalizes a session: writes session totals, advances the journey (recording a
 * discovery + carry-over progress when the destination is reached) and updates
 * XP, level, rank and streak on the profile.
 */
/**
 * Mid-session arrival: registers the discovery, advances the journey to the next
 * segment and rebases the running session onto that segment. The session, its
 * timer and the spacecraft keep going — nothing is paused or reset.
 */
export async function registerArrival(params: {
  session: FocusSession;
  segments: JourneySegment[];
  segment: JourneySegment;
  userId: string;
}): Promise<{ discoveredObjectId: string; nextSegmentId: string | null }> {
  const { session, segments, segment, userId } = params;
  const required = segment.required_focus_minutes;
  const startingProgress = clamp01(Number(session.starting_progress));
  const minutesToArrival = required > 0 ? (1 - startingProgress) * required : 0;
  const arrivalElapsed = Number(session.segment_start_elapsed ?? 0) + minutesToArrival * 60;

  const idx = segments.findIndex((s) => s.id === segment.id);
  const next = idx >= 0 ? (segments[idx + 1] ?? null) : null;

  await supabase
    .from("discoveries")
    .upsert(
      { user_id: userId, object_id: segment.destination_object_id },
      { onConflict: "user_id,object_id" },
    );

  await supabase
    .from("user_journey")
    .update({
      current_object_id: segment.destination_object_id,
      current_segment_id: next?.id ?? null,
      segment_progress: 0,
      segment_focus_minutes: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await supabase
    .from("focus_sessions")
    .update({
      segment_id: next?.id ?? null,
      starting_progress: 0,
      segment_start_elapsed: arrivalElapsed,
    })
    .eq("id", session.id);

  return { discoveredObjectId: segment.destination_object_id, nextSegmentId: next?.id ?? null };
}

export async function finishSession(params: {
  session: FocusSession;
  segments: JourneySegment[];
  segment: JourneySegment | null;
  startingProgress: number;
  elapsedSeconds: number;
  segmentElapsedSeconds: number;
  endedEarly: boolean;
  profile: { xp: number; level: number; total_focus_minutes: number; completed_sessions: number; current_streak: number; longest_streak: number; last_focus_date: string | null };
  userId: string;
}): Promise<FinishResult> {
  const { session, segment, segments, startingProgress, elapsedSeconds, segmentElapsedSeconds, endedEarly, profile, userId } = params;
  const focusedMinutes = elapsedSeconds / 60;
  const segmentMinutes = segmentElapsedSeconds / 60;
  const required = segment?.required_focus_minutes ?? 0;
  const minutesToArrival = required > 0 ? (1 - clamp01(startingProgress)) * required : 0;
  const reached = segment !== null && required > 0 && segmentMinutes >= minutesToArrival;

  const rawProgress = required > 0 ? clamp01(startingProgress) + segmentMinutes / required : 1;
  const endingProgress = clamp01(rawProgress);

  const xpEarned = xpForMinutes(focusedMinutes);

  await supabase
    .from("focus_sessions")
    .update({
      status: endedEarly ? "ended_early" : "completed",
      end_time: new Date().toISOString(),
      actual_duration: Number(focusedMinutes.toFixed(2)),
      ending_progress: endingProgress,
      xp_earned: xpEarned,
      destination_reached: reached,
      paused_at: null,
    })
    .eq("id", session.id);

  let discoveredObjectId: string | null = null;

  if (reached && segment) {
    discoveredObjectId = segment.destination_object_id;
    await supabase
      .from("discoveries")
      .upsert({ user_id: userId, object_id: discoveredObjectId }, { onConflict: "user_id,object_id" });

    const idx = segments.findIndex((s) => s.id === segment.id);
    const next = idx >= 0 ? (segments[idx + 1] ?? null) : null;
    const leftover = Math.max(0, segmentMinutes - minutesToArrival);
    const nextRequired = next?.required_focus_minutes ?? 0;
    const carry = next && nextRequired > 0 ? Math.min(0.98, leftover / nextRequired) : 0;

    await supabase
      .from("user_journey")
      .update({
        current_object_id: segment.destination_object_id,
        current_segment_id: next?.id ?? null,
        segment_progress: carry,
        segment_focus_minutes: next ? carry * nextRequired : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("user_journey")
      .update({
        segment_progress: endingProgress,
        segment_focus_minutes: endingProgress * required,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }

  // Streak + XP
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 86_400_000).toISOString().slice(0, 10);
  let streak = profile.current_streak;
  if (profile.last_focus_date === todayStr) {
    streak = Math.max(1, profile.current_streak);
  } else if (profile.last_focus_date === yesterday) {
    streak = profile.current_streak + 1;
  } else {
    streak = 1;
  }

  const newXp = profile.xp + xpEarned;
  const newLevel = levelForXp(newXp);
  const newRank = rankForLevel(newLevel);

  await supabase
    .from("profiles")
    .update({
      xp: newXp,
      level: newLevel,
      rank: newRank,
      total_focus_minutes: Number((Number(profile.total_focus_minutes) + focusedMinutes).toFixed(2)),
      completed_sessions: profile.completed_sessions + 1,
      current_streak: streak,
      longest_streak: Math.max(profile.longest_streak, streak),
      last_focus_date: todayStr,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return {
    focusedMinutes,
    xpEarned,
    reachedDestination: reached,
    discoveredObjectId,
    leveledUpTo: newLevel > profile.level ? newLevel : null,
    newRank: newLevel > profile.level ? newRank : null,
  };
}
