import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Flame, Rocket, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JourneyTrack } from "@/components/cosmic/JourneyTrack";
import { StatCard } from "@/components/cosmic/StatCard";
import { XpBar } from "@/components/cosmic/XpBar";
import { AstronautAvatar } from "@/components/cosmic/AstronautAvatar";
import { CelestialImage } from "@/components/cosmic/CelestialImage";
import { useLiveSession } from "@/hooks/useLiveSession";
import { formatAu, formatClock, formatFocusTime, OBJECT_TYPE_LABEL } from "@/lib/cosmic/config";

export const Route = createFileRoute("/_authenticated/mission")({
  head: () => ({
    meta: [
      { title: "Mission Control — Cosmic Focus" },
      {
        name: "description",
        content:
          "Live mission control: track your spacecraft's position, current objective and focus streak across the Solar System.",
      },
      { property: "og:title", content: "Mission Control — Cosmic Focus" },
      {
        property: "og:description",
        content: "Track your spacecraft's position, objective and focus streak in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const navigate = useNavigate();
  const { mission, session, progress, running, elapsedSeconds } = useLiveSession();
  const { profile, currentObject, destination, requiredMinutes, discoveredIds, loading } = mission;

  useEffect(() => {
    if (!loading && profile && !profile.onboarded) void navigate({ to: "/onboarding" });
  }, [loading, profile, navigate]);

  if (loading || !profile) {
    return <div className="label-tech py-20 text-center">Establishing telemetry link…</div>;
  }

  const remainingMinutes = Math.max(0, (1 - progress) * requiredMinutes);

  return (
    <div className="space-y-6">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <AstronautAvatar avatar={profile.avatar} className="h-14 w-14" />
          <div className="min-w-0 flex-1">
            <p className="label-tech">Commander</p>
            <h1 className="truncate font-display text-2xl font-semibold">{profile.display_name}</h1>
          </div>
          <div className="w-full sm:w-64">
            <XpBar xp={profile.xp} />
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-tech">Current objective</p>
            <h2 className="font-display text-xl font-semibold">
              {destination ? `Transit to ${destination.name}` : "Journey complete"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {destination
                ? `${formatFocusTime(remainingMinutes)} of focus remaining · ${requiredMinutes} min segment`
                : "You have reached the outer edge of the Solar System."}
            </p>
          </div>
          <div className="text-right">
            <p className="label-tech">Status</p>
            <p className="font-mono text-sm">
              {running ? "BURN ACTIVE" : session ? "HOLD / PAUSED" : "STANDBY"}
            </p>
            {session ? (
              <p className="font-mono text-xs text-muted-foreground">{formatClock(elapsedSeconds)}</p>
            ) : null}
          </div>
        </div>

        <JourneyTrack
          originName={currentObject?.name ?? "Sun"}
          originImage={currentObject?.image_url ?? null}
          originId={currentObject?.id}
          destinationName={destination?.name ?? "Oort Cloud"}
          destinationImage={destination?.image_url ?? null}
          destinationId={destination?.id}
          progress={progress}
          moving={running === true}
        />

        <div className="mt-2 flex flex-wrap gap-3">
          <Link to="/focus">
            <Button size="lg">
              <Rocket className="mr-2 h-4 w-4" />
              {session ? "Return to flight deck" : "Start focus session"}
            </Button>
          </Link>
          <Link to="/map">
            <Button size="lg" variant="secondary">
              View journey map
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total focus"
          value={formatFocusTime(Number(profile.total_focus_minutes))}
          hint={`${profile.completed_sessions} sessions logged`}
          icon={<Timer className="h-4 w-4" />}
        />
        <StatCard
          label="Streak"
          value={`${profile.current_streak} days`}
          hint={`Longest ${profile.longest_streak} days`}
          icon={<Flame className="h-4 w-4" />}
        />
        <StatCard
          label="Discoveries"
          value={`${discoveredIds.size} / ${mission.objects.length}`}
          hint="Celestial objects logged"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label="Distance from Sun"
          value={formatAu(Number(currentObject?.real_distance_from_sun ?? 0))}
          hint={currentObject ? (OBJECT_TYPE_LABEL[currentObject.type] ?? currentObject.type) : ""}
          icon={<Rocket className="h-4 w-4" />}
        />
      </section>

      {destination ? (
        <section className="panel p-5">
          <p className="label-tech">Next destination briefing</p>
          <div className="mt-3 flex items-center gap-4">
            <CelestialImage
              src={discoveredIds.has(destination.id) ? destination.image_url : null}
              alt={destination.name}
              objectId={destination.id}
              className="h-16 w-16"
            />
            <div>
              <h3 className="font-display text-lg font-semibold">{destination.name}</h3>
              <p className="text-sm text-muted-foreground">
                {OBJECT_TYPE_LABEL[destination.type] ?? destination.type} ·{" "}
                {formatAu(Number(destination.real_distance_from_sun))} from the Sun
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
