"use client";

import { Check, Minus, TriangleAlert, X } from "lucide-react";

import {
  type ClaimCategory,
  EVAL_METHODOLOGY,
  type EvalExtraction,
  type EvalProgress,
  type EvalResult,
  type GroundingLabel,
} from "@/lib/eval-types";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<ClaimCategory, { title: string; fhir: string }> = {
  problem: { title: "Problems", fhir: "FHIR Condition" },
  medication: { title: "Medications", fhir: "FHIR MedicationStatement" },
  plan: { title: "Plan", fhir: "FHIR CarePlan" },
};
const CATEGORY_ORDER: ClaimCategory[] = ["problem", "medication", "plan"];

const LABEL_META: Record<GroundingLabel, { text: string; cls: string; Icon: typeof Check }> = {
  grounded: { text: "Grounded", cls: "border-brand/50 bg-brand/15 text-brand", Icon: Check },
  partial: {
    text: "Partial",
    cls: "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Icon: Minus,
  },
  unsupported: {
    text: "Unsupported",
    cls: "border-destructive/50 bg-destructive/15 text-destructive",
    Icon: X,
  },
};

type StepState = "pending" | "active" | "done";

function StepDot({ state }: { state: StepState }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border",
        state === "done"
          ? "border-brand/50 bg-brand/15 text-brand"
          : state === "active"
            ? "border-brand/40 bg-background text-brand"
            : "border-border bg-background text-muted-foreground",
      )}
    >
      {state === "done" ? (
        <Check className="size-2.5" />
      ) : state === "active" ? (
        <span className="bg-brand size-1.5 animate-pulse rounded-full" />
      ) : (
        <span className="bg-muted-foreground/40 size-1.5 rounded-full" />
      )}
    </span>
  );
}

function PipelineTimeline({
  progress,
  hasExtraction,
  hasResult,
}: {
  progress: EvalProgress | undefined;
  hasExtraction: boolean;
  hasResult: boolean;
}) {
  const stage = progress?.stage;
  const extract: StepState = hasExtraction ? "done" : stage === "extracting" ? "active" : "pending";
  const ground: StepState = hasResult
    ? "done"
    : stage === "grounding"
      ? "active"
      : stage === "scoring"
        ? "done"
        : "pending";
  const score: StepState = hasResult ? "done" : stage === "scoring" ? "active" : "pending";

  const steps: { label: string; state: StepState }[] = [
    { label: "Extract structure", state: extract },
    { label: "Ground each claim", state: ground },
    { label: "Score (in code)", state: score },
  ];

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <StepDot state={s.state} />
          <span className={cn(s.state === "pending" ? "text-muted-foreground" : "text-foreground")}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span aria-hidden className="text-muted-foreground/40">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function ScorePanel({ result }: { result: EvalResult }) {
  const { counts, score } = result;
  if (score === null) {
    return (
      <div className="border-border bg-background rounded-xl border p-4 text-sm">
        <p className="text-muted-foreground">
          No verifiable clinical claims were extracted — there is nothing to score.
        </p>
      </div>
    );
  }
  const pct = Math.round(score * 100);
  return (
    <div className="border-border bg-background rounded-xl border p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Grounding score</p>
          <p className="text-foreground text-4xl font-semibold tabular-nums">{pct}%</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <Tally label="Grounded" value={counts.grounded} dot="bg-brand" />
          <Tally label="Partial" value={counts.partial} dot="bg-amber-500" />
          <Tally label="Unsupported" value={counts.unsupported} dot="bg-destructive" />
          <Tally label="Total" value={counts.total} dot="bg-muted-foreground" />
        </div>
      </div>
      <p className="text-muted-foreground mt-3 font-mono text-xs">
        {result.formula} = ({counts.grounded} + 0.5 × {counts.partial}) / {counts.total} = {pct}%
      </p>
    </div>
  );
}

function Tally({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5">
      <span aria-hidden className={cn("size-2 rounded-full", dot)} />
      <span className="text-foreground tabular-nums">{value}</span> {label}
    </span>
  );
}

function ClaimRow({
  text,
  label,
  supportingQuote,
  rationale,
}: {
  text: string;
  label: GroundingLabel | null;
  supportingQuote: string | null;
  rationale: string | null;
}) {
  const meta = label ? LABEL_META[label] : null;
  return (
    <li className="border-border/70 flex flex-col gap-1.5 border-t py-2.5 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <span className="text-foreground text-sm text-pretty">{text}</span>
        {meta ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              meta.cls,
            )}
          >
            <meta.Icon className="size-3" /> {meta.text}
          </span>
        ) : (
          <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs">
            <span className="bg-brand size-1.5 animate-pulse rounded-full" /> grading…
          </span>
        )}
      </div>
      {supportingQuote && (
        <p className="text-muted-foreground border-brand/40 border-l-2 pl-2 text-xs italic">
          “{supportingQuote}”
        </p>
      )}
      {rationale && <p className="text-muted-foreground/80 text-xs text-pretty">{rationale}</p>}
    </li>
  );
}

type Row = {
  id: string;
  category: ClaimCategory;
  text: string;
  label: GroundingLabel | null;
  supportingQuote: string | null;
  rationale: string | null;
};

/**
 * Renders the eval pipeline: a live Extract → Ground → Score timeline, the
 * code-computed grounding score, the FHIR-ish extraction grouped by category with
 * per-claim verdicts, and a "how this is scored" disclosure. All model-supplied
 * strings render as plain text (no HTML). Reduced-motion is handled globally.
 */
export function EvalResults({
  progress,
  extraction,
  result,
  streaming,
}: {
  progress: EvalProgress | undefined;
  extraction: EvalExtraction | undefined;
  result: EvalResult | undefined;
  streaming: boolean;
}) {
  const isError = progress?.stage === "error";

  // Prefer graded verdicts; before grading lands, show the extracted claims as pending.
  const rows: Row[] = result
    ? result.verdicts.map((v) => ({
        id: v.id,
        category: v.category,
        text: v.text,
        label: v.label,
        supportingQuote: v.supportingQuote,
        rationale: v.rationale,
      }))
    : (extraction?.claims ?? []).map((c) => ({
        id: c.id,
        category: c.category,
        text: c.text,
        label: null,
        supportingQuote: null,
        rationale: null,
      }));

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4 sm:p-5">
      <PipelineTimeline progress={progress} hasExtraction={!!extraction} hasResult={!!result} />

      {isError && (
        <div
          role="status"
          className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p className="text-pretty">
            {extraction
              ? "Extraction is shown below, but the grounding step is unavailable right now. Please try again to score it."
              : "The eval is seeing high demand right now — please try again in a moment."}
          </p>
        </div>
      )}

      {result && <ScorePanel result={result} />}

      {rows.length > 0 ? (
        <div className="flex flex-col gap-4">
          {CATEGORY_ORDER.map((cat) => {
            const group = rows.filter((r) => r.category === cat);
            if (group.length === 0) return null;
            const meta = CATEGORY_META[cat];
            return (
              <section key={cat}>
                <h4 className="text-foreground mb-1 flex items-baseline gap-2 text-sm font-medium">
                  {meta.title}
                  <span className="text-muted-foreground/70 font-mono text-xs">{meta.fhir}</span>
                </h4>
                <ul>
                  {group.map((r) => (
                    <ClaimRow
                      key={r.id}
                      text={r.text}
                      label={r.label}
                      supportingQuote={r.supportingQuote}
                      rationale={r.rationale}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        !isError && (
          <p className={cn("text-muted-foreground text-sm", streaming && "animate-pulse")}>
            {streaming
              ? "Extracting structured data from the note…"
              : "No structured data was extracted."}
          </p>
        )
      )}

      {result && (
        <p className="text-muted-foreground/70 text-xs">
          Extracted by <span className="text-foreground font-medium">{result.extractedBy}</span> ·
          graded by <span className="text-foreground font-medium">{result.gradedBy}</span>
        </p>
      )}

      <details className="border-border/70 rounded-lg border px-3 py-2 text-sm">
        <summary className="text-foreground cursor-pointer font-medium select-none">
          How this score is computed
        </summary>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed whitespace-pre-wrap">
          {EVAL_METHODOLOGY}
        </p>
      </details>
    </div>
  );
}
