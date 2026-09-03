import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CelestialImage } from "./CelestialImage";
import { OBJECT_TYPE_LABEL, formatDistance } from "@/lib/cosmic/config";
import type { CelestialObject } from "@/lib/cosmic/api";

function factList(facts: unknown): string[] {
  if (Array.isArray(facts)) return facts.filter((f): f is string => typeof f === "string");
  return [];
}

export function ObjectDialog({
  object,
  discovered,
  onOpenChange,
}: {
  object: CelestialObject | null;
  discovered: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={object !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        {object ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{object.name}</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-4">
              <CelestialImage
                src={discovered ? object.image_url : null}
                alt={object.name}
                objectId={object.id}
                className="h-24 w-24 shrink-0"
              />
              <div className="space-y-1 text-sm">
                <div className="label-tech">{OBJECT_TYPE_LABEL[object.type] ?? object.type}</div>
                <div className="text-muted-foreground">
                  {formatDistance(Number(object.real_distance_from_sun))} from the Sun
                </div>
                {object.diameter ? (
                  <div className="text-muted-foreground">Diameter {object.diameter}</div>
                ) : null}
                {object.orbital_period ? (
                  <div className="text-muted-foreground">Orbit {object.orbital_period}</div>
                ) : null}
                {object.temperature ? (
                  <div className="text-muted-foreground">Temp {object.temperature}</div>
                ) : null}
              </div>
            </div>

            {discovered ? (
              <>
                <p className="text-sm leading-relaxed text-foreground/90">{object.description}</p>
                <ul className="space-y-2">
                  {factList(object.facts).map((fact) => (
                    <li key={fact} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {fact}
                    </li>
                  ))}
                </ul>
                {object.attribution ? (
                  <p className="text-[11px] text-muted-foreground">
                    {object.attribution}
                    {object.source_url ? (
                      <>
                        {" · "}
                        <a
                          className="underline hover:text-foreground"
                          href={object.source_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not yet discovered. Reach {object.name} on your journey to unlock its imagery,
                description and mission facts.
              </p>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
