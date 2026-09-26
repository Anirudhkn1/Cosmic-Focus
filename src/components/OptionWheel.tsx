import React, { useCallback, useEffect, useRef, useState } from "react";
import "./OptionWheel.css";

export interface OptionWheelItem {
  label: string;
  to: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface OptionWheelProps {
  items: OptionWheelItem[];
  activeIndex?: number;
  textColor?: string;
  activeColor?: string;
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  smoothing?: number;
  inset?: number;
  draggable?: boolean;
  onChange?: (index: number, item: OptionWheelItem) => void;
  onNavigate?: (to: string) => void;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const OptionWheel: React.FC<OptionWheelProps> = ({
  items,
  activeIndex: controlledIndex,
  textColor = "rgba(166,166,166,0.85)",
  activeColor = "#ffffff",
  fontSize = 2.8,
  spacing = 1.5,
  curve = 1,
  tilt = 5,
  blur = 1.8,
  fade = 0.22,
  smoothing = 180,
  inset = 72,
  draggable = true,
  onChange,
  onNavigate,
}) => {
  const count = items.length;
  const [current, setCurrent] = useState(controlledIndex ?? 0);
  const [visual, setVisual] = useState(controlledIndex ?? 0);
  const rafRef = useRef<number>(0);
  const dragStart = useRef<{ y: number; idx: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync controlled index
  useEffect(() => {
    if (controlledIndex !== undefined) {
      setCurrent(controlledIndex);
      setVisual(controlledIndex);
    }
  }, [controlledIndex]);

  // Smooth visual animation toward current
  useEffect(() => {
    let prev = visual;
    const step = () => {
      prev = lerp(prev, current, 1 - Math.exp(-16 / smoothing));
      setVisual(prev);
      if (Math.abs(prev - current) > 0.003) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setVisual(current);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, smoothing]);

  const select = useCallback(
    (idx: number) => {
      const clamped = clamp(idx, 0, count - 1);
      setCurrent(clamped);
      onChange?.(clamped, items[clamped]!);
    },
    [count, onChange, items]
  );

  const handleItemClick = (idx: number) => {
    select(idx);
    onNavigate?.(items[idx]!.to);
  };

  // Drag/swipe support — horizontal swipe maps to wheel index
  const onPointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    dragStart.current = { y: e.clientX, idx: current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const delta = (e.clientX - dragStart.current.y) / 70;
    const next = Math.round(dragStart.current.idx - delta);
    setCurrent(clamp(next, 0, count - 1));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const delta = (e.clientX - dragStart.current.y) / 70;
    const next = Math.round(dragStart.current.idx - delta);
    const clamped = clamp(next, 0, count - 1);
    dragStart.current = null;
    select(clamped);
    onNavigate?.(items[clamped]!.to);
  };

  return (
    <div className="option-wheel-wrapper" ref={containerRef}>
      <div
        className="option-wheel-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragStart.current = null; }}
        style={{ touchAction: "none" }}
      >
        {items.map((item, i) => {
          const dist = i - visual;
          // Arc angle: spread items in a semicircle at the bottom
          const halfSpread = (count - 1) / 2;
          const normDist = (i - visual) / Math.max(1, halfSpread);
          const angle = normDist * spacing * 18 * curve; // degrees from center
          const rad = (angle * Math.PI) / 180;

          // Position on a bottom-arc (x spreads out, y curves up from bottom)
          const xPercent = Math.sin(rad) * 50;
          const yOffset = (1 - Math.cos(rad)) * inset; // curves up from baseline

          const absDist = Math.abs(dist);
          const isActive = i === Math.round(visual);

          const opacity = isActive
            ? 1
            : Math.max(fade, 1 - absDist * (1 - fade) / (count / 2));

          const blurVal = isActive ? 0 : absDist * blur;
          const scale = isActive ? 1 : Math.max(0.72, 1 - absDist * 0.08);
          const tiltDeg = -normDist * tilt;

          const Icon = item.icon;

          return (
            <button
              key={item.to}
              className={`option-wheel-item${isActive ? " is-active" : ""}`}
              onClick={() => handleItemClick(i)}
              style={{
                fontSize: `${isActive ? fontSize : fontSize * 0.88}rem`,
                color: isActive ? activeColor : textColor,
                opacity,
                filter: blurVal > 0 ? `blur(${blurVal}px)` : "none",
                transform: `translateX(calc(-50% + ${xPercent}vw)) translateY(-${yOffset}px) scale(${scale}) rotate(${tiltDeg}deg)`,
                willChange: "transform, opacity, filter",
              }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon && (
                <Icon
                  className={`option-wheel-icon${isActive ? " is-active" : ""}`}
                />
              )}
              <span className="option-wheel-label">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Active indicator dot */}
      <div className="option-wheel-indicator" />
    </div>
  );
};

export default OptionWheel;
