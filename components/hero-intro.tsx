"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MessageSquare } from "lucide-react";

import { profile } from "@/data/profile";
import { buttonVariants } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { SocialGlyph } from "@/components/brand-icons";
import { StatusDot } from "@/components/status-dot";
import { groupContainer, groupItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Hero left column with a restrained "boot" entrance: the surrounding elements
 * stagger in on mount while the name (h1) stays static and paints immediately —
 * protecting LCP and reading as the anchor everything assembles around. Renders a
 * plain static tree under prefers-reduced-motion.
 */
export function HeroIntro() {
  const reduce = useReducedMotion();

  const badge = profile.available ? (
    <div className="border-hairline bg-card/60 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
      <StatusDot />
      Open to AI/ML engineering roles
    </div>
  ) : null;

  const name = (
    <h1 className="headline-gradient font-heading text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-5xl md:text-6xl lg:text-7xl">
      {profile.name}
    </h1>
  );

  const role = (
    <p className="text-muted-foreground mt-3 text-xl tracking-[-0.01em] sm:text-2xl">
      {profile.title} ·{" "}
      <span className="text-gradient-brand font-medium">
        <Typewriter words={profile.roles} />
      </span>
    </p>
  );

  const tagline = <p className="text-muted-foreground mt-6 max-w-xl text-pretty">{profile.tagline}</p>;

  const ctas = (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <a href="#chat" className={cn(buttonVariants({ size: "lg" }))}>
        <MessageSquare className="size-4" /> Chat with Yash
      </a>
      <a href="#projects" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
        View work <ArrowRight className="size-4" />
      </a>
    </div>
  );

  const socials = (
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
  );

  if (reduce) {
    return (
      <div>
        {badge}
        {name}
        {role}
        {tagline}
        {ctas}
        {socials}
      </div>
    );
  }

  return (
    <motion.div variants={groupContainer} initial="hidden" animate="show">
      {badge && <motion.div variants={groupItem}>{badge}</motion.div>}
      {name}
      <motion.div variants={groupItem}>{role}</motion.div>
      <motion.div variants={groupItem}>{tagline}</motion.div>
      <motion.div variants={groupItem}>{ctas}</motion.div>
      <motion.div variants={groupItem}>{socials}</motion.div>
    </motion.div>
  );
}
