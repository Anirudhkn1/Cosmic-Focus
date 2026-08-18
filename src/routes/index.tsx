import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, Sparkles, Trophy, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cosmic Focus — Study Focus Mission Control" },
      {
        name: "description",
        content:
          "Turn focused study time into real distance travelled across the Solar System, from the Sun to the Oort Cloud.",
      },
      { property: "og:title", content: "Cosmic Focus — Study Focus Mission Control" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  {
    icon: Compass,
    title: "Focus sessions",
    body: "Every minute of distraction-free study becomes burn time for your spacecraft.",
  },
  {
    icon: Rocket,
    title: "Real distance",
    body: "Progress through the Solar System — Sun to Oort Cloud — powered by your focus.",
  },
  {
    icon: Trophy,
    title: "Crew ranks",
    body: "Climb the leaderboard and earn your place among the top astronauts.",
  },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)]">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">Cosmic Focus</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link to="/auth">
            <Button size="sm">Launch</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="label-tech mb-4">Study focus · Mission control</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">
          Turn focus into
          <br />
          <span className="text-gradient">real distance</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Every focused study session pushes your spacecraft further across the Solar System —
          from the Sun all the way to the Oort Cloud.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth">
            <Button size="lg">Enter mission control</Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline">
              Create an account
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel p-6 text-left">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-10 text-center">
        <p className="label-tech">Cosmic Focus — mission control</p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Built with Lovable</span>
        </div>
      </footer>
    </div>
  );
}
