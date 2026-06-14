// Flatten the typed content layer (data/*.ts — the single source of truth) into
// retrievable RAG documents. Relative imports so `tsx` runs this with no path-alias
// resolver. One document per entity: the corpus is tiny, so no chunk-splitting.

import { agentSkills } from "../../data/agent-skills";
import { education } from "../../data/education";
import { experience } from "../../data/experience";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { skills } from "../../data/skills";

export interface IngestDoc {
  type: "profile" | "experience" | "project" | "skill" | "education" | "agent_skill";
  source_label: string;
  anchor: string;
  content: string;
  metadata: Record<string, unknown>;
}

export function buildDocuments(): IngestDoc[] {
  const docs: IngestDoc[] = [];

  // Profile: each summary paragraph as its own doc (better recall) + a facts doc.
  profile.summary.forEach((para, i) =>
    docs.push({
      type: "profile",
      source_label: `${profile.name} — About`,
      anchor: "#about",
      content: para,
      metadata: { kind: "summary", index: i },
    }),
  );
  docs.push({
    type: "profile",
    source_label: `${profile.name} — Profile`,
    anchor: "#about",
    content: [
      `${profile.name} is an ${profile.title} based in ${profile.location}.`,
      `Positioning: ${profile.tagline}`,
      `Focus areas: ${profile.roles.join(", ")}.`,
      `Headline metrics: ${profile.metrics.map((m) => `${m.value} ${m.label}`).join("; ")}.`,
      `Open to opportunities: ${profile.available ? "yes" : "no"}. Contact: ${profile.email}.`,
    ].join(" "),
    metadata: { kind: "facts", email: profile.email },
  });

  experience.forEach((e) =>
    docs.push({
      type: "experience",
      source_label: `${e.company} — ${e.role}`,
      anchor: "#experience",
      content:
        `${e.role} at ${e.company} (${e.start}–${e.end}, ${e.location}). ` +
        `${e.highlights.join(" ")} Tech: ${e.tech.join(", ")}.`,
      metadata: { company: e.company, role: e.role, current: Boolean(e.current), tech: e.tech },
    }),
  );

  projects.forEach((p) =>
    docs.push({
      type: "project",
      source_label: p.name,
      anchor: "#projects",
      content:
        `${p.name}: ${p.description} ` +
        (p.impact ? `Impact: ${p.impact}. ` : "") +
        `Tech: ${p.tech.join(", ")}. Categories: ${p.categories.join(", ")}.`,
      metadata: {
        slug: p.slug,
        repo: p.repo ?? null,
        demo: p.demo ?? null,
        featured: Boolean(p.featured),
        tech: p.tech,
      },
    }),
  );

  skills.forEach((g) =>
    docs.push({
      type: "skill",
      source_label: `Skills — ${g.name}`,
      anchor: "#skills",
      content: `${g.name}: ${g.skills.join(", ")}.`,
      metadata: { group: g.name },
    }),
  );

  agentSkills.forEach((s) =>
    docs.push({
      type: "agent_skill",
      source_label: `Agent Skill — ${s.name}`,
      anchor: "#agent-skills",
      content:
        `${s.name} is a published Anthropic Agent Skill (SKILL.md). ${s.description} ` +
        `It packages ${s.packages} Tech: ${s.tech.join(", ")}. License: ${s.license}. ` +
        `Source: ${s.repo}.`,
      metadata: { slug: s.slug, repo: s.repo, license: s.license, tech: s.tech },
    }),
  );

  // Education renders inside the About section — anchor there (no #education anchor).
  education.forEach((ed) =>
    docs.push({
      type: "education",
      source_label: ed.school,
      anchor: "#about",
      content:
        `${ed.degree}, ${ed.school} (${ed.start}–${ed.end}, ${ed.location}).` +
        (ed.detail ? ` ${ed.detail}` : ""),
      metadata: { school: ed.school, degree: ed.degree },
    }),
  );

  return docs;
}
