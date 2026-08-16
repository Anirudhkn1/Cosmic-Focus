import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { withProgression } from "@/lib/cosmic/progression";

export type CelestialObject = Database["public"]["Tables"]["celestial_objects"]["Row"];
export type JourneySegment = Database["public"]["Tables"]["journey_segments"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserJourney = Database["public"]["Tables"]["user_journey"]["Row"];
export type Discovery = Database["public"]["Tables"]["discoveries"]["Row"];
export type FocusSession = Database["public"]["Tables"]["focus_sessions"]["Row"];

export type LeaderboardRow = Database["public"]["Functions"]["weekly_leaderboard"]["Returns"][number];

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

export const catalogQuery = {
  queryKey: ["catalog"] as const,
  queryFn: async () => {
    const [objects, segments] = await Promise.all([
      unwrap(supabase.from("celestial_objects").select("*").order("journey_index")),
      unwrap(supabase.from("journey_segments").select("*").order("segment_order")),
    ]);
    return {
      objects: objects as CelestialObject[],
      segments: withProgression(segments as JourneySegment[], objects as CelestialObject[]),
    };
  },
  staleTime: 1000 * 60 * 60,
};

export function profileQuery(userId: string) {
  return {
    queryKey: ["profile", userId] as const,
    queryFn: async () =>
      unwrap(supabase.from("profiles").select("*").eq("id", userId).maybeSingle()) as Promise<Profile | null>,
  };
}

export function journeyQuery(userId: string) {
  return {
    queryKey: ["journey", userId] as const,
    queryFn: async () =>
      unwrap(
        supabase.from("user_journey").select("*").eq("user_id", userId).maybeSingle(),
      ) as Promise<UserJourney | null>,
  };
}

export function discoveriesQuery(userId: string) {
  return {
    queryKey: ["discoveries", userId] as const,
    queryFn: async () =>
      unwrap(
        supabase.from("discoveries").select("*").eq("user_id", userId).order("discovered_at"),
      ) as Promise<Discovery[]>,
  };
}

export function activeSessionQuery(userId: string) {
  return {
    queryKey: ["active-session", userId] as const,
    queryFn: async () =>
      unwrap(
        supabase
          .from("focus_sessions")
          .select("*")
          .eq("user_id", userId)
          .in("status", ["running", "paused"])
          .order("start_time", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ) as Promise<FocusSession | null>,
  };
}

export function recentSessionsQuery(userId: string) {
  return {
    queryKey: ["sessions", userId] as const,
    queryFn: async () =>
      unwrap(
        supabase
          .from("focus_sessions")
          .select("*")
          .eq("user_id", userId)
          .in("status", ["completed", "ended_early"])
          .order("start_time", { ascending: false })
          .limit(120),
      ) as Promise<FocusSession[]>,
  };
}

export const leaderboardQuery = {
  queryKey: ["leaderboard"] as const,
  queryFn: async () => unwrap(supabase.rpc("weekly_leaderboard")) as Promise<LeaderboardRow[]>,
};

/** Ensures a profile + journey row exists (covers pre-trigger accounts). */
export async function ensureUserRows(userId: string, fallbackName: string): Promise<void> {
  const profile = await unwrap(supabase.from("profiles").select("id").eq("id", userId).maybeSingle());
  if (!profile) {
    await supabase.from("profiles").insert({ id: userId, display_name: fallbackName });
  }
  const journey = await unwrap(
    supabase.from("user_journey").select("user_id").eq("user_id", userId).maybeSingle(),
  );
  if (!journey) {
    await supabase.from("user_journey").insert({ user_id: userId });
    await supabase.from("discoveries").insert({ user_id: userId, object_id: "sun" });
  }
}
