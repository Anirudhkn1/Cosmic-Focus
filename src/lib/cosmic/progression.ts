/**
 * COSMIC FOCUS — centralized journey progression configuration.
 *
 * Two regimes:
 *  1. Manual overrides for the inner Solar System (Sun → Jupiter).
 *  2. A configurable logarithmic equation from Jupiter onward.
 *
 * Nothing here may be duplicated inside UI components.
 */

import type { CelestialObject, JourneySegment } from "@/lib/cosmic/api";

/* ---------------- Manual overrides (accumulated focus, minutes) ---------------- */

export const MANUAL_SEGMENT_MINUTES: Record<string, number> = {
  mercury: 120, // Sun → Mercury 2h
  venus: 140, // Mercury → Venus 2h20m
  earth: 180, // Venus → Earth 3h
  moon: 30, // Earth → Moon 30m
  mars: 220, // Moon → Mars 3h40m
  phobos: 40, // Mars → Phobos 40m
  deimos: 50, // Phobos → Deimos 50m
  asteroid_belt: 210, // Deimos → Asteroid Belt 3h30m
  ceres: 36, // Asteroid Belt → Ceres 36m
  vesta: 45, // Ceres → Vesta 45m
  jupiter: 330, // Vesta → Jupiter 5h30m
};

/* ---------------- Equation configuration (Jupiter onward) ---------------- */

export const T_MIN_MINUTES = 20;
export const T_MAX_MINUTES = 25 * 60;
export const CURVE_EXPONENT = 2.2;
export const D_MAX_AU = 2000;

export const DESTINATION_MULTIPLIERS = {
  MAJOR_PLANET: 1.0,
  DWARF_PLANET: 0.8,
  REGION: 0.7,
  MAJOR_MOON: 0.3,
  SMALL_MOON: 0.2,
  CHECKPOINT: 0.1,
} as const;

/** Moons treated as major destinations; every other moon is a small moon. */
export const MAJOR_MOONS = new Set<string>([
  "moon",
  "io",
  "europa",
  "ganymede",
  "callisto",
  "tethys",
  "dione",
  "rhea",
  "titan",
  "iapetus",
  "enceladus",
  "ariel",
  "umbriel",
  "titania",
  "oberon",
  "triton",
  "charon",
]);

export function multiplierFor(object: CelestialObject): number {
  switch (object.type) {
    case "planet":
      return DESTINATION_MULTIPLIERS.MAJOR_PLANET;
    case "dwarf_planet":
      return DESTINATION_MULTIPLIERS.DWARF_PLANET;
    case "region":
      return DESTINATION_MULTIPLIERS.REGION;
    case "moon":
      return MAJOR_MOONS.has(object.id)
        ? DESTINATION_MULTIPLIERS.MAJOR_MOON
        : DESTINATION_MULTIPLIERS.SMALL_MOON;
    case "asteroid":
      return DESTINATION_MULTIPLIERS.CHECKPOINT;
    default:
      return DESTINATION_MULTIPLIERS.CHECKPOINT;
  }
}

/** T_base = T_min + (T_max - T_min) * [ln(1+D)/ln(1+D_max)]^p */
export function baseMinutesForDistance(distanceAu: number): number {
  const d = Math.max(0, distanceAu);
  const ratio = Math.log(1 + d) / Math.log(1 + D_MAX_AU);
  return T_MIN_MINUTES + (T_MAX_MINUTES - T_MIN_MINUTES) * Math.pow(Math.min(1, ratio), CURVE_EXPONENT);
}

/**
 * Total accumulated focus minutes required for a segment.
 * Manual overrides win through Vesta → Jupiter; the equation applies afterwards.
 */
export function requiredMinutesForSegment(
  segment: JourneySegment,
  destination: CelestialObject | undefined,
): number {
  const manual = MANUAL_SEGMENT_MINUTES[segment.destination_object_id];
  if (manual !== undefined) return manual;
  if (!destination) return segment.required_focus_minutes;
  const base = baseMinutesForDistance(Number(destination.real_distance_from_sun));
  return Math.max(1, Math.round(base * multiplierFor(destination)));
}

/** Applies the progression model to a freshly fetched catalog. */
export function withProgression(
  segments: JourneySegment[],
  objects: CelestialObject[],
): JourneySegment[] {
  const byId = new Map(objects.map((o) => [o.id, o]));
  return segments.map((s) => ({
    ...s,
    required_focus_minutes: requiredMinutesForSegment(s, byId.get(s.destination_object_id)),
  }));
}
