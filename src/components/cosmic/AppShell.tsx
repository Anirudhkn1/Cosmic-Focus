import React, { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Gauge,
  Map as MapIcon,
  Rocket,
  Settings as SettingsIcon,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AstronautAvatar } from "./AstronautAvatar";
import { useMission } from "@/hooks/useMission";
import { XpBar } from "./XpBar";
import { OptionWheel } from "@/components/OptionWheel";

const NAV = [
  { to: "/mission", label: "Mission", icon: Rocket },
  { to: "/focus", label: "Focus", icon: Compass },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/discoveries", label: "Log", icon: Sparkles },
  { to: "/stats", label: "Stats", icon: Gauge },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
] as const;

type NavItem = (typeof NAV)[number];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useMission();
  const navigate = useNavigate();

  const activeIndex = NAV.findIndex((item) => pathname.startsWith(item.to));
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const wheelItems = NAV.map((item) => ({
    label: item.label,
    to: item.to,
    icon: item.icon as React.ComponentType<{ className?: string }>,
  }));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/mission" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)]">
              <Rocket className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight sm:text-base">
              Cosmic Focus
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden w-40 lg:block">
              <XpBar xp={profile?.xp ?? 0} />
            </div>
            <Link to="/settings" aria-label="Settings" className="text-muted-foreground hover:text-foreground">
              <SettingsIcon className="h-4 w-4" />
            </Link>
            <Link to="/settings">
              <AstronautAvatar avatar={profile?.avatar} className="h-9 w-9" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-40 pt-6 md:pb-12">{children}</main>

      {/* Mobile bottom semicircular wheel nav */}
      <OptionWheel
        items={wheelItems}
        activeIndex={safeActiveIndex}
        textColor="oklch(0.65 0.03 260)"
        activeColor="#e8e4ff"
        fontSize={1.05}
        spacing={1.45}
        curve={1}
        tilt={5}
        blur={1.5}
        fade={0.28}
        smoothing={160}
        inset={68}
        draggable
        onNavigate={(to) => void navigate({ to: to as NavItem["to"] })}
        onChange={(index) => {
          const item = NAV[index];
          if (item) void navigate({ to: item.to });
        }}
      />
    </div>
  );
}
