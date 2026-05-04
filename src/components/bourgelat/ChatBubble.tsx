import { Film } from "lucide-react";
import { CowAvatar } from "./CowAvatar";
import { ReportCard } from "./ReportCard";
import type { ChatMessage } from "./types";

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="animate-fade-up flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-[var(--surface-bubble-user)] px-3.5 py-2 text-[15px] leading-relaxed text-foreground shadow-[var(--shadow-bubble)]">
          {msg.videoName && (
            <div className="mb-1.5 flex items-center gap-2 rounded-md bg-black/5 px-2 py-1.5 text-xs text-foreground/75">
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
    <div className="animate-fade-up flex items-start gap-2">
      <CowAvatar size={32} />
      <div className="min-w-0 max-w-[88%] flex-1">
        {msg.role === "bot" ? (
          <div className="rounded-2xl rounded-tl-md bg-[var(--surface-bubble-bot)] px-3.5 py-2 text-[15px] leading-relaxed text-foreground shadow-[var(--shadow-bubble)]">
            <p className="whitespace-pre-wrap">{msg.text}</p>
          </div>
        ) : (
          <ReportCard result={msg.result} />
        )}
      </div>
    </div>
  );
}
