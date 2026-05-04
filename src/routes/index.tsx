import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { CowAvatar } from "@/components/bourgelat/CowAvatar";
import { StatusDot } from "@/components/bourgelat/StatusDot";
import { ChatBubble } from "@/components/bourgelat/ChatBubble";
import { TypingIndicator } from "@/components/bourgelat/TypingIndicator";
import type { ChatMessage, TriageResult } from "@/components/bourgelat/types";

export const Route = createFileRoute("/")({
  component: BourgelatChat,
  head: () => ({
    meta: [
      { title: "Bourgelat — AI Veterinary Intelligence" },
      {
        name: "description",
        content:
          "Bourgelat is an AI veterinary triage assistant for cattle farmers. Share a video, get a clinical assessment.",
      },
    ],
  }),
});

const API_BASE = "http://127.0.0.1:8000";
const uid = () => Math.random().toString(36).slice(2, 11);

function BourgelatChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "bot",
      text:
        "Welcome. I'm Bourgelat, your AI veterinary assistant. To assess your cattle's health, please share a short video of the animal and its ID. I'll analyze body condition, detect visible symptoms, and provide a triage assessment.",
    },
  ]);
  const [input, setInput] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // API health check
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(`${API_BASE}/`, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!cancelled) setStatus(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };
    ping();
    const t = setInterval(ping, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, analyzing]);

  // Autosize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [input]);

  const handleAttach = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setVideo(f);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (analyzing) return;
    const text = input.trim();
    if (!text && !video) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text,
      videoName: video?.name,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    const sentVideo = video;
    setVideo(null);

    if (!sentVideo) {
      // Text-only nudge
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          text: "I'll need a short video of the animal to perform a visual triage. Tap the attachment button to upload one, and include the animal's ID in your message.",
        },
      ]);
      return;
    }

    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append("video", sentVideo);
      fd.append("animal_id", text || "unknown");
      const res = await fetch(`${API_BASE}/analyze`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: TriageResult = await res.json();
      setMessages((m) => [...m, { id: uid(), role: "bot-report", result: data }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          text:
            "I couldn't reach the analysis service. Check that the Bourgelat backend is running at " +
            API_BASE +
            ` and try again.\n\n${(err as Error).message}`,
        },
      ]);
    } finally {
      setAnalyzing(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      {/* Header — deep forest green, WhatsApp-style */}
      <header className="z-20 flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <CowAvatar size={40} />
          <div className="leading-tight">
            <h1 className="text-base font-semibold tracking-tight">
              Bourgelat
            </h1>
            <p className="text-[11px] text-primary-foreground/75">
              AI Veterinary Intelligence
            </p>
          </div>
        </div>
        <StatusDot status={status} />
      </header>

      {/* Chat area */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-chat-canvas"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
          {messages.map((m) => (
            <ChatBubble key={m.id} msg={m} />
          ))}
          {analyzing && (
            <div className="flex items-start gap-2.5">
              <CowAvatar size={32} />
              <TypingIndicator />
            </div>
          )}
        </div>
      </main>

      {/* Input bar */}
      <footer className="z-20 border-t border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-3 py-3">
          {video && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-elevated)] px-3 py-2 ring-1 ring-border">
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate text-foreground/90">{video.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {(video.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <button
                onClick={() => setVideo(null)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Remove video"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-2xl bg-[var(--surface-elevated)] p-1.5 ring-1 ring-border focus-within:ring-primary/60 transition-all">
            <button
              onClick={handleAttach}
              disabled={analyzing}
              aria-label="Attach video or image"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-primary disabled:opacity-40"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleFile}
            />
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={analyzing}
              placeholder={video ? "Animal ID (e.g. 4271)…" : "Describe symptoms or attach a video…"}
              className="max-h-[140px] flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={analyzing || (!input.trim() && !video)}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              style={{ boxShadow: "var(--glow-primary)" }}
            >
              <Send className="h-4.5 w-4.5" strokeWidth={2.5} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Bourgelat provides decision support only — not a substitute for veterinary care.
          </p>
        </div>
      </footer>
    </div>
  );
}
