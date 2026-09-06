import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, Sparkles, Trophy, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvilEye from "@/components/EvilEye";
import BlurText from "@/components/BlurText";

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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ReactBits Evil Eye Background with adjusted brightness/opacity for high text readability */}
      <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 transition-opacity duration-1000">
          <EvilEye
            eyeColor="#FF6F37"
            intensity={0.85}
            glowIntensity={0.2}
            scale={0.85}
            pupilSize={0.55}
            pupilFollow={0.85}
            flameSpeed={0.75}
            backgroundColor="#0b0d19"
            className="h-full w-full"
          />
        </div>
        {/* Soft radial overlay so the text stays crisp and readable */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 15%, oklch(0.17 0.038 264 / 0.7) 65%, oklch(0.17 0.038 264 / 0.95) 100%)",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 backdrop-blur-[2px]">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] shadow-md">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">Cosmic Focus</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link to="/auth">
            <Button size="sm">Launch</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <BlurText
          as="p"
          text="Study focus · Mission control"
          delay={40}
          animateBy="words"
          direction="top"
          className="label-tech mb-4 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 backdrop-blur-md justify-center"
        />
        <h1 className="font-display text-5xl font-semibold tracking-tight drop-shadow-sm sm:text-7xl flex flex-col items-center">
          <BlurText text="Turn focus into" delay={90} animateBy="words" direction="top" className="justify-center" />
          <BlurText text="real distance" delay={110} animateBy="words" direction="top" className="text-gradient justify-center" />
        </h1>
        <p className="mt-6 max-w-xl text-base text-foreground/80 sm:text-lg">
          Every focused study session pushes your spacecraft further across the Solar System —
          from the Sun all the way to the Oort Cloud.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              Enter mission control
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="backdrop-blur-md">
              Create an account
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="panel bg-panel/85 p-6 text-left backdrop-blur-md transition-transform duration-200 hover:-translate-y-1"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-8 pt-10 text-center">
        <p className="label-tech">Cosmic Focus — mission control</p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Built with Lovable</span>
        </div>
      </footer>
    </div>
  );
}

