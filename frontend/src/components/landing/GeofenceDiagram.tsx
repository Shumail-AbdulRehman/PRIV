import { useEffect, useState } from "react";

export function GeofenceDiagram() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <figure className="relative w-full" style={{ aspectRatio: "16/10" }} aria-label="Geofence verification diagram">
      <svg
        viewBox="0 0 320 200"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <defs>
          <style>
            {`
              @keyframes geofence-rotate {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: -40; }
              }
              .geofence-circle {
                animation: geofence-rotate 20s linear infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .geofence-circle {
                  animation: none;
                }
              }
            `}
          </style>
        </defs>

        {/* Dashed geofence circle */}
        <circle
          cx="120"
          cy="100"
          r="80"
          stroke="var(--line)"
          strokeWidth="1"
          strokeDasharray="6 4"
          className={prefersReducedMotion ? "" : "geofence-circle"}
        />

        {/* Location pin: outer circle */}
        <circle cx="120" cy="100" r="18" stroke="var(--ink)" strokeWidth="1.5" />
        {/* Location pin: center dot */}
        <circle cx="120" cy="100" r="4" fill="var(--primary)" />
        {/* Crosshair ticks */}
        <line x1="120" y1="78" x2="120" y2="84" stroke="var(--ink)" strokeWidth="1" />
        <line x1="120" y1="116" x2="120" y2="122" stroke="var(--ink)" strokeWidth="1" />
        <line x1="98" y1="100" x2="104" y2="100" stroke="var(--ink)" strokeWidth="1" />
        <line x1="136" y1="100" x2="142" y2="100" stroke="var(--ink)" strokeWidth="1" />

        {/* QR token label box */}
        <rect x="205" y="72" width="90" height="28" rx="2" stroke="var(--ink)" strokeWidth="1" fill="var(--surface)" />
        <text x="212" y="84" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.04em">
          QR TOKEN
        </text>
        <text x="212" y="94" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.02em">
          tkn_8f2a1d3c
        </text>

        {/* Inspection stamp */}
        <rect x="195" y="132" width="110" height="56" rx="2" stroke="var(--ink)" strokeWidth="1" fill="var(--surface)" />
        <text x="205" y="152" fill="var(--status-complete)" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600" letterSpacing="0.08em">
          VERIFIED
        </text>
        <text x="205" y="168" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.02em">
          LOC 94
        </text>
        <text x="205" y="180" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.02em">
          CLEAN 91
        </text>

        {/* Small coordinate label */}
        <text x="48" y="184" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="7" opacity="0.7">
          24.8607°N 67.0011°E
        </text>
      </svg>
    </figure>
  );
}
