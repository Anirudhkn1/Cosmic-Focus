import { cn } from "@/lib/utils";

interface Props {
  moving: boolean;
  className?: string;
  size?: number;
}

/** Technical side-view spacecraft with an animated thruster plume. */
export function Spacecraft({ moving, className, size = 56 }: Props) {
  return (
    <div className={cn("relative flex items-center", className)} style={{ width: size * 1.6 }}>
      <div
        className={cn(
          "absolute right-full mr-[-2px] h-[6px] origin-right rounded-full",
          "bg-[linear-gradient(90deg,transparent,var(--color-warning),var(--color-primary))]",
          moving ? "w-8 animate-thruster" : "w-0 opacity-0",
        )}
      />
      <svg
        width={size * 1.6}
        height={size}
        viewBox="0 0 80 50"
        fill="none"
        role="img"
        aria-label="Spacecraft"
        className={cn(moving ? "" : "animate-drift")}
      >
        <path
          d="M6 25 C6 17 20 11 40 11 L58 11 C68 11 74 17 74 25 C74 33 68 39 58 39 L40 39 C20 39 6 33 6 25 Z"
          fill="var(--color-panel)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        <path d="M40 11 L52 2 L58 11 Z" fill="var(--color-primary)" opacity="0.85" />
        <path d="M40 39 L52 48 L58 39 Z" fill="var(--color-primary)" opacity="0.85" />
        <circle cx="62" cy="25" r="5.5" fill="var(--color-primary)" opacity="0.9" />
        <circle cx="62" cy="25" r="2.4" fill="var(--color-background)" opacity="0.7" />
        <rect x="18" y="21" width="18" height="8" rx="3" fill="var(--color-secondary)" />
        <rect x="8" y="20" width="6" height="10" rx="2" fill="var(--color-accent)" />
        <line x1="30" y1="11" x2="30" y2="39" stroke="var(--color-border)" strokeWidth="1" />
      </svg>
    </div>
  );
}
