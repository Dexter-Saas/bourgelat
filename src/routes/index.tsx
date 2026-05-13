import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X, ChevronDown, User, Users } from "lucide-react";
import { CowAvatar } from "@/components/bourgelat/CowAvatar";
import { StatusDot } from "@/components/bourgelat/StatusDot";
import { ChatBubble } from "@/components/bourgelat/ChatBubble";
import { TypingIndicator } from "@/components/bourgelat/TypingIndicator";
import { normalizeFever } from "@/components/bourgelat/FeverPill";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type {
  ChatMessage,
  FeedRation,
  HerdResult,
  Severity,
  TriageApiResponse,
  TriageResult,
} from "@/components/bourgelat/types";

type Mode = "single" | "herd";

function mapApiToTriageResult(
  data: TriageApiResponse,
  animalId?: string,
): TriageResult {
  const analysis = data.analysis ?? {};
  const triage = data.triage ?? {};

  const levelRaw = (triage.level ?? "").toString().toUpperCase();
  let severity: Severity = "MODERATE";
  if (levelRaw.includes("SEVERE") || levelRaw.includes("CRITICAL") || levelRaw.includes("HIGH")) {
    severity = "SEVERE";
  } else if (levelRaw.includes("MILD") || levelRaw.includes("LOW")) {
    severity = "MILD";
  } else if (levelRaw.includes("MODERATE") || levelRaw.includes("MED")) {
    severity = "MODERATE";
  } else if (typeof analysis.severity_score === "number") {
    if (analysis.severity_score >= 0.66) severity = "SEVERE";
    else if (analysis.severity_score < 0.34) severity = "MILD";
  }

  const observations = analysis.observations?.trim() || "No observations provided.";
  const treatment =
    data.treatment_context?.trim() ||
    triage.reason?.trim() ||
    "No treatment guidance provided.";

  const fever = normalizeFever(analysis.fever_likelihood ?? data.fever_likelihood);
  const feverSigns = Array.isArray(analysis.fever_signs)
    ? analysis.fever_signs
    : Array.isArray(data.fever_signs)
      ? data.fever_signs
      : [];

  return {
    severity,
    body_condition_score:
      typeof analysis.bcs_score === "number" ? analysis.bcs_score : null,
    confidence: typeof analysis.confidence === "number" ? analysis.confidence : null,
    conditions: Array.isArray(analysis.conditions) ? analysis.conditions : [],
    clinical_observations: observations,
    treatment_recommendation: treatment,
    animal_id: animalId,
    triage_action: triage.action,
    triage_reason: triage.reason,
    fever_likelihood: fever,
    fever_signs: feverSigns,
  };
}

function mapApiToHerdResult(data: unknown): HerdResult {
  const result: HerdResult = {
    health_summary: "",
    flagged: [],
    raw: data,
    fever_likelihood: null,
  };
  if (!data || typeof data !== "object") return result;
  const d = data as Record<string, unknown>;
  const analysis = (d.analysis && typeof d.analysis === "object" ? d.analysis : d) as Record<string, unknown>;
  const triage = (d.triage && typeof d.triage === "object" ? d.triage : {}) as Record<string, unknown>;

  const size =
    analysis.herd_size_estimate ??
    analysis.herd_size ??
    analysis.estimated_herd_size ??
    d.herd_size_estimate ??
    d.herd_size;
  if (typeof size === "number") result.herd_size = size;

  const avg =
    analysis.herd_bcs_average ??
    analysis.average_bcs ??
    analysis.avg_bcs ??
    analysis.bcs_score ??
    d.herd_bcs_average ??
    d.average_bcs;
  if (typeof avg === "number") result.average_bcs = avg;

  const summary =
    analysis.herd_health_summary ??
    analysis.health_summary ??
    analysis.summary ??
    analysis.observations ??
    d.health_summary ??
    d.summary;
  if (typeof summary === "string") result.health_summary = summary;

  result.fever_likelihood = normalizeFever(
    analysis.fever_likelihood ?? d.fever_likelihood,
  );

  const cc = analysis.common_conditions ?? d.common_conditions;
  if (Array.isArray(cc)) {
    result.common_conditions = cc.filter((c): c is string => typeof c === "string");
  }

  const action =
    analysis.recommended_action ??
    triage.action ??
    d.recommended_action;
  if (typeof action === "string") result.recommended_action = action;

  const conf = analysis.confidence ?? d.confidence;
  if (typeof conf === "number") result.confidence = conf;

  const disc = analysis.disclaimer ?? d.disclaimer;
  if (typeof disc === "string") result.disclaimer = disc;

  const flaggedRaw =
    analysis.flagged_animals ?? analysis.flagged ?? d.flagged_animals ?? d.flagged;
  if (Array.isArray(flaggedRaw)) {
    for (const item of flaggedRaw) {
      if (typeof item === "string") {
        result.flagged.push({ concerns: [item] });
      } else if (item && typeof item === "object") {
        const e = item as Record<string, unknown>;
        const id =
          (e.id as string) ||
          (e.animal_id as string) ||
          (e.tag as string) ||
          undefined;
        const concernSingular = typeof e.concern === "string" ? e.concern : undefined;
        const concernsVal = e.concerns ?? e.conditions ?? e.issues;
        let concerns: string[] = [];
        if (Array.isArray(concernsVal)) {
          concerns = concernsVal.filter((c): c is string => typeof c === "string");
        } else if (typeof concernsVal === "string") {
          concerns = [concernsVal];
        }
        if (concernSingular) concerns = [concernSingular, ...concerns];
        const severity =
          typeof e.severity === "string"
            ? e.severity
            : typeof e.level === "string"
              ? e.level
              : undefined;
        const frame_description =
          typeof e.frame_description === "string" ? e.frame_description : undefined;
        const fever = normalizeFever(e.fever_likelihood);
        result.flagged.push({ id, concerns, severity, frame_description, fever_likelihood: fever });
      }
    }
  }

  return result;
}

function mapApiToFeedRation(data: unknown): FeedRation {
  const ration: FeedRation = { raw: data, items: [] };
  if (!data || typeof data !== "object") return ration;
  const d = data as Record<string, unknown>;

  if (typeof d.estimated_weight_kg === "number") ration.estimatedWeightKg = d.estimated_weight_kg;
  if (typeof d.inferred_production_stage === "string") ration.productionStage = d.inferred_production_stage;
  if (typeof d.dry_matter_required_kg === "number") ration.dryMatterRequiredKg = d.dry_matter_required_kg;
  if (typeof d.total_daily_cost === "number") ration.totalDailyCost = d.total_daily_cost;
  if (typeof d.disclaimer === "string") ration.disclaimer = d.disclaimer;

  const summary =
    (d.summary as string) || (d.recommendation as string) || (d.message as string) || (d.advice as string);
  if (typeof summary === "string") ration.summary = summary;

  const notesVal = d.notes ?? d.note;
  if (Array.isArray(notesVal)) {
    const joined = notesVal.filter((n) => typeof n === "string").join("\n");
    if (joined) ration.notes = joined;
  } else if (typeof notesVal === "string") {
    ration.notes = notesVal;
  }

  const candidate =
    (d.recommended_feeds as unknown) ??
    (d.ration as unknown) ??
    (d.feeds as unknown) ??
    (d.items as unknown) ??
    (d.recommendations as unknown) ??
    (d.feed_plan as unknown);

  if (Array.isArray(candidate)) {
    for (const entry of candidate) {
      if (typeof entry === "string") {
        ration.items.push({ name: entry });
      } else if (entry && typeof entry === "object") {
        const e = entry as Record<string, unknown>;
        const name =
          (e.feed as string) ||
          (e.name as string) ||
          (e.ingredient as string) ||
          (e.type as string) ||
          "Feed";
        const amountVal =
          e.amount_kg_per_day ?? e.amount ?? e.quantity ?? e.kg ?? e.kg_per_day ?? e.daily ?? e.ration;
        let amount: string | undefined;
        if (typeof amountVal === "number") amount = `${amountVal.toFixed(2)} kg/day`;
        else if (typeof amountVal === "string") amount = amountVal;

        const costVal = e.estimated_cost ?? e.cost;
        let cost: string | undefined;
        if (typeof costVal === "number") cost = costVal.toFixed(2);
        else if (typeof costVal === "string") cost = costVal;

        const note = (e.note as string) || (e.notes as string) || (e.description as string);
        ration.items.push({ name, amount, cost, note });
      }
    }
  } else if (candidate && typeof candidate === "object") {
    for (const [k, v] of Object.entries(candidate as Record<string, unknown>)) {
      let amount: string | undefined;
      if (typeof v === "number") amount = `${v} kg/day`;
      else if (typeof v === "string") amount = v;
      ration.items.push({ name: k, amount });
    }
  }

  return ration;
}

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
  const [feedFlow, setFeedFlow] = useState<"idle" | "awaiting-choice" | "awaiting-feeds" | "loading">("idle");
  const [lastBcs, setLastBcs] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("single");

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

  const fetchFeed = async (availableFeeds: string[]) => {
    setFeedFlow("loading");
    setAnalyzing(true);
    try {
      const payload = {
        bcs_score: lastBcs ?? 3,
        available_feeds: availableFeeds,
        weight: 450,
        milk_yield: 0,
        days_in_milk: 0,
        breed: "default",
        lactation_stage: "default",
      };
      const res = await fetch(`${API_BASE}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const ration = mapApiToFeedRation(data);
      setMessages((m) => [
        ...m,
        { id: uid(), role: "bot-feed", ration, bcs: lastBcs },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          text: `I couldn't fetch a feed recommendation. ${(err as Error).message}`,
        },
      ]);
    } finally {
      setAnalyzing(false);
      setFeedFlow("idle");
    }
  };

  const handleFeedChoice = (choice: "yes" | "no") => {
    if (feedFlow !== "awaiting-choice") return;
    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", text: choice === "yes" ? "Yes, please" : "No thanks" },
    ]);
    if (choice === "no") {
      setFeedFlow("idle");
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          text: "No problem. Let me know if you'd like to assess another animal.",
        },
      ]);
      return;
    }
    setFeedFlow("awaiting-feeds");
    setMessages((m) => [
      ...m,
      { id: uid(), role: "bot", text: "What feeds are available to you?" },
    ]);
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

    // Feed flow: user just provided their available feeds
    if (feedFlow === "awaiting-feeds" && !sentVideo && text) {
      const feeds = text
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (feeds.length === 0) {
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "bot",
            text: "Please list at least one feed (e.g. hay, maize silage, concentrate).",
          },
        ]);
        return;
      }
      await fetchFeed(feeds);
      return;
    }

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
      const isHerd = mode === "herd";
      const fd = new FormData();
      fd.append("video", sentVideo);
      fd.append("animal_id", isHerd ? "herd" : (text || "unknown"));
      const res = await fetch(`${API_BASE}/analyze`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      if (isHerd) {
        const herd = mapApiToHerdResult(data);
        setMessages((m) => [...m, { id: uid(), role: "bot-herd", result: herd }]);
        const bcs =
          typeof herd.average_bcs === "number" && herd.average_bcs > 0
            ? herd.average_bcs
            : null;
        setLastBcs(bcs);
        setMessages((m) => [...m, { id: uid(), role: "bot-feed-prompt" }]);
        setFeedFlow("awaiting-choice");
      } else {
        const result = mapApiToTriageResult(data as TriageApiResponse, text || undefined);
        setMessages((m) => [...m, { id: uid(), role: "bot-report", result }]);
        const bcs =
          typeof result.body_condition_score === "number" && result.body_condition_score > 0
            ? result.body_condition_score
            : null;
        setLastBcs(bcs);
        setMessages((m) => [...m, { id: uid(), role: "bot-feed-prompt" }]);
        setFeedFlow("awaiting-choice");
      }
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
      {/* Header — fade gradient like ChatGPT/Claude */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[140%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.32 0.05 155 / 0.96) 0%, oklch(0.34 0.055 155 / 0.85) 55%, oklch(0.36 0.06 155 / 0) 100%)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
          }}
        />
        <div className="flex items-center gap-3">
          <span className="relative inline-flex">
            <span className="absolute inset-0 rounded-full bg-black/30 ring-1 ring-black/20" />
            <span className="relative rounded-full" style={{ filter: "brightness(0.78) saturate(1.05)" }}>
              <CowAvatar size={40} />
            </span>
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-semibold tracking-tight text-primary-foreground">
              Bourgelat
            </h1>
            <p className="text-[11px] text-primary-foreground/75">
              AI Veterinary Intelligence
            </p>
          </div>
        </div>
        <StatusDot status={status} />
      </header>

      {/* Mode selector */}
      <div className="relative z-20 flex items-center justify-center px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="aurora-bg aurora-soft inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground ring-1 ring-white/50 backdrop-blur-md transition-all hover:-translate-y-px hover:shadow-md disabled:opacity-50"
            disabled={analyzing}
            style={{
              background:
                "linear-gradient(140deg, oklch(1 0 0 / 0.85) 0%, oklch(0.95 0.02 145 / 0.7) 100%)",
              boxShadow:
                "inset 0 1px 0 oklch(1 0 0 / 0.6), 0 6px 18px -8px oklch(0.42 0.07 155 / 0.25)",
            }}
          >
            {mode === "single" ? (
              <User className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Users className="h-3.5 w-3.5 text-primary" />
            )}
            <span>{mode === "single" ? "Single Animal" : "Herd Scan"}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="aurora-bg aurora-soft min-w-[200px] overflow-hidden rounded-xl border-white/40 p-1 text-foreground shadow-xl backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(140deg, oklch(1 0 0 / 0.88) 0%, oklch(0.95 0.02 145 / 0.78) 100%)",
              boxShadow:
                "inset 0 1px 0 oklch(1 0 0 / 0.6), 0 18px 40px -14px oklch(0.42 0.07 155 / 0.35)",
            }}
          >
            <DropdownMenuItem
              onClick={() => setMode("single")}
              className="rounded-lg focus:bg-white/60"
            >
              <User className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Single Animal</span>
                <span className="text-[11px] text-muted-foreground">One cow at a time</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setMode("herd")}
              className="rounded-lg focus:bg-white/60"
            >
              <Users className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Herd Scan</span>
                <span className="text-[11px] text-muted-foreground">Walkthrough assessment</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat area */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-chat-canvas"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              msg={m}
              onFeedChoice={handleFeedChoice}
              feedChoiceDisabled={feedFlow !== "awaiting-choice"}
            />
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
      <footer className="glass z-20">
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
          <div className="flex items-end gap-2 rounded-2xl bg-white/70 p-1.5 ring-1 ring-border/70 backdrop-blur-md focus-within:ring-primary/60 focus-within:shadow-[0_8px_24px_-8px_oklch(0.42_0.07_155/0.3)] transition-all">
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
              placeholder={
                feedFlow === "awaiting-feeds"
                  ? "List your available feeds (e.g. hay, maize silage, concentrate)…"
                  : mode === "herd"
                    ? "Describe your herd or attach a walkthrough video…"
                    : video
                      ? "Animal ID (e.g. 4271)…"
                      : "Describe symptoms or attach a video…"
              }
              className="max-h-[140px] flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={analyzing || (!input.trim() && !video)}
              aria-label="Send"
              className="glow-pulse gradient-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground transition-all hover:brightness-110 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:animate-none disabled:shadow-none"
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
