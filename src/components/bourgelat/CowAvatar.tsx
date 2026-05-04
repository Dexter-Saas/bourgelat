export function CowAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/40"
      style={{ width: size, height: size, boxShadow: "var(--glow-primary)" }}
      aria-label="Bourgelat"
    >
      <svg viewBox="0 0 32 32" width={size * 0.65} height={size * 0.65} fill="none">
        {/* Stylized cow head */}
        <path
          d="M8 12c-2 0-3-2-2-4 1-1 3-1 4 1M24 12c2 0 3-2 2-4-1-1-3-1-4 1"
          stroke="oklch(0.85 0.13 135)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <ellipse cx="16" cy="17" rx="9" ry="8" fill="oklch(0.62 0.13 135 / 0.25)" stroke="oklch(0.85 0.13 135)" strokeWidth="1.5" />
        <ellipse cx="16" cy="20" rx="5" ry="4" fill="oklch(0.20 0.018 145)" stroke="oklch(0.85 0.13 135)" strokeWidth="1.2" />
        <circle cx="13" cy="16" r="1.1" fill="oklch(0.85 0.13 135)" />
        <circle cx="19" cy="16" r="1.1" fill="oklch(0.85 0.13 135)" />
        <circle cx="14" cy="20" r="0.6" fill="oklch(0.85 0.13 135)" />
        <circle cx="18" cy="20" r="0.6" fill="oklch(0.85 0.13 135)" />
      </svg>
    </div>
  );
}
