import { Film } from "lucide-react";
import { CowAvatar } from "./CowAvatar";
import { ReportCard } from "./ReportCard";
import type { ChatMessage } from "./types";

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="animate-fade-up flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-[var(--surface-bubble-user)] px-4 py-2.5 text-sm leading-relaxed text-foreground shadow-[var(--shadow-bubble)] ring-1 ring-primary/20">
          {msg.videoName && (
            <div className="mb-2 flex items-center gap-2 rounded-md bg-black/30 px-2.5 py-1.5 text-xs text-foreground/80 ring-1 ring-border">
              <Film className="h-3.5 w-3.5 text-primary" />
              <span className="truncate font-medium">{msg.videoName}</span>
            </div>
          )}
          {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up flex items-start gap-2.5">
      <CowAvatar size={32} />
      <div className="min-w-0 max-w-[88%] flex-1">
        {msg.role === "bot" ? (
          <div className="rounded-2xl rounded-tl-sm bg-[var(--surface-bubble-bot)] px-4 py-3 text-sm leading-relaxed text-foreground/95 shadow-[var(--shadow-bubble)] ring-1 ring-border/60">
            <p className="whitespace-pre-wrap">{msg.text}</p>
          </div>
        ) : (
          <ReportCard result={msg.result} />
        )}
      </div>
    </div>
  );
}
