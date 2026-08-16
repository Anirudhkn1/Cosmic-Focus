import { useEffect, useRef } from "react";
import { CelestialImage } from "./CelestialImage";
import { OBJECT_TYPE_LABEL } from "@/lib/cosmic/config";
import type { CelestialObject } from "@/lib/cosmic/api";

function factList(facts: unknown): string[] {
  if (Array.isArray(facts)) return facts.filter((f): f is string => typeof f === "string");
  return [];
}

/**
 * Compact, non-blocking arrival card. It never pauses the session, never plays a
 * sound and dismisses itself automatically.
 */
export function DiscoveryPopup({
  object,
  onDismiss,
  durationMs = 12_000,
}: {
  object: CelestialObject | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!object) return;
    const t = window.setTimeout(() => dismiss.current(), durationMs);
    return () => window.clearTimeout(t);
  }, [object?.id, durationMs]);

  if (!object) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
      <div className="panel animate-arrival pointer-events-auto w-full max-w-sm p-4 shadow-lg">
        <p className="label-tech">Destination reached</p>
        <div className="mt-2 flex gap-3">
          <CelestialImage src={object.image_url} alt={object.name} objectId={object.id} className="h-14 w-14 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-tight">{object.name}</h3>
            <p className="text-xs text-muted-foreground">
              {OBJECT_TYPE_LABEL[object.type] ?? object.type}
            </p>
          </div>
        </div>
        {object.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground/90">
            {object.description}
          </p>
        ) : null}
        <ul className="mt-2 space-y-1">
          {factList(object.facts)
            .slice(0, 6)
            .map((fact) => (
              <li key={fact} className="flex gap-2 text-xs text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span className="line-clamp-2">{fact}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
