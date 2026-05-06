import { AlertTriangle, Activity, Stethoscope, ClipboardList, ShieldAlert, Share2, Download, Check } from "lucide-react";
import { useState } from "react";
import type { TriageResult, Severity } from "./types";

function formatReportText(result: TriageResult): string {
  const lines = [
    "BOURGELAT — Triage Report",
    "═══════════════════════════════",
    result.animal_id ? `Animal ID: ${result.animal_id}` : null,
    `Severity: ${result.severity}`,
    `Body Condition Score: ${
      typeof result.body_condition_score === "number" && result.body_condition_score > 0
        ? `${Math.round(result.body_condition_score)}/5`
        : "—"
    }`,
    `Confidence: ${
      typeof result.confidence === "number" && Number.isFinite(result.confidence)
        ? `${Math.round(result.confidence > 1 ? result.confidence : result.confidence * 100)}%`
        : "—"
    }`,
    "",
    `Conditions Detected: ${
      result.conditions.length ? result.conditions.join(", ") : "None detected"
    }`,
    "",
    "Clinical Observations:",
    result.clinical_observations,
    "",
    "Treatment Recommendation:",
    result.treatment_recommendation,
    "",
    "───────────────────────────────",
    "Decision support only. Always consult a licensed veterinarian.",
    `Generated: ${new Date().toLocaleString()}`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

const severityStyles: Record<Severity, { bg: string; text: string; ring: string; label: string }> = {
  MILD: {
    bg: "bg-[var(--severity-mild)]/15",
    text: "text-[var(--severity-mild)]",
    ring: "ring-[var(--severity-mild)]/40",
    label: "Mild",
  },
  MODERATE: {
    bg: "bg-[var(--severity-moderate)]/15",
    text: "text-[var(--severity-moderate)]",
    ring: "ring-[var(--severity-moderate)]/40",
    label: "Moderate",
  },
  SEVERE: {
    bg: "bg-[var(--severity-severe)]/15",
    text: "text-[var(--severity-severe)]",
    ring: "ring-[var(--severity-severe)]/50",
    label: "Severe",
  },
};

function BcsDots({ score }: { score?: number | null }) {
  const valid =
    typeof score === "number" && Number.isFinite(score) && score > 0;
  const s = valid ? Math.max(0, Math.min(5, Math.round(score as number))) : 0;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            valid && i <= s
              ? "bg-primary shadow-[0_0_8px_oklch(0.62_0.13_135/0.7)]"
              : "bg-border ring-1 ring-border"
          }`}
        />
      ))}
      <span className="ml-2 text-display text-sm tabular-nums text-foreground">
        {valid ? (
          <>
            {s}
            <span className="text-muted-foreground">/5</span>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    </div>
  );
}

export function ReportCard({ result }: { result: TriageResult }) {
  const sev = severityStyles[result.severity] ?? severityStyles.MODERATE;
  const rawConfidence =
    typeof result.confidence === "number" && Number.isFinite(result.confidence)
      ? result.confidence
      : null;
  const confidencePct =
    rawConfidence === null
      ? null
      : rawConfidence > 1
        ? Math.round(rawConfidence)
        : Math.round(rawConfidence * 100);
  const confidenceIsLow = confidencePct !== null && confidencePct <= 0;
  const confidenceBarPct = confidencePct === null ? 0 : Math.max(0, Math.min(100, confidencePct));
  const conditions = result.conditions ?? [];

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const text = formatReportText(result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const idPart = result.animal_id ? `-${result.animal_id}` : "";
    a.download = `bourgelat-report${idPart}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleShare = async () => {
    const text = formatReportText(result);
    const shareData = {
      title: "Bourgelat Triage Report",
      text,
    };
    try {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator) : null;
      if (nav && typeof nav.share === "function") {
        await nav.share(shareData);
        return;
      }
      if (nav && nav.clipboard) {
        await nav.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled or unavailable — silently ignore
    }
  };

  return (
    <div className="animate-fade-up flex flex-col gap-4">
      {result.severity === "SEVERE" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[var(--severity-severe)]/50 bg-[var(--severity-severe)]/12 px-3.5 py-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--severity-severe)]" />
          <p className="text-sm font-medium text-[var(--severity-severe)] uppercase tracking-wide text-display">
            Veterinary care required immediately
          </p>
        </div>
      )}

      <article className="rounded-2xl rounded-tl-sm bg-[var(--surface-report)] ring-1 ring-border/70 shadow-[var(--shadow-bubble)] overflow-hidden">
        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-border/60 bg-black/20 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground text-display">
            <ClipboardList className="h-3.5 w-3.5" />
            Triage Report
            {result.animal_id && (
              <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                ID · {result.animal_id}
              </span>
            )}
          </div>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ring-1 text-display ${sev.bg} ${sev.text} ${sev.ring}`}
          >
            {result.severity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-border/60 p-4">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              Body Condition
            </p>
            <BcsDots score={result.body_condition_score} />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              Confidence
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${confidenceBarPct}%` }}
                />
              </div>
              <span className="text-display text-sm tabular-nums">
                {confidencePct === null
                  ? "—"
                  : confidenceIsLow
                    ? "Low"
                    : `${confidencePct}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-border/60 p-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
            Conditions Detected
          </p>
          {conditions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-accent/60 px-2.5 py-1 text-xs text-accent-foreground ring-1 ring-border"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">None detected</p>
          )}
        </div>

        <div className="space-y-3 p-4">
          <section>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              <Activity className="h-3 w-3" /> Clinical Observations
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {result.clinical_observations}
            </p>
          </section>

          <section>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              <Stethoscope className="h-3 w-3" /> Treatment Recommendation
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {result.treatment_recommendation}
            </p>
          </section>
        </div>

        <div className="flex items-start gap-2 border-t border-border/60 bg-[var(--warning)]/8 px-4 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
          <p className="text-xs leading-relaxed text-[var(--warning)]/90">
            Decision support only. Always consult a licensed veterinarian.
          </p>
        </div>
      </article>
    </div>
  );
}
