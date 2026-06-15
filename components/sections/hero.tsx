import Image from "next/image";

import { profile } from "@/data/profile";
import { HeroIntro } from "@/components/hero-intro";
import { HeroSpotlight } from "@/components/hero-spotlight";
import { NumberTicker } from "@/components/number-ticker";
import { StatusDot } from "@/components/status-dot";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="bg-aurora pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <HeroSpotlight />

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 pt-32 pb-16 sm:pt-40 md:grid-cols-[1.4fr_1fr] md:pb-24">
        <HeroIntro />

        <div className="relative mx-auto md:mx-0">
          <div aria-hidden className="bg-brand/10 absolute -inset-4 -z-10 rounded-full blur-2xl" />
          <Image
            src="/profile.png"
            alt={`Portrait of ${profile.name}`}
            width={360}
            height={360}
            priority
            className="border-hairline aspect-square w-56 rounded-2xl border object-cover shadow-elev-lg sm:w-72 md:w-full"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="surface-glass surface-glass-lit relative overflow-hidden rounded-xl">
          <div className="border-hairline flex items-center justify-between border-b px-5 py-2.5">
            <span className="label-mono text-muted-foreground">Telemetry</span>
            <span className="label-mono text-muted-foreground inline-flex items-center gap-1.5">
              <StatusDot /> Live
            </span>
          </div>
          <dl className="bg-border grid grid-cols-2 gap-px sm:grid-cols-4">
            {profile.metrics.map((m, i) => (
              <div key={m.label} className="bg-card px-5 py-5">
                <dt className="font-mono text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                  <span aria-hidden className="label-mono text-muted-foreground mb-1 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <NumberTicker value={m.value} />
                </dt>
                <dd className="text-muted-foreground mt-1 text-xs">{m.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
