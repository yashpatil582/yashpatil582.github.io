import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  /** Two-digit section index, e.g. "03". Rendered as a mono "03 / EYEBROW" label. */
  index?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/** Consistent vertical rhythm + heading treatment for every page section. */
export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-5xl px-6">
        {(eyebrow || title || description) && (
          <header className="mb-12 max-w-2xl">
            {(eyebrow || index) && (
              <p className="label-mono mb-3 flex items-center gap-2">
                {index && <span className="text-muted-foreground/70 tabular-nums">{index}</span>}
                {index && eyebrow && (
                  <span aria-hidden className="text-border">
                    /
                  </span>
                )}
                {eyebrow && <span className="text-brand">{eyebrow}</span>}
              </p>
            )}
            {title && (
              <h2 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">{description}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
