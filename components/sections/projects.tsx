"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { projects, projectCategories } from "@/data/projects";
import type { ProjectCategory } from "@/data/types";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
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

type Filter = "All" | ProjectCategory;

export function Projects() {
  const [filter, setFilter] = React.useState<Filter>("All");
  const filters: Filter[] = ["All", ...projectCategories];
  const shown = filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <Section
      id="projects"
      index="03"
      eyebrow="Projects"
      title="Things I've built."
      description="Open-source and mostly AI-native. The featured projects power the live demos arriving on this site."
    >
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1 font-mono text-xs tracking-tight transition-colors",
              filter === f
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Reveal className="grid gap-5 sm:grid-cols-2">
        {shown.map((p) => (
          <Card key={p.slug} className={cn("h-full", p.featured && "surface-glass-lit")}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{p.name}</CardTitle>
                {p.featured && (
                  <Badge variant="secondary" className="text-brand shrink-0">
                    Featured
                  </Badge>
                )}
              </div>
              <CardDescription className="text-pretty">{p.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">
              {p.impact && <p className="text-brand text-xs font-medium">{p.impact}</p>}
              <div className="mt-auto flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <Badge key={t} variant="mono">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>

            {(p.repo || p.demo) && (
              <CardFooter className="gap-2">
                {p.repo && (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    <SocialGlyph name="github" className="size-4" /> Code
                  </a>
                )}
                {p.demo &&
                  (p.demo.startsWith("#") ? (
                    // Same-page live demo — scroll, don't open a new tab.
                    <a
                      href={p.demo}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Live demo <ArrowUpRight className="size-4" />
                    </a>
                  ) : (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Demo <ArrowUpRight className="size-4" />
                    </a>
                  ))}
              </CardFooter>
            )}
          </Card>
        ))}
      </Reveal>
    </Section>
  );
}
