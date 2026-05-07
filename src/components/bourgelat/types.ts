export type Severity = "MILD" | "MODERATE" | "SEVERE";

export interface TriageAnalysis {
  bcs_score?: number | null;
  conditions?: string[];
  severity_score?: number | null;
  confidence?: number | null;
  observations?: string;
  disclaimer?: string;
}

export interface TriageInfo {
  level?: string;
  action?: string;
  reason?: string;
}

export interface TriageApiResponse {
  analysis?: TriageAnalysis;
  triage?: TriageInfo;
  treatment_context?: string;
  disclaimer?: string;
}

export interface TriageResult {
  severity: Severity;
  body_condition_score?: number | null;
  confidence?: number | null;
  conditions: string[];
  clinical_observations: string;
  treatment_recommendation: string;
  animal_id?: string;
  triage_action?: string;
  triage_reason?: string;
}

export interface FeedRationItem {
  name: string;
  amount?: string;
  cost?: string;
  note?: string;
}

export interface FeedRation {
  raw: unknown;
  summary?: string;
  items: FeedRationItem[];
  notes?: string;
  disclaimer?: string;
  estimatedWeightKg?: number | null;
  productionStage?: string;
  dryMatterRequiredKg?: number | null;
  totalDailyCost?: number | null;
}

export type ChatMessage =
  | { id: string; role: "user"; text: string; videoName?: string; videoUrl?: string }
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "bot-report"; result: TriageResult }
  | { id: string; role: "bot-feed-prompt" }
  | { id: string; role: "bot-feed"; ration: FeedRation; bcs?: number | null };
