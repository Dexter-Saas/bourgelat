import { Users, Activity, AlertTriangle } from "lucide-react";
import { FeverPill } from "./FeverPill";
import type { HerdResult } from "./types";

export function HerdCard({ result }: { result: HerdResult }) {
  return (
    <article className="animate-fade-up overflow-hidden rounded-2xl rounded-tl-sm bg-[var(--surface-report)] ring-1 ring-border/70 shadow-[var(--shadow-bubble)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-black/20 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground text-display">
          <Users className="h-3.5 w-3.5" />
          Herd Assessment
        </div>
        {result.fever_likelihood && <FeverPill level={result.fever_likelihood} />}
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
      </div>

      <div className="border-b border-border/60 p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
          <Activity className="h-3 w-3" /> Health Summary
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {result.health_summary || "No summary provided."}
        </p>
      </div>

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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {a.id ? `ID · ${a.id}` : `Animal #${idx + 1}`}
                  </span>
                  {a.severity && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-display">
                      {a.severity}
                    </span>
                  )}
                </div>
                {a.concerns.length > 0 && (
                  <p className="mt-1 text-xs text-foreground/80">
                    {a.concerns.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-muted-foreground">No animals flagged.</p>
        )}
      </div>
    </article>
  );
}
