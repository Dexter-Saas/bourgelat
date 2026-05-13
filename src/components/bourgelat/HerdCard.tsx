import { Users, Activity, AlertTriangle, ListChecks, Stethoscope, Share2, Download, Check } from "lucide-react";
import { useState } from "react";
import { FeverPill } from "./FeverPill";
import type { HerdResult } from "./types";

function formatHerdText(result: HerdResult): string {
  const lines: (string | null)[] = [
    "BOURGELAT — Herd Assessment",
    "═══════════════════════════════",
    typeof result.herd_size === "number" ? `Estimated herd size: ${result.herd_size}` : null,
    typeof result.average_bcs === "number" ? `Average BCS: ${result.average_bcs.toFixed(1)}/5` : null,
    result.fever_likelihood ? `Fever risk: ${result.fever_likelihood}` : null,
    typeof result.confidence === "number"
      ? `Confidence: ${Math.round((result.confidence > 1 ? result.confidence : result.confidence * 100))}%`
      : null,
    "",
    "Health summary:",
    result.health_summary || "—",
    "",
    result.common_conditions && result.common_conditions.length
      ? `Common conditions: ${result.common_conditions.join(", ")}`
      : null,
    result.recommended_action ? `\nRecommended action:\n${result.recommended_action}` : null,
    "",
    "Flagged animals:",
    ...(result.flagged.length
      ? result.flagged.map((a, i) => {
          const head = a.id ? `ID · ${a.id}` : `Animal #${i + 1}`;
          const sev = a.severity ? ` [${a.severity}]` : "";
          const fev = a.fever_likelihood ? ` (fever: ${a.fever_likelihood})` : "";
          const concerns = a.concerns.length ? `\n   ${a.concerns.join(", ")}` : "";
          const desc = a.frame_description ? `\n   ${a.frame_description}` : "";
          return `  • ${head}${sev}${fev}${concerns}${desc}`;
        })
      : ["  (none)"]),
    result.disclaimer ? `\n${result.disclaimer}` : null,
    "",
    "───────────────────────────────",
    `Generated: ${new Date().toLocaleString()}`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function HerdCard({ result }: { result: HerdResult }) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const confidencePct =
    typeof result.confidence === "number"
      ? Math.round(result.confidence > 1 ? result.confidence : result.confidence * 100)
      : null;

  const handleDownload = () => {
    const text = formatHerdText(result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bourgelat-herd-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleShare = async () => {
    const text = formatHerdText(result);
    try {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator) : null;
      if (nav && typeof nav.share === "function") {
        await nav.share({ title: "Bourgelat Herd Assessment", text });
        return;
      }
      if (nav && nav.clipboard) {
        await nav.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="animate-fade-up flex flex-col gap-2">
      <article className="glass-card aurora-bg aurora-soft overflow-hidden rounded-2xl rounded-tl-sm shadow-[var(--shadow-bubble)]">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground text-display">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="shrink-0">Herd Assessment</span>
          </div>
          {result.fever_likelihood && (
            <div className="shrink-0">
              <FeverPill level={result.fever_likelihood} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-border/60 p-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              Estimated Herd Size
            </p>
            <p className="text-display text-lg tabular-nums">
              {typeof result.herd_size === "number" ? result.herd_size : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              Average BCS
            </p>
            <p className="text-display text-lg tabular-nums">
              {typeof result.average_bcs === "number"
                ? `${result.average_bcs.toFixed(1)}/5`
                : "—"}
            </p>
          </div>
          {confidencePct !== null && (
            <div className="col-span-2 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-display">
                Confidence
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(0, Math.min(100, confidencePct))}%` }}
                  />
                </div>
                <span className="text-display text-sm tabular-nums">{confidencePct}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-border/60 p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
            <Activity className="h-3 w-3" /> Health Summary
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {result.health_summary || "No summary provided."}
          </p>
        </div>

        {result.common_conditions && result.common_conditions.length > 0 && (
          <div className="border-b border-border/60 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              <ListChecks className="h-3 w-3" /> Common Conditions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.common_conditions.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-accent/60 px-2.5 py-1 text-xs text-accent-foreground ring-1 ring-border"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.recommended_action && (
          <div className="border-b border-border/60 p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              <Stethoscope className="h-3 w-3" /> Recommended Action
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {result.recommended_action}
            </p>
          </div>
        )}

        <div className="p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
            <AlertTriangle className="h-3 w-3" /> Flagged Animals
          </div>
          {result.flagged.length > 0 ? (
            <ul className="space-y-2">
              {result.flagged.map((a, idx) => (
                <li
                  key={`${a.id ?? "animal"}-${idx}`}
                  className="rounded-lg bg-accent/40 px-3 py-2 ring-1 ring-border"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-foreground">
                      {a.id ? `ID · ${a.id}` : `Animal #${idx + 1}`}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {a.fever_likelihood && <FeverPill level={a.fever_likelihood} />}
                      {a.severity && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-display">
                          {a.severity}
                        </span>
                      )}
                    </div>
                  </div>
                  {a.concerns.length > 0 && (
                    <p className="mt-1 text-xs text-foreground/80">
                      {a.concerns.join(", ")}
                    </p>
                  )}
                  {a.frame_description && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      {a.frame_description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-muted-foreground">No animals flagged.</p>
          )}
        </div>

        {result.disclaimer && (
          <div className="border-t border-border/60 px-4 py-2.5">
            <p className="text-[11px] italic leading-relaxed text-muted-foreground">
              {result.disclaimer}
            </p>
          </div>
        )}
      </article>

      <div className="flex items-center gap-1.5 px-1">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Share herd assessment"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" />Copied</>
          ) : (
            <><Share2 className="h-3.5 w-3.5" />Share</>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Download herd assessment"
        >
          {downloaded ? (
            <><Check className="h-3.5 w-3.5" />Saved</>
          ) : (
            <><Download className="h-3.5 w-3.5" />Download</>
          )}
        </button>
      </div>
    </div>
  );
}
