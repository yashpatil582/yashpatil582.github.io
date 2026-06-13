"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Menu, X } from "lucide-react";

import { profile } from "@/data/profile";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#repo-agent", label: "Repo Agent" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Defer the initial read out of the effect body (avoids a synchronous
    // setState) while still catching pages loaded already scrolled.
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors",
        scrolled
          ? "border-border bg-background/80 border-b backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="#top" className="font-heading text-sm font-bold tracking-tight">
          Yash<span className="text-brand">.</span>Patil
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            <FileText className="size-4" /> Résumé
          </a>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-border bg-background/95 border-t backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex max-w-5xl flex-col px-4 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-muted block rounded-md px-3 py-2.5 text-sm"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-muted block rounded-md px-3 py-2.5 text-sm"
              >
                Résumé ↗
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
