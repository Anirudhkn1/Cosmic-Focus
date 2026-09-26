import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import "./PillNav.css";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export interface PillNavProps {
  logo?: string;
  logoElement?: React.ReactNode;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoverCircleBg?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  activeIndicatorColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoElement,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "oklch(0.2 0.04 265 / 0.85)",
  pillColor = "transparent",
  hoverCircleBg = "oklch(0.68 0.152 245)",
  hoveredPillTextColor = "#ffffff",
  pillTextColor = "oklch(0.85 0.02 250)",
  activeIndicatorColor = "oklch(0.68 0.152 245)",
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLDivElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.25, xPercent: -50, duration: 0.35, ease, overwrite: "auto" }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.35, ease, overwrite: "auto" }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.35, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0.8, opacity: 0 });
        gsap.to(logoEl, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease,
        });
      }

      if (navItems) {
        gsap.fromTo(
          navItems,
          { opacity: 0, y: -6 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease,
          }
        );
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const el = logoImgRef.current;
    if (!el) return;
    logoTweenRef.current?.kill();
    gsap.set(el, { rotate: 0 });
    logoTweenRef.current = gsap.to(el, {
      rotate: 360,
      duration: 0.5,
      ease,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (lines[0] && lines[1]) {
        if (newState) {
          gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.25, ease });
          gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.25, ease });
        } else {
          gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.25, ease });
          gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.25, ease });
        }
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.25,
            ease,
            transformOrigin: "top center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ["--base" as string]: baseColor,
    ["--pill-bg" as string]: pillColor,
    ["--hover-circle-bg" as string]: hoverCircleBg,
    ["--hover-text" as string]: hoveredPillTextColor,
    ["--pill-text" as string]: pillTextColor,
    ["--active-indicator" as string]: activeIndicatorColor,
  } as React.CSSProperties;

  const homeHref = items[0]?.href || "/";

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        {(logo || logoElement) && (
          <Link
            className="pill-logo"
            to={homeHref}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={logoRef}
          >
            <div ref={logoImgRef} className="flex h-full w-full items-center justify-center">
              {logoElement ? (
                logoElement
              ) : logo ? (
                <img src={logo} alt={logoAlt} className="h-full w-full object-contain" />
              ) : null}
            </div>
          </Link>
        )}

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const isActive = activeHref === item.href || (item.href !== "/" && activeHref?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href} role="none">
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={`pill${isActive ? " is-active" : ""}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover flex items-center gap-1.5" aria-hidden="true">
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map((item) => {
            const isActive = activeHref === item.href || (item.href !== "/" && activeHref?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`mobile-menu-link flex items-center gap-2${isActive ? " is-active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
