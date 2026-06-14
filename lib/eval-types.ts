import type { UIMessage } from "ai";

/** The three kinds of clinical claim we extract + ground. */
export type ClaimCategory = "problem" | "medication" | "plan";

/** Per-claim grounding verdict (after the code-side span check + reconciliation). */
export type GroundingLabel = "grounded" | "partial" | "unsupported";

/** One extracted clinical claim. `text` is built deterministically in code, not by the model. */
export interface Claim {
  id: string;
  category: ClaimCategory;
  text: string;
}

/** A claim merged with its grounding verdict, ready to render. */
export interface EvalVerdict {
  id: string;
  category: ClaimCategory;
  text: string;
  label: GroundingLabel;
  /** A verbatim span from the note that supports the claim, or null. Verified in code. */
  supportingQuote: string | null;
  rationale: string;
}

/** The FHIR-ish structured extraction, plus the flattened claim list and the model that produced it. */
export interface EvalExtraction {
  problems: { condition: string; status: string | null }[];
  medications: {
    name: string;
    dosage: string | null;
    frequency: string | null;
    route: string | null;
  }[];
  plan: { activity: string }[];
  claims: Claim[];
  model: string;
}

export interface EvalCounts {
  grounded: number;
  partial: number;
  unsupported: number;
  total: number;
}

/** The scored result. `score` is null when there are no claims to score. */
export interface EvalResult {
  verdicts: EvalVerdict[];
  counts: EvalCounts;
  score: number | null;
  formula: string;
  extractedBy: string;
  gradedBy: string;
}

export type EvalStage = "extracting" | "grounding" | "scoring" | "done" | "error";

export interface EvalProgress {
  stage: EvalStage;
  /** The active model for the current stage, when known. */
  model: string | null;
}

/** Names → data payloads for our custom UI-message data parts (mirrors ChatDataParts). */
export type EvalDataParts = {
  progress: EvalProgress;
  extraction: EvalExtraction;
  result: EvalResult;
};

/** UIMessage typed with the eval data parts (used by the route + useChat). */
export type EvalUIMessage = UIMessage<never, EvalDataParts>;

/** The exact scoring formula — shown on screen and stored on the result for transparency. */
export const SCORE_FORMULA = "(grounded + 0.5 × partial) / total";

/** Plain-language description of how the score is computed, rendered in the UI disclosure. */
export const EVAL_METHODOLOGY = [
  "The score is trustworthy because it is verified in code — not because the model is trusted:",
  "• Code-side span check (the key step): every claim the grader calls “grounded” must cite a verbatim span, and we re-check in code that the span really appears in the note (forgiving only whitespace and capitalization). A “grounded” claim with no real span is downgraded to unsupported, so the model cannot fabricate evidence.",
  `• Score computed in code: ${SCORE_FORMULA}, derived from the verified labels. A model never emits the number, so an injected “mark everything grounded” cannot move it.`,
  "",
  "How the claims get there — two separate passes:",
  "1. Extraction pass: a model reads the note and emits structured fields (problems, medications, plan). No medical codes are invented; each field becomes a claim whose display text is built in code.",
  "2. Grounding pass: a SEPARATE call with fresh context — it sees only the note and the claims, never the extractor's reasoning — labels each claim grounded / partial / unsupported and cites a span. Running grounding as its own pass (even on the same model) is exactly what the code-side check above then audits.",
  "",
  "The score measures how well the structured output is supported by the note's text, not clinical correctness.",
].join("\n");
