import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AVATAR_OPTIONS } from "@/components/cosmic/AstronautAvatar";
import { useMission } from "@/hooks/useMission";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import BlurText from "@/components/BlurText";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Crew Settings — Cosmic Focus" },
      {
        name: "description",
        content: "Update your call sign, astronaut avatar, sound cues and leaderboard visibility.",
      },
      { property: "og:title", content: "Crew Settings — Cosmic Focus" },
      { property: "og:description", content: "Call sign, avatar, sound cues and leaderboard visibility." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, userId, refresh } = useMission();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!profile) return <div className="label-tech py-20 text-center">Loading crew file…</div>;

  const patch = async (
    values: Partial<{
      display_name: string;
      avatar: string;
      leaderboard_visible: boolean;
      sound_enabled: boolean;
      break_beep_enabled: boolean;
    }>,
  ) => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update(values).eq("id", userId);
    setBusy(false);
    if (error) toast.error(error.message);
    else await refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="label-tech">Crew settings</p>
        <BlurText
          as="h1"
          text="Personnel file"
          delay={80}
          animateBy="words"
          direction="top"
          className="font-display text-3xl font-semibold"
        />
      </div>

      <section className="panel space-y-4 p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Call sign</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={name ?? profile.display_name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              disabled={busy}
              onClick={async () => {
                await patch({ display_name: (name ?? profile.display_name).trim() || "Astronaut" });
                toast.success("Call sign updated");
              }}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Avatar</Label>
          <div className="grid grid-cols-2 gap-3">
            {AVATAR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => void patch({ avatar: opt.id })}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors",
                  profile.avatar === opt.id
                    ? "border-primary bg-secondary shadow-glow"
                    : "border-border hover:bg-secondary/50",
                )}
              >
                <img src={opt.src} alt={opt.label} width={512} height={512} loading="lazy" className="h-16 w-16 rounded-full" />
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel space-y-4 p-5">
        <Toggle
          label="Show me on the leaderboard"
          checked={profile.leaderboard_visible}
          onChange={(v) => void patch({ leaderboard_visible: v })}
        />
        <Toggle
          label="Mission sound cues"
          checked={profile.sound_enabled}
          onChange={(v) => void patch({ sound_enabled: v })}
        />
        <Toggle
          label="Break start/end beeps"
          checked={profile.break_beep_enabled}
          onChange={(v) => void patch({ break_beep_enabled: v })}
        />
      </section>

      <Button
        variant="secondary"
        onClick={async () => {
          await signOut();
          void navigate({ to: "/" });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
