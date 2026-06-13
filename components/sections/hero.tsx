import Image from "next/image";
import { ArrowRight, MessageSquare } from "lucide-react";

import { profile } from "@/data/profile";
import { buttonVariants } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { SocialGlyph } from "@/components/brand-icons";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="bg-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]"
      />

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 pt-32 pb-16 sm:pt-40 md:grid-cols-[1.4fr_1fr] md:pb-24">
        <div>
          {profile.available && (
            <div className="border-border bg-card/60 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Open to AI/ML engineering roles
            </div>
          )}

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            {profile.name}
          </h1>

          <p className="text-muted-foreground mt-3 text-xl sm:text-2xl">
            {profile.title} ·{" "}
            <span className="text-gradient-brand font-medium">
              <Typewriter words={profile.roles} />
            </span>
          </p>

          <p className="text-muted-foreground mt-6 max-w-xl text-pretty">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#chat" className={cn(buttonVariants({ size: "lg" }))}>
              <MessageSquare className="size-4" /> Chat with Yash
            </a>
            <a href="#projects" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              View work <ArrowRight className="size-4" />
            </a>
          </div>

          <ul className="mt-8 flex items-center gap-0.5">
            {profile.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.icon === "mail" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                >
                  <SocialGlyph name={s.icon} className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto md:mx-0">
          <div aria-hidden className="bg-brand/15 absolute -inset-4 -z-10 rounded-full blur-2xl" />
          <Image
            src="/profile.png"
            alt={`Portrait of ${profile.name}`}
            width={360}
            height={360}
            priority
            className="border-border aspect-square w-56 rounded-2xl border object-cover shadow-xl sm:w-72 md:w-full"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6">
        <dl className="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
          {profile.metrics.map((m) => (
            <div key={m.label} className="bg-card px-5 py-5">
              <dt className="text-2xl font-semibold tracking-tight sm:text-3xl">{m.value}</dt>
              <dd className="text-muted-foreground mt-1 text-xs">{m.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
