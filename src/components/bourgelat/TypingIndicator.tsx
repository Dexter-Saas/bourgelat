import { useEffect, useState } from "react";

const STEPS = [
  "Reading frames",
  "Detecting posture",
  "Scoring body condition",
  "Cross-checking symptoms",
  "Compiling triage",
];

export function TypingIndicator() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="aurora-bg glass-card relative flex items-center gap-3 overflow-hidden rounded-2xl rounded-tl-sm px-4 py-3">
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="liquid-orb absolute inset-0 rounded-full bg-gradient-to-br from-primary to-[oklch(0.62_0.13_145)] opacity-90" />
        <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="shimmer-text text-display text-[11px] font-semibold uppercase tracking-[0.18em]">
          Bourgelat is analyzing
        </span>
        <span
          key={step}
          className="animate-fade-up text-[11px] text-muted-foreground"
        >
          {STEPS[step]}…
        </span>
      </div>
      <span className="ml-auto flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}
