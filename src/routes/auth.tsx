import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Cosmic Focus" },
      { name: "description", content: "Sign in to your Cosmic Focus mission control." },
      { property: "og:title", content: "Sign in — Cosmic Focus" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user) void navigate({ to: "/mission" });
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back, astronaut.");
        void navigate({ to: "/mission" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Crew member created. Prepare for launch.");
        void navigate({ to: "/mission" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)]">
          <Rocket className="h-4 w-4 text-primary-foreground" />
        </span>
        <span className="font-display text-base font-semibold tracking-tight">Cosmic Focus</span>
      </Link>

      <div className="panel w-full max-w-sm p-7">
        <p className="label-tech">Mission control</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          {mode === "signin" ? "Welcome back, astronaut" : "Create your crew account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to resume your journey across the Solar System."
            : "Register to begin your mission from the Sun."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy
              ? "Contacting ground control…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{mode === "signin" ? "New to the crew?" : "Already have an account?"}</span>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className={cn(
              "cursor-pointer font-medium text-primary underline-offset-4 hover:underline",
            )}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
