export type Severity = "MILD" | "MODERATE" | "SEVERE";

export interface TriageResult {
  severity: Severity;
  body_condition_score: number; // 1-5
  confidence: number; // 0-1 or 0-100
  conditions: string[];
  clinical_observations: string;
  treatment_recommendation: string;
  animal_id?: string;
}

export type ChatMessage =
  | { id: string; role: "user"; text: string; videoName?: string; videoUrl?: string }
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "bot-report"; result: TriageResult };
