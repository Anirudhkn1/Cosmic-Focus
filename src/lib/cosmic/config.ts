/**
 * COSMIC FOCUS — progression configuration layer.
 *
 * Everything in this file is intentionally data/configuration, not logic baked
 * into UI components. The focus-to-distance mathematics, XP curve, level
 * thresholds and rank mapping can all be changed here without touching screens.
 */

export type FocusMethodId = "manual" | "pomodoro" | "fifty_two_seventeen" | "ninety" | "flowtime";

export interface FocusMethod {
  id: FocusMethodId;
  name: string;
  focusMinutes: number | null; // null = open ended (Flowtime)
  breakMinutes: number | null;
  breakRange?: [number, number];
  description: string;
  bestFor: string;
}

export const FOCUS_METHODS: FocusMethod[] = [
  {
    id: "manual",
    name: "Manual",
    focusMinutes: 30,
    breakMinutes: null,
    description: "Choose any custom focus duration for this burn.",
    bestFor: "Fully custom sessions",
  },
  {
    id: "pomodoro",
    name: "Pomodoro",
    focusMinutes: 25,
    breakMinutes: 5,
    description: "25 minutes focus, 5 minutes break.",
    bestFor: "Reading, flashcards, low motivation",
  },
  {
    id: "fifty_two_seventeen",
    name: "52 / 17",
    focusMinutes: 52,
    breakMinutes: 17,
    description: "52 minutes focus, 17 minutes break.",
    bestFor: "Longer deep-concentration tasks",
  },
  {
    id: "ninety",
    name: "90-Minute Focus",
    focusMinutes: 90,
    breakMinutes: 25,
    breakRange: [20, 30],
    description: "90 minutes focus, configurable 20–30 minute break.",
    bestFor: "Long deep-work blocks",
  },
  {
    id: "flowtime",
    name: "Flowtime",
    focusMinutes: null,
    breakMinutes: null,
    description: "Focus naturally and stop when you choose. Break scales with focus time.",
    bestFor: "Natural, uninterrupted flow",
  },
];

export function getMethod(id: string): FocusMethod {
  return FOCUS_METHODS.find((m) => m.id === id) ?? (FOCUS_METHODS[0] as FocusMethod);
}

/** Flowtime break heuristic: one fifth of the focused time, clamped 5–20 min. */
export function flowtimeBreakMinutes(focusedMinutes: number): number {
  return Math.max(5, Math.min(20, Math.round(focusedMinutes / 5)));
}

/* ------------------------------------------------------------------ */
/* Focus → distance progression                                        */
/* ------------------------------------------------------------------ */

/**
 * Converts focused minutes on a segment into normalized progress (0 → 1).
 * Swap this single function to change the whole progression model.
 */
export function progressFromFocus(focusedMinutes: number, requiredMinutes: number): number {
  if (requiredMinutes <= 0) return 1;
  return clamp01(focusedMinutes / requiredMinutes);
}

/** Inverse of progressFromFocus — used to resume mid-segment. */
export function focusFromProgress(progress: number, requiredMinutes: number): number {
  return clamp01(progress) * requiredMinutes;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/* ------------------------------------------------------------------ */
/* XP, levels and astronaut ranks                                      */
/* ------------------------------------------------------------------ */

/** v1 economy: 1 focused minute = 1 XP. No multipliers. */
export const XP_PER_FOCUS_MINUTE = 1;

export function xpForMinutes(minutes: number): number {
  return Math.max(0, Math.round(minutes * XP_PER_FOCUS_MINUTE));
}

/** Cumulative XP required to *enter* each level (index 0 = level 1). */
export const LEVEL_THRESHOLDS: number[] = [
  0, 60, 150, 300, 500, 780, 1120, 1540, 2050, 2650, 3350, 4150, 5060, 6080, 7220, 8480, 9870,
  11400, 13080, 14900,
];

export function levelForXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (xp >= (LEVEL_THRESHOLDS[i] as number)) level = i + 1;
  }
  if (xp >= (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] as number)) {
    const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] as number;
    level = LEVEL_THRESHOLDS.length + Math.floor((xp - last) / 2200);
  }
  return level;
}

export function levelProgress(xp: number): { level: number; into: number; span: number; pct: number } {
  const level = levelForXp(xp);
  const floor = LEVEL_THRESHOLDS[level - 1] ?? (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] as number) + (level - LEVEL_THRESHOLDS.length) * 2200;
  const ceil =
    LEVEL_THRESHOLDS[level] ??
    (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] as number) + (level - LEVEL_THRESHOLDS.length + 1) * 2200;
  const span = Math.max(1, ceil - floor);
  const into = Math.max(0, xp - floor);
  return { level, into, span, pct: clamp01(into / span) * 100 };
}

/** Level → astronaut rank. Configurable thresholds. */
export const RANKS: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: "Cadet" },
  { minLevel: 3, title: "Trainee Pilot" },
  { minLevel: 5, title: "Flight Specialist" },
  { minLevel: 8, title: "Mission Specialist" },
  { minLevel: 11, title: "Flight Engineer" },
  { minLevel: 14, title: "Payload Commander" },
  { minLevel: 17, title: "Mission Commander" },
  { minLevel: 21, title: "Deep Space Navigator" },
  { minLevel: 26, title: "Interstellar Voyager" },
];

export function rankForLevel(level: number): string {
  let title = "Cadet";
  for (const r of RANKS) if (level >= r.minLevel) title = r.title;
  return title;
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function formatFocusTime(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const AU_IN_KM = 149_597_870.7;

export function formatDistance(au: number): string {
  if (au === 0) return "0 AU";
  if (au < 1) return `${au.toFixed(3)} AU · ${(au * AU_IN_KM).toLocaleString("en-US", { maximumFractionDigits: 0 })} km`;
  if (au >= 1000) return `${au.toLocaleString("en-US")} AU`;
  return `${au.toFixed(2)} AU · ${(au * AU_IN_KM).toLocaleString("en-US", { maximumFractionDigits: 0 })} km`;
}

export function formatAu(au: number): string {
  return au >= 1000 ? `${au.toLocaleString("en-US")} AU` : `${au.toFixed(2)} AU`;
}

export const OBJECT_TYPE_LABEL: Record<string, string> = {
  star: "Star",
  planet: "Planet",
  moon: "Moon",
  dwarf_planet: "Dwarf planet",
  asteroid: "Asteroid",
  region: "Region",
};
