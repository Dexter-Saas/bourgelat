type Status = "checking" | "online" | "offline";

export function StatusDot({ status }: { status: Status }) {
  const config = {
    checking: { color: "bg-amber-300", label: "Checking" },
    online: { color: "bg-emerald-300", label: "Online" },
    offline: { color: "bg-rose-300", label: "Offline" },
  }[status];

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 ring-1 ring-white/20">
      <span className={`status-pulse inline-block h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-[11px] font-medium text-primary-foreground/90">
        {config.label}
      </span>
    </div>
  );
}
