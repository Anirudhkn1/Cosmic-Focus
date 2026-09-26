import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AstronautAvatar } from "@/components/cosmic/AstronautAvatar";
import { leaderboardQuery } from "@/lib/cosmic/api";
import { useMission } from "@/hooks/useMission";
import { formatFocusTime } from "@/lib/cosmic/config";
import { cn } from "@/lib/utils";
import BlurText from "@/components/BlurText";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Crew Rankings — Cosmic Focus" },
      {
        name: "description",
        content: "Weekly global leaderboard of focused study time across every Cosmic Focus crew.",
      },
      { property: "og:title", content: "Crew Rankings — Cosmic Focus" },
      { property: "og:description", content: "Weekly global leaderboard of focused study time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { userId } = useMission();
  const { data, isLoading } = useQuery(leaderboardQuery);
  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="label-tech">Crew rankings</p>
        <BlurText
          as="h1"
          text="This week in orbit"
          delay={80}
          animateBy="words"
          direction="top"
          className="font-display text-3xl font-semibold"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by XP earned since Monday. Only crews with leaderboard visibility enabled appear.
        </p>
      </div>

      <section className="panel p-2 sm:p-4">
        {isLoading ? (
          <p className="label-tech p-6 text-center">Downlinking rankings…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No focus logged this week yet. Be the first crew on the board.
          </p>
        ) : (
          <ol>
            {rows.map((row, i) => (
              <li
                key={row.user_id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5",
                  row.user_id === userId ? "bg-secondary" : "",
                )}
              >
                <span className="w-6 font-mono text-sm text-muted-foreground">{i + 1}</span>
                <AstronautAvatar avatar={row.avatar} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{row.display_name}</div>
                  <div className="label-tech">
                    Lv {row.level} · {row.rank}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{Number(row.weekly_xp)} XP</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFocusTime(Number(row.weekly_minutes))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
