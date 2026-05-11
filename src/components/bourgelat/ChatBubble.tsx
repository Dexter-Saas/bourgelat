import { Film } from "lucide-react";
import { CowAvatar } from "./CowAvatar";
import { ReportCard } from "./ReportCard";
import { FeedCard } from "./FeedCard";
import { HerdCard } from "./HerdCard";
import type { ChatMessage } from "./types";

export function ChatBubble({
  msg,
  onFeedChoice,
  feedChoiceDisabled,
}: {
  msg: ChatMessage;
  onFeedChoice?: (choice: "yes" | "no") => void;
  feedChoiceDisabled?: boolean;
}) {
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
        {msg.role === "bot" && (
          <div className="rounded-2xl rounded-tl-md bg-[var(--surface-bubble-bot)] px-3.5 py-2 text-[15px] leading-relaxed text-foreground shadow-[var(--shadow-bubble)]">
            <p className="whitespace-pre-wrap">{msg.text}</p>
          </div>
        )}
        {msg.role === "bot-report" && <ReportCard result={msg.result} />}
        {msg.role === "bot-herd" && <HerdCard result={msg.result} />}
        {msg.role === "bot-feed-prompt" && (
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl rounded-tl-md bg-[var(--surface-bubble-bot)] px-3.5 py-2 text-[15px] leading-relaxed text-foreground shadow-[var(--shadow-bubble)]">
              Would you like a feed recommendation?
            </div>
            <div className="flex gap-2 pl-1">
              <button
                type="button"
                disabled={feedChoiceDisabled}
                onClick={() => onFeedChoice?.("yes")}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Yes, please
              </button>
              <button
                type="button"
                disabled={feedChoiceDisabled}
                onClick={() => onFeedChoice?.("no")}
                className="rounded-full bg-[var(--surface-elevated)] px-4 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                No thanks
              </button>
            </div>
          </div>
        )}
        {msg.role === "bot-feed" && <FeedCard ration={msg.ration} bcs={msg.bcs} />}
      </div>
    </div>
  );
}
