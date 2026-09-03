import { useMemo } from "react";
import { bodyArt } from "@/lib/cosmic/bodyArt";
import { cn } from "@/lib/utils";

/** Deterministic pseudo-random generator so a body always looks identical. */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

interface Props {
  id: string;
  name: string;
  className?: string | undefined;
}

/**
 * Inline SVG rendering of a celestial body — recognisable colours, bands,
 * rings, craters and terrain, with zero network cost.
 */
export function CelestialBody({ id, name, className }: Props) {
  const art = bodyArt(id);
  const uid = useMemo(() => `cb-${id}`, [id]);
  const R = 38;
  const C = 50;

  const craters = useMemo(() => {
    if (!art.craters) return [];
    const rand = rng(id);
    const n = art.craters * 5;
    const out: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * (R - 6);
      out.push({ x: C + Math.cos(a) * d, y: C + Math.sin(a) * d, r: 1.6 + rand() * 3.6 });
    }
    return out;
  }, [id, art.craters]);

  const streaks = useMemo(() => {
    if (!art.streaks) return [];
    const rand = rng(`${id}-s`);
    return Array.from({ length: 7 }, () => {
      const y = C - R + rand() * R * 2;
      const y2 = C - R + rand() * R * 2;
      return `M ${C - R} ${y} Q ${C} ${y + (rand() - 0.5) * 26} ${C + R} ${y2}`;
    });
  }, [id, art.streaks]);

  const swarm = useMemo(() => {
    if (!art.swarm) return [];
    const rand = rng(`${id}-w`);
    const style = art.swarm.style;
    return Array.from({ length: art.swarm.count }, () => {
      const a = rand() * Math.PI * 2;
      if (style === "belt") {
        // wide, thin ring with gaps: skip particles in two angular gaps
        const gap = (a > 0.35 && a < 0.75) || (a > 3.6 && a < 3.95);
        const d = 27 + rand() * 21;
        const rr = 0.5 + rand() * rand() * 3.4;
        return {
          x: C + Math.cos(a) * d,
          y: C + Math.sin(a) * d * 0.2,
          r: rr,
          o: gap ? 0.12 : 0.55 + rand() * 0.45,
          rot: rand() * 360,
          sq: rand() > 0.35,
        };
      }
      if (style === "shell") {
        // diffuse spherical shell — dense near the rim, sparse inside
        const d = 12 + Math.pow(rand(), 0.35) * 36;
        return {
          x: C + Math.cos(a) * d,
          y: C + Math.sin(a) * d,
          r: 0.35 + rand() * 0.85,
          o: 0.15 + rand() * 0.5,
          rot: 0,
          sq: false,
        };
      }
      const d = art.swarm!.ring ? 24 + rand() * 20 : Math.sqrt(rand()) * 44;
      return {
        x: C + Math.cos(a) * d,
        y: C + Math.sin(a) * d * 0.42,
        r: 0.7 + rand() * 1.6,
        o: 0.85,
        rot: 0,
        sq: false,
      };
    });
  }, [id, art.swarm]);

  const [lit, mid, dark] = art.base;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={name}
      className={cn("shrink-0 overflow-visible drop-shadow-[0_0_10px_rgba(120,170,255,0.18)]", className)}
    >
      <defs>
        <radialGradient id={`${uid}-g`} cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor={lit} />
          <stop offset="52%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          {art.irregular ? (
            <path d="M50 12 C 68 12, 86 26, 87 46 C 88 66, 72 88, 52 88 C 32 88, 13 72, 12 51 C 11 31, 32 12, 50 12 Z" />
          ) : (
            <circle cx={C} cy={C} r={R} />
          )}
        </clipPath>
        <radialGradient id={`${uid}-shade`} cx="32%" cy="28%" r="80%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {art.glow ? <circle cx={C} cy={C} r={R + 9} fill={art.glow} opacity={0.28} /> : null}

      {art.ring ? (
        <g opacity={0.9}>
          <ellipse
            cx={C}
            cy={C}
            rx={R + 14}
            ry={(R + 14) * 0.28}
            fill="none"
            stroke={art.ring}
            strokeWidth={5}
            opacity={0.75}
            transform={`rotate(-18 ${C} ${C})`}
          />
          <ellipse
            cx={C}
            cy={C}
            rx={R + 7}
            ry={(R + 7) * 0.28}
            fill="none"
            stroke={art.ring}
            strokeWidth={2}
            opacity={0.5}
            transform={`rotate(-18 ${C} ${C})`}
          />
        </g>
      ) : null}

      {art.swarm ? (
        <g fill={art.swarm.color}>
          {art.swarm.style === "belt" ? (
            <>
              {/* faint orbital plane band */}
              <ellipse cx={C} cy={C} rx={48} ry={10} fill="none" stroke={art.swarm.color} strokeWidth={0.6} opacity={0.18} />
              <ellipse cx={C} cy={C} rx={27} ry={5.4} fill="none" stroke={art.swarm.color} strokeWidth={0.5} opacity={0.14} />
              {/* the Sun the belt surrounds */}
              <circle cx={C} cy={C} r={4.5} fill="#ffcc4d" opacity={0.85} />
              <circle cx={C} cy={C} r={8} fill="#ffb020" opacity={0.15} />
            </>
          ) : null}
          {art.swarm.style === "shell" ? (
            <>
              <circle cx={C} cy={C} r={46} fill="none" stroke={art.swarm.color} strokeWidth={0.5} opacity={0.16} />
              <circle cx={C} cy={C} r={46} fill={art.swarm.color} opacity={0.05} />
              <circle cx={C} cy={C} r={30} fill="none" stroke={art.swarm.color} strokeWidth={0.4} opacity={0.1} />
              {/* the tiny Solar System enclosed by the shell */}
              <circle cx={C} cy={C} r={1.8} fill="#ffcc4d" opacity={0.9} />
              <ellipse cx={C} cy={C} rx={8} ry={3} fill="none" stroke="#9fb8d6" strokeWidth={0.4} opacity={0.35} />
            </>
          ) : null}
          {swarm.map((s, i) =>
            s.sq ? (
              <rect
                key={i}
                x={s.x - s.r}
                y={s.y - s.r * 0.75}
                width={s.r * 2}
                height={s.r * 1.5}
                rx={s.r * 0.35}
                opacity={s.o}
                transform={`rotate(${s.rot} ${s.x} ${s.y})`}
              />
            ) : (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
            ),
          )}
        </g>
      ) : (
        <>
          {art.irregular ? (
            <path
              d="M50 12 C 68 12, 86 26, 87 46 C 88 66, 72 88, 52 88 C 32 88, 13 72, 12 51 C 11 31, 32 12, 50 12 Z"
              fill={`url(#${uid}-g)`}
            />
          ) : (
            <circle cx={C} cy={C} r={R} fill={`url(#${uid}-g)`} />
          )}

          <g clipPath={`url(#${uid}-clip)`}>
            {art.bands?.map(([y, h, color, o], i) => (
              <rect key={i} x={0} y={(y - h / 2) * 100} width={100} height={h * 100} fill={color} opacity={o} />
            ))}

            {art.blobs?.map(([cx, cy, rx, ry, rot, color, o], i) => (
              <ellipse
                key={i}
                cx={cx * 100}
                cy={cy * 100}
                rx={rx * 100}
                ry={ry * 100}
                fill={color}
                opacity={o}
                transform={`rotate(${rot} ${cx * 100} ${cy * 100})`}
              />
            ))}

            {art.spot ? (
              <ellipse
                cx={art.spot[0] * 100}
                cy={art.spot[1] * 100}
                rx={art.spot[2] * 100}
                ry={art.spot[3] * 100}
                fill={art.spot[4]}
                opacity={0.9}
              />
            ) : null}

            {streaks.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={art.streaks} strokeWidth={1.1} opacity={0.55} />
            ))}

            {craters.map((c, i) => (
              <g key={i}>
                <circle cx={c.x} cy={c.y} r={c.r} fill="#000" opacity={0.22} />
                <circle cx={c.x - c.r * 0.25} cy={c.y - c.r * 0.25} r={c.r * 0.8} fill="#fff" opacity={0.13} />
              </g>
            ))}

            {art.clouds ? (
              <g fill={art.clouds} opacity={0.4}>
                <ellipse cx={34} cy={32} rx={20} ry={6} />
                <ellipse cx={62} cy={52} rx={24} ry={5} />
                <ellipse cx={44} cy={72} rx={18} ry={5} />
              </g>
            ) : null}

            <circle cx={C} cy={C} r={R} fill={`url(#${uid}-shade)`} />
          </g>
        </>
      )}
    </svg>
  );
}
