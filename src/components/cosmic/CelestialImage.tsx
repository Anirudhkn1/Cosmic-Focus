import { cn } from "@/lib/utils";
import { CelestialBody } from "./CelestialBody";

interface Props {
  /** Legacy photo source. `null` means the object is still locked. */
  src: string | null;
  alt: string;
  /** Celestial object id — drives the stylized rendering. */
  objectId?: string | undefined;
  className?: string | undefined;
  eager?: boolean | undefined;
}

/** Round celestial body visual with a locked-state fallback. */
export function CelestialImage({ src, alt, objectId, className }: Props) {
  if (src && objectId) {
    return <CelestialBody id={objectId} name={alt} className={className} />;
  }

  return (
    <div
      aria-label={alt}
      role="img"
      className={cn(
        "rounded-full border border-border bg-panel shadow-glow",
        "bg-[radial-gradient(circle_at_30%_28%,var(--color-muted-foreground),var(--color-background))]",
        className,
      )}
    />
  );
}
