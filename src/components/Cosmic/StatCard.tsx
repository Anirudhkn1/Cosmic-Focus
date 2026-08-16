import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="label-tech">{label}</span>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
