import { Lock, ShieldAlert, Stethoscope } from "lucide-react";

import { EvalAgent } from "@/components/eval/eval-agent";
import { Section } from "@/components/section";

/**
 * "Score a note for hallucinations" — a live eval demo. A model extracts a
 * structured, FHIR-ish summary from a clinical note; a separate grader checks each
 * extracted claim against the source for grounding, and the score is computed in
 * code (not by a model) with the methodology shown. Maps to ClinEval + Open-Scribe.
 */
export function EvalCta() {
  return (
    <Section
      id="eval"
      eyebrow="Clinical eval"
      title="Score a note for hallucinations"
      description="Paste a synthetic clinical note. One model extracts a structured, FHIR-ish summary (problems, medications, plan); a separate grader checks every extracted claim against the source note and labels it grounded, partial, or unsupported. The grounding score is computed in code from those labels — the methodology is shown, not hidden."
    >
      <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-4 sm:p-6">
        <div
          aria-hidden
          className="bg-glow pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        />

        {/* Non-dismissable PHI warning. */}
        <div
          role="note"
          className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p className="text-pretty">
            <span className="font-medium">
              Use synthetic data only — never real patient information (PHI).
            </span>{" "}
            Your note is processed in memory and is{" "}
            <span className="font-medium">not stored or logged</span> by this site; it is sent to a
            model provider for processing only.
          </p>
        </div>

        <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
          <Stethoscope className="text-brand size-4" /> Two-pass eval · structured extraction +
          per-claim grounding · score computed in code
        </p>

        <EvalAgent />

        <p className="text-muted-foreground/70 mt-4 flex items-center gap-1.5 text-xs">
          <Lock className="size-3 shrink-0" /> Runs through the same rate-limited, bot-checked proxy
          as the other demos. The note is treated as untrusted data, kept in memory only, and never
          logged or persisted. No API keys in the browser.
        </p>
      </div>
    </Section>
  );
}
