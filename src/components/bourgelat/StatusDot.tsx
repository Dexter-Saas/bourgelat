type Status = "checking" | "online" | "offline";

export function StatusDot({ status }: { status: Status }) {
  const config = {
    checking: { color: "text-[var(--warning)]", label: "Checking" },
    online: { color: "text-[var(--severity-mild)]", label: "API Online" },
    offline: { color: "text-[var(--severity-severe)]", label: "API Offline" },
  }[status];

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 ring-1 ring-border/60">
      <span className={`status-pulse inline-block h-1.5 w-1.5 rounded-full bg-current ${config.color}`} />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-display">
        {config.label}
      </span>
    </div>
  );
}
