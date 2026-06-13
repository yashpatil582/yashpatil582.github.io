import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/** Consistent vertical rhythm + heading treatment for every page section. */
export function Section({ id, eyebrow, title, description, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-5xl px-6">
        {(eyebrow || title || description) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="text-brand mb-3 text-sm font-medium tracking-widest uppercase">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
              </h2>
            )}
            {description && <p className="text-muted-foreground mt-4 text-pretty">{description}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
