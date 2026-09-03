import { levelProgress, rankForLevel } from "@/lib/cosmic/config";

export function XpBar({ xp }: { xp: number }) {
  const { level, into, span, pct } = levelProgress(xp);
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className="label-tech">
          Level {level} · {rankForLevel(level)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {Math.round(into)} / {Math.round(span)} XP
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
