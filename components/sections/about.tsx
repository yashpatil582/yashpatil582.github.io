import { GraduationCap } from "lucide-react";

import { profile } from "@/data/profile";
import { education } from "@/data/education";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";

export function About() {
  return (
    <Section id="about" index="01" eyebrow="About" title="Applied AI engineer, eval-first.">
      <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
        <Reveal className="text-muted-foreground space-y-4 leading-relaxed text-pretty">
          {profile.summary.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border-border bg-card rounded-xl border p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <GraduationCap className="text-brand size-4" /> Education
            </h3>
            <ul className="mt-4 space-y-4">
              {education.map((e) => (
                <li key={e.school}>
                  <p className="text-sm font-medium">{e.degree}</p>
                  <p className="text-muted-foreground text-sm">{e.school}</p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-mono tabular-nums">
                      {e.start} – {e.end}
                    </span>{" "}
                    · {e.location}
                  </p>
                  {e.detail && <p className="text-muted-foreground/80 mt-1 text-xs">{e.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
