import { useState } from "react";

const singleArea = {
  area: "sink_area",
  loc: 94,
  clean: 91,
  reason: "fixtures align; minor streaks on mirror",
};

const multiAreas = [
  { area: "SINK", loc: 94, clean: 91, reason: "counter geometry matches reference" },
  { area: "MIRROR", loc: 88, clean: 87, reason: "reflection aligns; minor streaks noted" },
  { area: "FLOOR", loc: 96, clean: 93, reason: "tile pattern and grout lines match" },
];

function RoomSketch() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
      {/* Corner walls */}
      <line x1="20" y1="140" x2="20" y2="40" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="20" y1="40" x2="180" y2="40" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="20" y1="140" x2="180" y2="140" stroke="var(--ink)" strokeWidth="1" />
      <line x1="180" y1="140" x2="180" y2="40" stroke="var(--ink)" strokeWidth="1" />

      {/* Floor perspective */}
      <line x1="20" y1="140" x2="100" y2="110" stroke="var(--line)" strokeWidth="1" />
      <line x1="180" y1="140" x2="100" y2="110" stroke="var(--line)" strokeWidth="1" />
      <line x1="100" y1="110" x2="100" y2="40" stroke="var(--line)" strokeWidth="1" />

      {/* Counter */}
      <rect x="35" y="95" width="80" height="14" rx="1" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="35" y1="102" x2="115" y2="102" stroke="var(--ink)" strokeWidth="1" />

      {/* Sink basin */}
      <ellipse cx="75" cy="92" rx="22" ry="8" stroke="var(--ink)" strokeWidth="1.5" />
      <ellipse cx="75" cy="92" rx="16" ry="5" stroke="var(--line)" strokeWidth="1" />

      {/* Faucet */}
      <path d="M 75 84 Q 75 70 88 72" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
      <circle cx="88" cy="72" r="2" stroke="var(--ink)" strokeWidth="1.5" />

      {/* Mirror */}
      <rect x="130" y="52" width="42" height="58" rx="1" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="130" y1="52" x2="172" y2="110" stroke="var(--line)" strokeWidth="1" />

      {/* Light reflection line in mirror */}
      <line x1="138" y1="58" x2="138" y2="70" stroke="var(--line)" strokeWidth="1" />
    </svg>
  );
}

function Frame({ label }: { label: string }) {
  return (
    <div className="flex flex-col border border-ink rounded-[2px] bg-surface overflow-hidden">
      <div className="border-b border-line px-3 py-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink/70">
          {label}
        </span>
      </div>
      <div className="aspect-[4/3] p-3">
        <RoomSketch />
      </div>
    </div>
  );
}

export function VerificationDiagram() {
  const [mode, setMode] = useState<"single" | "multi">("single");

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="inline-flex border border-ink rounded-[2px]" role="tablist" aria-label="Verification mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "single"}
          onClick={() => setMode("single")}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
            mode === "single"
              ? "bg-ink text-surface"
              : "bg-surface text-ink hover:bg-ink/5"
          }`}
        >
          Single area
        </button>
        <div className="w-px bg-line" />
        <button
          type="button"
          role="tab"
          aria-selected={mode === "multi"}
          onClick={() => setMode("multi")}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
            mode === "multi"
              ? "bg-ink text-surface"
              : "bg-surface text-ink hover:bg-ink/5"
          }`}
        >
          Multi-area
        </button>
      </div>

      {mode === "single" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Frame label="Reference" />
            <Frame label="Submitted" />
          </div>
          <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
            <p className="font-mono text-xs text-ink">
              <span className="text-ink/60">{singleArea.area}</span>{" "}
              <span className="text-status-complete">LOC {singleArea.loc}</span>{" "}
              <span className="text-status-complete">CLEAN {singleArea.clean}</span>
            </p>
            <p className="font-mono text-xs text-ink/70">
              reason: {singleArea.reason}
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {multiAreas.map((area) => (
            <div key={area.area} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
                  Area: {area.area}
                </span>
                <p className="font-mono text-xs text-ink">
                  <span className="text-status-complete">LOC {area.loc}</span>{" "}
                  <span className="text-status-complete">CLEAN {area.clean}</span>
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Frame label={`Reference · ${area.area}`} />
                <Frame label={`Submitted · ${area.area}`} />
              </div>
              <p className="font-mono text-xs text-ink/70">reason: {area.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reasoning block */}
      <div className="border border-line rounded-[2px] bg-surface p-4">
        <div className="grid gap-2 font-mono text-xs text-ink sm:grid-cols-3">
          <p>
            <span className="text-ink/60">submission_id</span>{" "}
            sub_8f2a1d3c
          </p>
          <p>
            <span className="text-ink/60">location_match</span>{" "}
            <span className="text-status-complete">94</span>
          </p>
          <p>
            <span className="text-ink/60">cleanliness_match</span>{" "}
            <span className="text-status-complete">91</span>
          </p>
        </div>
        <p className="mt-3 font-mono text-xs text-ink/70">
          reason: counter geometry and fixture positions match reference; mirror shows minor streaks below threshold.
        </p>
      </div>
    </div>
  );
}
