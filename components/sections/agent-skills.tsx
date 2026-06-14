import { ArrowUpRight, ScrollText } from "lucide-react";

import { agentSkills, AGENT_SKILLS_REPO } from "@/data/agent-skills";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SocialGlyph } from "@/components/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Agent Skills" — published Anthropic SKILL.md skills that package the eval methods
 * behind the live demos. Each card links to the skill's directory in the public
 * `agent-skills` repo and to the demo/project it maps to. Content is the single
 * source of truth in data/agent-skills.ts (also fed to the RAG index).
 */
export function AgentSkills() {
  return (
    <Section
      id="agent-skills"
      eyebrow="Agent Skills"
      title="Reusable Agent Skills"
      description="Two production-grade Anthropic Agent Skills (SKILL.md) that package the eval methods behind the demos above — runnable, spec-faithful, and MIT/Apache-licensed. Each is a faithful, standard-library-only Python port of real, shipped work."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {agentSkills.map((s) => {
          const samePage = s.mapsTo.href.startsWith("#");
          return (
            <Card key={s.slug} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-mono text-base">{s.name}</CardTitle>
                  <Badge variant="outline" className="shrink-0 font-normal">
                    {s.license}
                  </Badge>
                </div>
                <CardDescription className="text-pretty">{s.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3">
                <p className="text-muted-foreground text-xs">
                  <span className="text-brand font-medium">Packages:</span> {s.packages}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {s.tech.map((t) => (
                    <Badge key={t} variant="outline" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <a
                  href={s.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <SocialGlyph name="github" className="size-4" /> View skill
                </a>
                {samePage ? (
                  <a
                    href={s.mapsTo.href}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    {s.mapsTo.label} <ArrowUpRight className="size-4" />
                  </a>
                ) : (
                  <a
                    href={s.mapsTo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    {s.mapsTo.label} <ArrowUpRight className="size-4" />
                  </a>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="text-muted-foreground/70 mt-6 flex items-center gap-1.5 text-xs">
        <ScrollText className="size-3 shrink-0" /> Anthropic SKILL.md format — clone one into{" "}
        <code className="font-mono">~/.claude/skills/</code>. Each runs its worked example and tests
        offline, with no API key.{" "}
        <a
          href={AGENT_SKILLS_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline-offset-4 hover:underline"
        >
          Browse the repo
        </a>
      </p>
    </Section>
  );
}
