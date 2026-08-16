import { CelestialImage } from "./CelestialImage";
import { Spacecraft } from "./Spacecraft";
import { clamp01 } from "@/lib/cosmic/config";

interface Props {
  originName: string;
  originImage: string | null;
  originId?: string | undefined;
  destinationName: string;
  destinationImage: string | null;
  destinationId?: string | undefined;
  progress: number;
  moving: boolean;
}

/** Origin → destination travel lane with the live spacecraft position. */
export function JourneyTrack({
  originName,
  originImage,
  originId,
  destinationName,
  destinationImage,
  destinationId,
  progress,
  moving,
}: Props) {
  const pct = clamp01(progress) * 100;

  return (
    <div className="relative">
      <div className="starfield-layer pointer-events-none absolute inset-0 rounded-xl opacity-70" />
      <div className="relative flex items-center gap-3 px-1 py-8 sm:gap-5">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <CelestialImage
            src={originImage}
            alt={originName}
            objectId={originId}
            className="h-12 w-12 sm:h-16 sm:w-16"
          />
          <span className="label-tech">{originName}</span>
        </div>

        <div className="relative h-1.5 flex-1 rounded-full bg-secondary">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-700 ease-linear"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-linear"
            style={{ left: `${pct}%` }}
          >
            <Spacecraft moving={moving} size={34} />
          </div>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">
            {pct.toFixed(1)}%
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          <CelestialImage
            src={destinationImage}
            alt={destinationName}
            objectId={destinationId}
            className="h-12 w-12 sm:h-16 sm:w-16"
          />
          <span className="label-tech">{destinationName}</span>
        </div>
      </div>
    </div>
  );
}
