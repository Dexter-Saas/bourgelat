import { Wheat, Share2, Download, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import type { FeedRation } from "./types";

function formatFeedText(ration: FeedRation, bcs?: number | null): string {
  const lines = [
    "BOURGELAT — Feed Ration",
    "═══════════════════════════════",
    typeof bcs === "number" && bcs > 0 ? `BCS reference: ${bcs}` : null,
    ration.summary ? `\n${ration.summary}` : null,
    "",
    "Ration:",
    ...ration.items.map(
      (it) =>
        `  • ${it.name}${it.amount ? ` — ${it.amount}` : ""}${it.note ? ` (${it.note})` : ""}`,
    ),
    ration.notes ? `\nNotes:\n${ration.notes}` : null,
    "",
    "───────────────────────────────",
    `Generated: ${new Date().toLocaleString()}`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function FeedCard({
  ration,
  bcs,
}: {
  ration: FeedRation;
  bcs?: number | null;
}) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const text = formatFeedText(ration, bcs);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bourgelat-feed-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleShare = async () => {
    const text = formatFeedText(ration, bcs);
    try {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator) : null;
      if (nav && typeof nav.share === "function") {
        await nav.share({ title: "Bourgelat Feed Ration", text });
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
      <article className="rounded-2xl rounded-tl-sm bg-[var(--surface-report)] ring-1 ring-border/70 shadow-[var(--shadow-bubble)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 bg-black/20 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground text-display">
            <Wheat className="h-3.5 w-3.5" />
            Feed Ration
          </div>
          {typeof bcs === "number" && bcs > 0 && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary text-display">
              BCS · {bcs}
            </span>
          )}
        </div>

        {ration.summary && (
          <div className="border-b border-border/60 px-4 py-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
              <Sparkles className="h-3 w-3" /> Recommendation
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {ration.summary}
            </p>
          </div>
        )}

        <div className="p-4">
          <p className="mb-2.5 text-[10px] uppercase tracking-widest text-muted-foreground text-display">
            Daily Ration
          </p>
          {ration.items.length > 0 ? (
            <ul className="space-y-2">
              {ration.items.map((it, idx) => (
                <li
                  key={`${it.name}-${idx}`}
                  className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{it.name}</p>
                    {it.note && (
                      <p className="text-xs text-muted-foreground">{it.note}</p>
                    )}
                  </div>
                  {it.amount && (
                    <span className="shrink-0 text-display text-sm tabular-nums text-primary">
                      {it.amount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No ration data returned.
            </p>
          )}
        </div>

        {ration.notes && (
          <div className="border-t border-border/60 bg-accent/30 px-4 py-2.5">
            <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {ration.notes}
            </p>
          </div>
        )}
      </article>

      <div className="flex items-center gap-1.5 px-1">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Share feed ration"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              Share
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Download feed ration"
        >
          {downloaded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download
            </>
          )}
        </button>
      </div>
    </div>
  );
}
