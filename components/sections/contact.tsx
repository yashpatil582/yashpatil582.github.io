"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { profile } from "@/data/profile";
import { Section } from "@/components/section";
import { SocialGlyph } from "@/components/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Contact() {
  const [copied, setCopied] = React.useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — email me at " + profile.email);
    }
  };

  return (
    <Section
      id="contact"
      index="09"
      eyebrow="Contact"
      title="Let's build something."
      description="Open to AI/ML engineering roles and genuinely hard problems. The fastest way to reach me is email."
    >
      <div className="border-hairline bg-card flex flex-col items-start gap-6 rounded-2xl border p-6 shadow-elev-md sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="label-mono text-muted-foreground">Email</p>
          <button
            type="button"
            onClick={copyEmail}
            className="group flex cursor-pointer items-center gap-2 text-lg font-medium"
            title="Click to copy"
          >
            {profile.email}
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a href={`mailto:${profile.email}`} className={cn(buttonVariants({ size: "lg" }))}>
            Email me
          </a>
          {profile.socials
            .filter((s) => s.icon !== "mail")
            .map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }))}
              >
                <SocialGlyph name={s.icon} className="size-[18px]" />
              </a>
            ))}
        </div>
      </div>
    </Section>
  );
}
