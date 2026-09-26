import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Crosshair, Mouse, Rocket } from "lucide-react";
import { CelestialImage } from "@/components/cosmic/CelestialImage";
import { ObjectDialog } from "@/components/cosmic/ObjectDialog";
import { Spacecraft } from "@/components/cosmic/Spacecraft";
import { useLiveSession } from "@/hooks/useLiveSession";
import { OBJECT_TYPE_LABEL, formatAu } from "@/lib/cosmic/config";
import type { CelestialObject } from "@/lib/cosmic/api";
import { cn } from "@/lib/utils";
import BlurText from "@/components/BlurText";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "Journey Map — Cosmic Focus" },
      {
        name: "description",
        content:
          "The full Solar System route from the Sun to the Oort Cloud, with your spacecraft's live position on the track.",
      },
      { property: "og:title", content: "Journey Map — Cosmic Focus" },
      { property: "og:description", content: "The full route from the Sun to the Oort Cloud." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

/** Rendered diameter (px, at zoom 1) per object type/id. */
function bodySize(obj: CelestialObject): number {
  if (obj.type === "star") return 140;
  if (obj.type === "region") return 96;
  if (obj.id === "jupiter") return 104;
  if (obj.id === "saturn") return 96;
  if (obj.id === "uranus" || obj.id === "neptune") return 74;
  if (obj.type === "planet") return 58;
  if (obj.type === "dwarf_planet") return 40;
  if (obj.type === "asteroid") return 34;
  return 26;
}

const TRACK_HEIGHT = 460;

function MapPage() {
  const { mission, progress, running } = useLiveSession();
  const { objects, discoveredIds, currentSegment, loading } = mission;
  const [selected, setSelected] = useState<CelestialObject | null>(null);
  const [zoom, setZoom] = useState(1);

  const destinationId = currentSegment?.destination_object_id ?? null;

  const { nodes, width } = useMemo(() => {
    const primaries = objects
      .filter((o) => !o.parent_id)
      .sort((a, b) => a.journey_index - b.journey_index);
    const moonsOf = new Map<string, CelestialObject[]>();
    for (const o of objects) {
      if (!o.parent_id) continue;
      const list = moonsOf.get(o.parent_id) ?? [];
      list.push(o);
      moonsOf.set(o.parent_id, list);
    }

    let x = 90;
    const out = primaries.map((obj, i) => {
      const size = bodySize(obj);
      const moons = (moonsOf.get(obj.id) ?? []).sort((a, b) => a.branch_order - b.branch_order);
      const orbit = size / 2 + 30 + (moons.length > 3 ? 12 : 0);
      x += size / 2 + 40;
      const cx = x;
      x += size / 2 + (moons.length ? orbit * 0.5 : 0) + 46;
      return {
        obj,
        size,
        cx,
        cy: TRACK_HEIGHT / 2 + Math.sin(i * 0.9) * 46,
        orbit,
        moons,
        delay: (i % 5) * 0.7,
      };
    });
    return { nodes: out, width: x + 90 };
  }, [objects]);

  const journeyPct = objects.length
    ? (discoveredIds.size / objects.length) * 100
    : 0;

  if (loading) return <div className="label-tech py-20 text-center">Plotting trajectory…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-tech">Journey map</p>
          <BlurText
            as="h1"
            text="Cosmic Focus Journey"
            delay={80}
            animateBy="words"
            direction="top"
            className="font-display text-3xl font-semibold"
          />
          <p className="mt-1 text-sm text-muted-foreground">Focus. Travel. Discover.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="panel flex items-center gap-1 px-2 py-1">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-14 text-center font-mono text-sm">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Reset zoom"
            onClick={() => setZoom(1)}
            className="panel p-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="panel starfield relative overflow-hidden p-0">
        <div className="starfield-layer pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative overflow-x-auto overflow-y-hidden">
          <div
            className="relative origin-top-left"
            style={{
              width: width * zoom,
              height: TRACK_HEIGHT * zoom,
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width, height: TRACK_HEIGHT, transform: `scale(${zoom})` }}
            >
              <svg
                className="pointer-events-none absolute inset-0"
                width={width}
                height={TRACK_HEIGHT}
                aria-hidden="true"
              >
                <path
                  d={
                    nodes.length
                      ? nodes
                          .map((n, i) =>
                            i === 0
                              ? `M ${n.cx} ${n.cy}`
                              : `Q ${(nodes[i - 1]!.cx + n.cx) / 2} ${
                                  (nodes[i - 1]!.cy + n.cy) / 2 - 34
                                } ${n.cx} ${n.cy}`,
                          )
                          .join(" ")
                      : ""
                  }
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth={1.5}
                  opacity={0.45}
                />
                {nodes.map((n) =>
                  n.moons.length ? (
                    <ellipse
                      key={`o-${n.obj.id}`}
                      cx={n.cx}
                      cy={n.cy}
                      rx={n.orbit}
                      ry={n.orbit * 0.42}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth={1}
                      opacity={0.25}
                    />
                  ) : null,
                )}
              </svg>

              {nodes.map((n) => {
                const found = discoveredIds.has(n.obj.id);
                const isTarget = n.obj.id === destinationId;
                return (
                  <div
                    key={n.obj.id}
                    className="absolute animate-drift"
                    style={{
                      left: n.cx,
                      top: n.cy,
                      animationDelay: `${n.delay}s`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(n.obj)}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                      style={{ width: n.size, height: n.size }}
                    >
                      <CelestialImage
                        src={found ? n.obj.image_url : null}
                        alt={n.obj.name}
                        objectId={n.obj.id}
                        className="h-full w-full"
                      />
                      {isTarget ? (
                        <span className="pointer-events-none absolute inset-[-10px] rounded-full border border-primary/70" />
                      ) : null}
                    </button>

                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-[11px] font-medium",
                        isTarget ? "text-primary" : "text-foreground/80",
                      )}
                      style={{ top: n.size / 2 + 8 }}
                    >
                      {found || isTarget ? n.obj.name : "Unknown"}
                    </span>

                    {isTarget ? (
                      <span
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono text-[10px] text-primary"
                        style={{ top: n.size / 2 + 24 }}
                      >
                        {(progress * 100).toFixed(0)}%
                      </span>
                    ) : null}

                    {n.moons.map((m, mi) => {
                      const a = (mi / Math.max(1, n.moons.length)) * Math.PI * 2 - Math.PI / 3;
                      const ms = bodySize(m);
                      const mFound = discoveredIds.has(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelected(m)}
                          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-110"
                          style={{
                            left: Math.cos(a) * n.orbit,
                            top: Math.sin(a) * n.orbit * 0.42,
                            width: ms,
                            height: ms,
                          }}
                          title={mFound ? m.name : "Unknown"}
                        >
                          <CelestialImage
                            src={mFound ? m.image_url : null}
                            alt={m.name}
                            objectId={m.id}
                            className="h-full w-full"
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="panel pointer-events-auto flex items-center gap-3 px-4 py-2.5">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Your Journey</span>
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
              <span
                className="block h-full rounded-full bg-[image:var(--gradient-primary)]"
                style={{ width: `${journeyPct}%` }}
              />
            </span>
            <Spacecraft moving={running === true} size={20} />
          </div>
          <div className="panel pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
            <Mouse className="h-3.5 w-3.5" />
            Scroll to explore <span className="text-primary">•</span> Zoom in/out
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {objects.length} waypoints ·{" "}
        {currentSegment
          ? `Next: ${
              objects.find((o) => o.id === destinationId)?.name ?? "—"
            } · ${formatAu(
              Number(objects.find((o) => o.id === destinationId)?.real_distance_from_sun ?? 0),
            )}`
          : `${OBJECT_TYPE_LABEL["region"]} route complete`}
      </p>

      <ObjectDialog
        object={selected}
        discovered={selected ? discoveredIds.has(selected.id) : false}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
