import { skills } from "@/data/skills";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="Tools I reach for." className="bg-muted/30">
      <div className="grid gap-6 sm:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal key={group.name} delay={i * 0.03}>
            <div className="border-border bg-card h-full rounded-xl border p-5">
              <h3 className="text-sm font-semibold">{group.name}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {group.skills.map((s) => (
                  <li
                    key={s}
                    className="border-border bg-background text-muted-foreground rounded-md border px-2 py-1 text-xs"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
