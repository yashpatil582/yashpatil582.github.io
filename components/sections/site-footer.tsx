import { profile } from "@/data/profile";
import { SocialGlyph } from "@/components/brand-icons";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-muted-foreground text-xs">
          © {year} {profile.name}. Built with Next.js · open-source (MIT).
        </p>
        <div className="flex items-center gap-3">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.icon === "mail" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SocialGlyph name={s.icon} className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
