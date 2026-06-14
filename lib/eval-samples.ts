/**
 * Synthetic, clearly-fictional clinical notes for the eval demo. NO real PHI.
 * Each note is engineered to yield a non-trivial grounding score — a grounded
 * core plus at least one inference "lure" — so the demo lands well below a
 * trivial 100% and shows the grader actually catching unsupported claims.
 */
export interface SampleNote {
  id: string;
  /** Short chip label shown in the UI. */
  label: string;
  note: string;
}

export const SAMPLE_NOTES: SampleNote[] = [
  {
    id: "t2dm",
    label: "T2DM follow-up",
    note: `Patient: "Jordan Sample" (fictional), 58 y/o. MRN: SAMPLE-0001.
Established type 2 diabetes, well controlled. Reports occasional morning headaches.
BP today 138/86. No chest pain, no shortness of breath.
Current medications: metformin 500 mg twice daily; lisinopril 10 mg once daily (started last visit).
Most recent A1c was 7.1%, drawn three months ago.
Assessment/Plan: continue metformin and lisinopril; recheck A1c in 3 months;
begin a home blood-pressure log; follow up in 12 weeks.
Counseled on diet and walking 30 minutes daily.`,
  },
  {
    id: "asthma",
    label: "Asthma urgent visit",
    note: `Patient: "Riley Placeholder" (fictional), 24 y/o. MRN: SAMPLE-0002.
Presents with two days of wheezing and cough, worse at night.
History of mild intermittent asthma. Using an albuterol inhaler "a few times this week."
Exam: scattered expiratory wheezes, no respiratory distress, SpO2 97% on room air. No fever reported.
Assessment: asthma, currently symptomatic.
Plan: start a fluticasone inhaler; continue albuterol as needed;
return if symptoms worsen; recheck in two weeks.`,
  },
];
