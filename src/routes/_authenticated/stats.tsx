import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/cosmic/StatCard";
import { useMission, useRecentSessions } from "@/hooks/useMission";
import { formatFocusTime, getMethod } from "@/lib/cosmic/config";
import BlurText from "@/components/BlurText";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({
    meta: [
      { title: "Flight Statistics — Cosmic Focus" },
      {
        name: "description",
        content: "Session history, focus totals, streaks and XP earned across your Solar System mission.",
      },
      { property: "og:title", content: "Flight Statistics — Cosmic Focus" },
      { property: "og:description", content: "Session history, focus totals, streaks and XP earned." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { profile, discoveredIds, objects } = useMission();
  const sessions = useRecentSessions();

  const rows = sessions.data ?? [];
  const last7 = rows.filter(
    (s) => new Date(s.start_time).getTime() > Date.now() - 7 * 86_400_000,
  );
  const weekMinutes = last7.reduce((sum, s) => sum + Number(s.actual_duration), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="label-tech">Flight statistics</p>
        <BlurText
          as="h1"
          text="Mission performance"
          delay={80}
          animateBy="words"
          direction="top"
          className="font-display text-3xl font-semibold"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total focus" value={formatFocusTime(Number(profile?.total_focus_minutes ?? 0))} />
        <StatCard label="This week" value={formatFocusTime(weekMinutes)} hint={`${last7.length} sessions`} />
        <StatCard label="Total XP" value={`${profile?.xp ?? 0}`} hint={profile?.rank ?? "Cadet"} />
        <StatCard
          label="Discoveries"
          value={`${discoveredIds.size} / ${objects.length}`}
          hint={`Streak ${profile?.current_streak ?? 0} days`}
        />
      </div>

      <section className="panel p-5">
        <p className="label-tech">Session history</p>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No completed sessions yet. Your first burn will appear here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {rows.slice(0, 30).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <div className="font-medium">{getMethod(s.method).name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.start_time).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{formatFocusTime(Number(s.actual_duration))}</div>
                  <div className="text-xs text-muted-foreground">
                    +{s.xp_earned} XP{s.destination_reached ? " · arrival" : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
