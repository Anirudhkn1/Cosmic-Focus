/**
 * Lightweight, dependency-free visual specs for every celestial object.
 * Rendered as inline SVG (see CelestialBody) so bodies are recognisable at a
 * glance without loading any external imagery.
 */

export interface BodyArt {
  /** [lit colour, mid colour, shadow colour] */
  base: [string, string, string];
  /** Horizontal cloud bands: [yCenter 0-1, height 0-1, colour, opacity]. */
  bands?: [number, number, string, number][];
  /** Blobs (continents, terrain patches): [cx, cy, rx, ry, rot, colour, opacity]. */
  blobs?: [number, number, number, number, number, string, number][];
  /** Crater density 0-3. */
  craters?: number;
  /** Great-Red-Spot style oval: [cx, cy, rx, ry, colour]. */
  spot?: [number, number, number, number, string];
  /** Thin surface streaks (Europa lineae). */
  streaks?: string;
  /** Ring system colour. */
  ring?: string;
  /** Wispy cloud overlay colour. */
  clouds?: string;
  /** Corona/glow colour (stars). */
  glow?: string;
  /** Render as a particle swarm instead of a sphere (belts, clouds). */
  swarm?: { color: string; count: number; ring?: boolean; style?: "belt" | "shell" };
  /** Irregular (non-spherical) lump — small moons and asteroids. */
  irregular?: boolean;
}

const ICE: [string, string, string] = ["#ffffff", "#d7dee8", "#8792a3"];

export const BODY_ART: Record<string, BodyArt> = {
  sun: {
    base: ["#fff6cf", "#ffcc33", "#ef8c19"],
    glow: "#ffb020",
    blobs: [
      [0.35, 0.4, 0.18, 0.12, -20, "#ffe89a", 0.6],
      [0.66, 0.62, 0.14, 0.1, 15, "#f7871f", 0.5],
    ],
  },
  mercury: { base: ["#b9b3ad", "#8d8781", "#4c4a48"], craters: 3 },
  venus: {
    base: ["#fff0c2", "#eccb84", "#a97f3c"],
    clouds: "#fff6d8",
    bands: [
      [0.32, 0.1, "#fff5d6", 0.5],
      [0.58, 0.12, "#d8ab5d", 0.45],
    ],
  },
  earth: {
    base: ["#7ec8ff", "#1f6fd0", "#0b3b78"],
    blobs: [
      [0.36, 0.35, 0.2, 0.15, -18, "#3f9b4a", 0.95],
      [0.62, 0.58, 0.17, 0.19, 12, "#4fa85a", 0.95],
      [0.3, 0.68, 0.11, 0.09, 0, "#8a7a4b", 0.9],
      [0.7, 0.3, 0.1, 0.07, 25, "#6f9c52", 0.9],
    ],
    clouds: "#ffffff",
  },
  moon: { base: ["#e6e3dd", "#b3aea6", "#6c6864"], craters: 3 },
  mars: {
    base: ["#ffb27a", "#d1552b", "#7d2c14"],
    blobs: [
      [0.35, 0.42, 0.18, 0.1, -10, "#8f3a1c", 0.7],
      [0.66, 0.6, 0.15, 0.09, 12, "#a34523", 0.6],
      [0.5, 0.14, 0.14, 0.07, 0, "#f3e7dc", 0.85],
      [0.5, 0.87, 0.13, 0.06, 0, "#f3e7dc", 0.8],
    ],
    craters: 1,
  },
  phobos: { base: ["#a89b8e", "#7b6f64", "#403a35"], craters: 3, irregular: true },
  deimos: { base: ["#b3a493", "#857767", "#453e37"], craters: 2, irregular: true },
  asteroid_belt: {
    base: ["#9a938a", "#6d6760", "#3a3733"],
    swarm: { color: "#b8afa2", count: 90, ring: true, style: "belt" },
  },
  ceres: { base: ["#cfc9bf", "#9b958c", "#57534e"], craters: 3 },
  vesta: { base: ["#d6cabb", "#a08f7c", "#564c42"], craters: 3, irregular: true },
  jupiter: {
    base: ["#fbe6c8", "#d9a066", "#8a5a2f"],
    bands: [
      [0.2, 0.08, "#f6e3c4", 0.9],
      [0.32, 0.07, "#b97c45", 0.85],
      [0.44, 0.08, "#f3dcb8", 0.9],
      [0.56, 0.07, "#a96c3a", 0.85],
      [0.68, 0.08, "#efd7ae", 0.9],
      [0.8, 0.07, "#b57b45", 0.8],
    ],
    spot: [0.63, 0.6, 0.13, 0.075, "#c9482f"],
  },
  io: {
    base: ["#fff2a8", "#e8c34a", "#a8761c"],
    blobs: [
      [0.36, 0.4, 0.08, 0.06, 0, "#7a3410", 0.85],
      [0.62, 0.58, 0.06, 0.05, 0, "#8d3f14", 0.8],
      [0.5, 0.75, 0.07, 0.04, 0, "#c94f16", 0.7],
      [0.7, 0.3, 0.05, 0.04, 0, "#f0e37a", 0.9],
    ],
  },
  europa: { base: ["#fbf3e6", "#dcd2c4", "#93897c"], streaks: "#a2603c" },
  ganymede: {
    base: ["#d8cfc2", "#a3968a", "#5a5148"],
    blobs: [
      [0.35, 0.4, 0.2, 0.16, -15, "#7d7166", 0.6],
      [0.68, 0.65, 0.16, 0.13, 10, "#8e8377", 0.5],
    ],
    craters: 2,
  },
  callisto: { base: ["#a99b8b", "#7a6d60", "#3f3933"], craters: 3 },
  saturn: {
    base: ["#fdf0cd", "#e0c183", "#9c7c3f"],
    bands: [
      [0.28, 0.09, "#fbeccb", 0.8],
      [0.45, 0.08, "#d8b26f", 0.7],
      [0.62, 0.09, "#f7e5bf", 0.8],
      [0.76, 0.07, "#cda765", 0.7],
    ],
    ring: "#e8d6ae",
  },
  mimas: { base: ["#e2e0dc", "#adaba6", "#666461"], craters: 3 },
  enceladus: { base: ["#ffffff", "#e6edf5", "#9aa7b6"], streaks: "#b9c8dc" },
  tethys: { base: ["#eceae4", "#bdbab3", "#73716d"], craters: 2 },
  dione: { base: ["#e5e2da", "#b5b1a8", "#6d6a64"], craters: 2, streaks: "#ffffff" },
  rhea: { base: ["#e8e5de", "#b7b3aa", "#6f6c66"], craters: 3 },
  titan: {
    base: ["#ffd98a", "#e19a37", "#9c5c14"],
    clouds: "#ffcf80",
    bands: [
      [0.22, 0.1, "#ffe2a4", 0.5],
      [0.8, 0.1, "#c97f22", 0.5],
    ],
  },
  iapetus: {
    base: ["#ded9cf", "#a79f92", "#5f5a52"],
    blobs: [[0.68, 0.5, 0.26, 0.42, 0, "#3a3129", 0.85]],
    craters: 2,
  },
  phoebe: { base: ["#8b837a", "#5d5750", "#2f2c29"], craters: 3, irregular: true },
  uranus: {
    base: ["#d6fbff", "#7fd7dd", "#3d8f9c"],
    bands: [
      [0.4, 0.1, "#b3ecf1", 0.4],
      [0.62, 0.1, "#63c2cc", 0.35],
    ],
    ring: "#9fd9e0",
  },
  miranda: { base: ["#dcd9d4", "#a6a29c", "#605d59"], streaks: "#8d8983", craters: 2 },
  ariel: { base: ["#e4e1db", "#b0aca4", "#6a6762"], streaks: "#ffffff", craters: 1 },
  umbriel: { base: ["#9c968e", "#6b6660", "#38352f"], craters: 3 },
  titania: { base: ["#d9cec4", "#a4968a", "#5d554d"], craters: 2 },
  oberon: { base: ["#cfc2b6", "#98897c", "#544c45"], craters: 3 },
  neptune: {
    base: ["#8fc4ff", "#2b5fd0", "#12327a"],
    bands: [
      [0.3, 0.08, "#a9d3ff", 0.35],
      [0.7, 0.09, "#1d47a8", 0.4],
    ],
    spot: [0.4, 0.44, 0.11, 0.06, "#13306e"],
  },
  triton: {
    base: ["#f4f1ea", "#cfc6bd", "#8b8177"],
    blobs: [[0.5, 0.78, 0.34, 0.18, 0, "#c08a6d", 0.7]],
    streaks: "#7c6a5e",
  },
  nereid: { base: ["#b6b0a7", "#847e76", "#464341"], craters: 2, irregular: true },
  kuiper_belt: { base: ["#9fb4c9", "#6c8098", "#39485a"], swarm: { color: "#a9c1d6", count: 46, ring: true } },
  pluto: {
    base: ["#f6e6cd", "#cda87d", "#7d6144"],
    blobs: [
      [0.55, 0.6, 0.22, 0.2, 0, "#fbf1de", 0.95],
      [0.44, 0.52, 0.13, 0.14, 0, "#fbf1de", 0.95],
      [0.3, 0.32, 0.15, 0.09, -12, "#6a4a33", 0.75],
      [0.72, 0.28, 0.12, 0.07, 10, "#7a583c", 0.6],
    ],
  },
  charon: {
    base: ["#dcd9d4", "#a5a29c", "#5f5c58"],
    blobs: [[0.5, 0.16, 0.24, 0.1, 0, "#7d5a4a", 0.7]],
    craters: 2,
  },
  nix: { base: ["#e8e6e1", "#b2afaa", "#6a6763"], craters: 2, irregular: true },
  hydra: { base: ["#e4e2dd", "#adaba6", "#67645f"], craters: 2, irregular: true },
  makemake: { base: ["#f0cdae", "#c08155", "#6f452a"], craters: 1 },
  haumea: { base: ["#f2efe8", "#c8c3b8", "#79746b"], irregular: true, ring: "#cfd6dd" },
  hiiaka: { base: ["#eeece7", "#b8b5ae", "#6d6a65"], craters: 2, irregular: true },
  namaka: { base: ["#eae8e3", "#b3b0aa", "#696661"], craters: 2, irregular: true },
  scattered_disk: { base: ["#8fa3bb", "#5f7189", "#333f4f"], swarm: { color: "#93a9c1", count: 34 } },
  oort_cloud: { base: ["#b9c9dd", "#7d8ea4", "#3d4757"], swarm: { color: "#cfe0f2", count: 140, style: "shell" } },
};

const GENERIC: BodyArt = { base: ICE, craters: 2 };

export function bodyArt(id: string | null | undefined): BodyArt {
  if (!id) return GENERIC;
  return BODY_ART[id] ?? GENERIC;
}
