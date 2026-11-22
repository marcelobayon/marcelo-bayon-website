import { useMemo } from "react";
import "./MountainBackdrop.css";

/**
 * Pure CSS/SVG midnight-alpine backdrop — no WebGL. Gives the main site the
 * same world as the /resume railway at near-zero cost, and works everywhere.
 */
export default function MountainBackdrop({ stars = 70 }: { stars?: number }) {
  const starField = useMemo(() => {
    // Deterministic pseudo-random so SSR/client and re-renders match.
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    return Array.from({ length: stars }, () => ({
      x: rand() * 100,
      y: rand() * 62,
      r: rand() * 1.1 + 0.3,
      o: rand() * 0.6 + 0.2,
      tw: rand() * 4 + 2,
    }));
  }, [stars]);

  return (
    <div className="backdrop" aria-hidden="true">
      <svg
        className="backdrop__svg"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1020" />
            <stop offset="55%" stopColor="#0b1426" />
            <stop offset="100%" stopColor="#13213a" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eaf2ff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#cdd9ec" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#cdd9ec" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="farMtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22314c" />
            <stop offset="100%" stopColor="#1a2740" />
          </linearGradient>
          <linearGradient id="nearMtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c3c57" />
            <stop offset="100%" stopColor="#17263c" />
          </linearGradient>
        </defs>

        <rect width="1200" height="700" fill="url(#sky)" />

        {/* Moon */}
        <circle cx="930" cy="150" r="150" fill="url(#moonGlow)" />
        <circle cx="930" cy="150" r="42" fill="#eef4ff" opacity="0.92" />
        <circle cx="912" cy="140" r="42" fill="#0b1426" opacity="0.55" />

        {/* Stars */}
        <g className="backdrop__stars">
          {starField.map((s, i) => (
            <circle
              key={i}
              cx={s.x * 12}
              cy={s.y * 7}
              r={s.r}
              fill="#eaf2ff"
              opacity={s.o}
              style={{ animationDuration: `${s.tw}s` }}
            />
          ))}
        </g>

        {/* Far ridge */}
        <path
          d="M0 470 L180 360 L330 440 L520 320 L700 430 L880 340 L1050 430 L1200 380 L1200 700 L0 700 Z"
          fill="url(#farMtn)"
          opacity="0.85"
        />
        {/* Near peak with snow caps */}
        <path
          d="M0 560 L250 410 L430 520 L620 350 L820 520 L1000 430 L1200 540 L1200 700 L0 700 Z"
          fill="url(#nearMtn)"
        />
        <path d="M620 350 L672 400 L636 410 L604 386 Z" fill="#e6edf5" opacity="0.9" />
        <path d="M250 410 L292 450 L262 458 L232 436 Z" fill="#e6edf5" opacity="0.8" />
        <path d="M1000 430 L1040 470 L1012 476 L986 452 Z" fill="#e6edf5" opacity="0.75" />

        {/* Warm valley lights */}
        <circle cx="470" cy="600" r="3" fill="#fbbf24" className="backdrop__light" />
        <circle cx="505" cy="612" r="2.4" fill="#fbbf24" className="backdrop__light" />
        <circle cx="760" cy="596" r="2.6" fill="#fbbf24" className="backdrop__light" />
      </svg>
      <div className="backdrop__fade" />
    </div>
  );
}
