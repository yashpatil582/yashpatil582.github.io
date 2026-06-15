import { experience } from "@/data/experience";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Experience() {
  return (
    <Section id="experience" index="02" eyebrow="Experience" title="Where I've shipped.">
      <ol className="border-border relative space-y-10 border-l pl-6 sm:pl-8">
        {experience.map((job, i) => (
          <li key={`${job.company}-${i}`} className="relative">
            <span className="border-border bg-background absolute top-1 -left-[31px] flex size-4 items-center justify-center rounded-full border sm:-left-[39px]">
              <span
                className={cn(
                  "size-2 rounded-full",
                  job.current ? "bg-brand" : "bg-muted-foreground/40",
                )}
              />
            </span>
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-medium">
                  {job.role} · <span className="text-muted-foreground">{job.company}</span>
                </h3>
                <p className="text-muted-foreground text-xs">
                  <span className="font-mono tabular-nums">
                    {job.start} – {job.end}
                  </span>
                  {job.location ? ` · ${job.location}` : ""}
                </p>
              </div>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                {job.highlights.map((h, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="bg-brand/70 mt-2 size-1 shrink-0 rounded-full" />
                    <span className="text-pretty">{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tech.map((t) => (
                  <Badge key={t} variant="mono">
                    {t}
                  </Badge>
                ))}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
