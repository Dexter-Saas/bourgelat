import type { FeverLikelihood } from "./types";

export function normalizeFever(value: unknown): FeverLikelihood | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase().trim();
  if (v.includes("high") || v.includes("severe")) return "high";
  if (v.includes("med") || v.includes("mod")) return "medium";
  if (v.includes("low") || v.includes("none") || v.includes("mild")) return "low";
  return null;
}

const styles: Record<FeverLikelihood, { bg: string; text: string; ring: string; dot: string; label: string }> = {
  low: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    ring: "ring-emerald-500/40",
    dot: "bg-emerald-500",
    label: "Fever risk: Low",
  },
  medium: {
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    ring: "ring-amber-500/40",
    dot: "bg-amber-500",
    label: "Fever risk: Medium",
  },
  high: {
    bg: "bg-red-500/15",
    text: "text-red-500",
    ring: "ring-red-500/50",
    dot: "bg-red-500",
    label: "Fever risk: High",
  },
};

export function FeverPill({ level }: { level: FeverLikelihood }) {
  const s = styles[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 text-display ${s.bg} ${s.text} ${s.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
