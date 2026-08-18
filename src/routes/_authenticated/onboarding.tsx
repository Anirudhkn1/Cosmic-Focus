import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVATAR_OPTIONS } from "@/components/cosmic/AstronautAvatar";
import { useMission } from "@/hooks/useMission";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Crew setup — Cosmic Focus" },
      { name: "description", content: "Choose your call sign and astronaut avatar before launch." },
      { property: "og:title", content: "Crew setup — Cosmic Focus" },
      { property: "og:description", content: "Choose your call sign and astronaut avatar before launch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { profile, userId, refresh } = useMission();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("astronaut_male");
  const [busy, setBusy] = useState(false);

  const displayName = name || profile?.display_name || "Astronaut";

  const submit = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        avatar,
        gender: avatar === "astronaut_female" ? "female" : "male",
        onboarded: true,
      })
      .eq("id", userId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Launch pad ready. Ignition at your command.");
    void navigate({ to: "/mission" });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <div>
        <p className="label-tech">Pre-flight</p>
        <h1 className="font-display text-3xl font-semibold">Prepare for launch</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your spacecraft is docked at the Sun. Set your call sign and suit before the first burn.
        </p>
      </div>

      <div className="panel space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="callsign">Call sign</Label>
          <Input
            id="callsign"
            value={name}
            placeholder={profile?.display_name ?? "Astronaut"}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Astronaut avatar</Label>
          <div className="grid grid-cols-2 gap-3">
            {AVATAR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAvatar(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                  avatar === opt.id
                    ? "border-primary bg-secondary shadow-glow"
                    : "border-border hover:bg-secondary/50",
                )}
              >
                <img src={opt.src} alt={opt.label} width={512} height={512} loading="lazy" className="h-20 w-20 rounded-full" />
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={submit} disabled={busy}>
          {busy ? "Configuring…" : "Enter mission control"}
        </Button>
      </div>
    </div>
  );
}
