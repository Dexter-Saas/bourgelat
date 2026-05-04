// To set a custom avatar image, drop the file at src/assets/bourgelat-avatar.jpg
// (or .png) and the import below will pick it up automatically.
let avatarUrl: string | undefined;
try {
  // @ts-ignore - optional asset
  avatarUrl = (await import("@/assets/bourgelat-avatar.jpg")).default;
} catch {
  avatarUrl = undefined;
}

export function CowAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-primary/30"
      style={{ width: size, height: size }}
      aria-label="Bourgelat"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Bourgelat"
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <svg viewBox="0 0 32 32" width={size * 0.7} height={size * 0.7} fill="none">
          <ellipse cx="16" cy="17" rx="9" ry="8" fill="oklch(0.42 0.07 155 / 0.18)" stroke="oklch(0.42 0.07 155)" strokeWidth="1.4" />
          <ellipse cx="16" cy="20" rx="5" ry="4" fill="oklch(0.42 0.07 155 / 0.30)" stroke="oklch(0.42 0.07 155)" strokeWidth="1.2" />
          <path d="M8 12c-2 0-3-2-2-4 1-1 3-1 4 1M24 12c2 0 3-2 2-4-1-1-3-1-4 1" stroke="oklch(0.42 0.07 155)" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="13" cy="16" r="1" fill="oklch(0.42 0.07 155)" />
          <circle cx="19" cy="16" r="1" fill="oklch(0.42 0.07 155)" />
        </svg>
      )}
    </div>
  );
}
