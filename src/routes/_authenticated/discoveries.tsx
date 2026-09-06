import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { CelestialImage } from "@/components/cosmic/CelestialImage";
import { ObjectDialog } from "@/components/cosmic/ObjectDialog";
import { useMission } from "@/hooks/useMission";
import { OBJECT_TYPE_LABEL, formatAu } from "@/lib/cosmic/config";
import type { CelestialObject } from "@/lib/cosmic/api";
import { cn } from "@/lib/utils";
import BlurText from "@/components/BlurText";

export const Route = createFileRoute("/_authenticated/discoveries")({
  head: () => ({
    meta: [
      { title: "Discovery Log — Cosmic Focus" },
      {
        name: "description",
        content:
          "Every planet, moon, dwarf planet and belt you have reached, with real imagery and mission facts unlocked by focus.",
      },
      { property: "og:title", content: "Discovery Log — Cosmic Focus" },
      {
        property: "og:description",
        content: "Planets, moons and belts unlocked by your focus sessions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoveriesPage,
});

function DiscoveriesPage() {
  const { objects, discoveredIds, loading } = useMission();
  const [selected, setSelected] = useState<CelestialObject | null>(null);

  if (loading) return <div className="label-tech py-20 text-center">Loading discovery log…</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="label-tech">Discovery log</p>
        <BlurText
          as="h1"
          text={`${discoveredIds.size} of ${objects.length} objects catalogued`}
          delay={70}
          animateBy="words"
          direction="top"
          className="font-display text-3xl font-semibold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {objects.map((obj) => {
          const found = discoveredIds.has(obj.id);
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => setSelected(obj)}
              className={cn(
                "panel flex flex-col items-center gap-2 p-4 text-center transition-colors",
                found ? "hover:border-primary/60" : "opacity-70 hover:opacity-100",
              )}
            >
              <div className="relative">
                <CelestialImage
                  src={found ? obj.image_url : null}
                  alt={obj.name}
                  objectId={obj.id}
                  className="h-20 w-20"
                />
                {!found ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </span>
                ) : null}
              </div>
              <div>
                <div className="font-display text-sm font-semibold">{found ? obj.name : "Unknown"}</div>
                <div className="label-tech mt-1">
                  {OBJECT_TYPE_LABEL[obj.type] ?? obj.type}
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {formatAu(Number(obj.real_distance_from_sun))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

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
