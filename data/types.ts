/**
 * Single source of truth for all portfolio content.
 *
 * These typed records feed BOTH the rendered site AND (from Stage 1) the RAG
 * ingest pipeline for the "Chat with Yash" agent. Never hand-duplicate this
 * content elsewhere — edit it here and both surfaces stay in sync.
 */

export type SocialIcon = "github" | "linkedin" | "twitter" | "mail";

export interface Social {
  label: string;
  href: string;
  handle: string;
  icon: SocialIcon;
}

export interface Metric {
  /** Short, punchy value, e.g. "2M+". */
  value: string;
  /** What the value measures, e.g. "queries / day". */
  label: string;
}

export interface Profile {
  name: string;
  /** Headline role shown under the name. */
  title: string;
  /** Rotating descriptors for the hero typing animation. */
  roles: string[];
  /** One-line positioning statement. */
  tagline: string;
  location: string;
  email: string;
  /** Whether to show the "open to opportunities" status. */
  available: boolean;
  /** Public path to the résumé PDF in /public. */
  resumeUrl: string;
  /** About-section paragraphs (Markdown-free plain text). */
  summary: string[];
  metrics: Metric[];
  socials: Social[];
}

export interface Experience {
  company: string;
  role: string;
  /** e.g. "Oct 2024". */
  start: string;
  /** e.g. "Present". */
  end: string;
  location: string;
  current?: boolean;
  highlights: string[];
  tech: string[];
}

export interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
  location: string;
  detail?: string;
}

export type ProjectCategory = "AI/ML" | "LLM" | "Agents" | "Data" | "Web";

export interface Project {
  /** Stable id used for keys, anchors, and (Stage 1) RAG metadata. */
  slug: string;
  name: string;
  description: string;
  /** Optional headline impact/metric shown as a chip. */
  impact?: string;
  tech: string[];
  categories: ProjectCategory[];
  /** Public GitHub URL. Omit if the repo is private. */
  repo?: string;
  /** Live demo URL. Omit if there is no hosted demo. */
  demo?: string;
  featured?: boolean;
}

export interface SkillGroup {
  name: string;
  skills: string[];
}

/**
 * A published Anthropic Agent Skill (SKILL.md) packaging a method from real work.
 * Lives in the dedicated public `agent-skills` repo; surfaced on the site and fed
 * to the RAG index from this single source of truth.
 */
export interface AgentSkill {
  /** Stable id; equals the skill's directory name and SKILL.md `name`. */
  slug: string;
  name: string;
  /** One line: what the skill does. */
  description: string;
  /** Which real project/method it packages. */
  packages: string;
  tech: string[];
  /** SPDX-ish license id, e.g. "MIT" or "Apache-2.0". */
  license: string;
  /** Deep link to the skill directory on GitHub. */
  repo: string;
  /** The live demo or project this skill maps to. `href` may be a `#anchor`. */
  mapsTo: { label: string; href: string };
}
