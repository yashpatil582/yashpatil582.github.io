"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

/**
 * Code-split the three live demos into their own chunks and mount them only when
 * the user scrolls near (IntersectionObserver). This keeps the heavy client JS
 * (@ai-sdk/react ×3 + deps) out of the landing page's initial bundle. The demos
 * themselves are byte-for-byte unchanged — only their mount timing differs. A
 * reserved-height skeleton holds the space to avoid layout shift.
 */
const ChatAgent = dynamic(() => import("@/components/chat/chat-agent").then((m) => m.ChatAgent), {
  ssr: false,
});
const RepoAgent = dynamic(() => import("@/components/repo-agent/repo-agent").then((m) => m.RepoAgent), {
  ssr: false,
});
const EvalAgent = dynamic(() => import("@/components/eval/eval-agent").then((m) => m.EvalAgent), {
  ssr: false,
});

function DemoSkeleton({ minHeight }: { minHeight: string }) {
  return (
    <div
      className={cn(
        "border-hairline bg-muted/20 flex items-center justify-center rounded-xl border",
      )}
      style={{ minHeight }}
      aria-hidden
    >
      <span className="label-mono text-muted-foreground animate-pulse">Loading demo…</span>
    </div>
  );
}

type LazyDemoProps =
  | { kind: "chat"; suggestions: string[]; minHeight?: string }
  | { kind: "repo-agent"; minHeight?: string }
  | { kind: "eval"; minHeight?: string };

export function LazyDemo(props: LazyDemoProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Ancient-browser fallback: mount on next frame (never synchronously in the
      // effect body) so the demo still loads without IntersectionObserver.
      const raf = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      // Preload a little before the section enters the viewport.
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const minHeight = props.minHeight ?? "20rem";

  return (
    <div ref={ref}>
      {show ? (
        props.kind === "chat" ? (
          <ChatAgent suggestions={props.suggestions} />
        ) : props.kind === "repo-agent" ? (
          <RepoAgent />
        ) : (
          <EvalAgent />
        )
      ) : (
        <DemoSkeleton minHeight={minHeight} />
      )}
    </div>
  );
}
