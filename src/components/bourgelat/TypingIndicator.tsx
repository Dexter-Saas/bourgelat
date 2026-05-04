export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-[var(--surface-bubble-bot)] px-4 py-3 ring-1 ring-border/60">
      <span className="text-xs uppercase tracking-widest text-muted-foreground text-display">
        Bourgelat is analyzing
      </span>
      <span className="flex gap-1">
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
