"use client";

import * as React from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export interface TurnstileGateRef {
  /** A fresh single-use token, "" when no site key is set (dev), or null on failure. */
  getToken: () => Promise<string | null>;
  reset: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Invisible Cloudflare Turnstile. Tokens are single-use, so each send mints a
 * fresh one via execute(). With no site key (local dev), it renders nothing and
 * getToken() returns "" so the server's dev bypass applies.
 */
export const TurnstileGate = React.forwardRef<TurnstileGateRef>(
  function TurnstileGate(_props, ref) {
    const widgetRef = React.useRef<TurnstileInstance | null>(null);
    const resolverRef = React.useRef<((token: string | null) => void) | null>(null);

    const settle = React.useCallback((token: string | null) => {
      const resolve = resolverRef.current;
      resolverRef.current = null;
      resolve?.(token);
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        getToken() {
          if (!SITE_KEY) return Promise.resolve("");
          return new Promise<string | null>((resolve) => {
            resolverRef.current = resolve;
            const widget = widgetRef.current;
            if (!widget) {
              settle(null);
              return;
            }
            widget.reset();
            widget.execute();
            // Never hang a send if the challenge stalls (network, etc.).
            window.setTimeout(() => settle(null), 8000);
          });
        },
        reset() {
          widgetRef.current?.reset();
        },
      }),
      [settle],
    );

    if (!SITE_KEY) return null;

    return (
      <div aria-hidden className="sr-only">
        <Turnstile
          ref={widgetRef}
          siteKey={SITE_KEY}
          options={{ size: "invisible", execution: "execute", appearance: "execute" }}
          onSuccess={(token) => settle(token)}
          onError={() => settle(null)}
          onExpire={() => widgetRef.current?.reset()}
        />
      </div>
    );
  },
);
