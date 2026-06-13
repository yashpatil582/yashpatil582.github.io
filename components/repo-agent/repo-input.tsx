"use client";

import * as React from "react";
import { ArrowUp, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

const EXAMPLES = ["yashpatil582/repomind", "vercel/ai", "modelcontextprotocol/servers"];

/**
 * Repo URL + optional question, with a few example repos. Enter submits the URL
 * field; the question is optional (a sensible default is used when blank).
 */
export function RepoInput({
  repoUrl,
  onRepoUrlChange,
  question,
  onQuestionChange,
  onSubmit,
  onStop,
  disabled,
  streaming,
}: {
  repoUrl: string;
  onRepoUrlChange: (value: string) => void;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  disabled: boolean;
  streaming: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <div className="border-border bg-background focus-within:border-ring focus-within:ring-ring/50 flex items-center gap-2 rounded-xl border p-2 transition-shadow focus-within:ring-3">
        <span className="text-muted-foreground/70 pl-1 text-sm select-none">github.com/</span>
        <label htmlFor="repo-url" className="sr-only">
          Public GitHub repository (owner/repo)
        </label>
        <input
          id="repo-url"
          value={repoUrl}
          onChange={(e) => onRepoUrlChange(e.target.value)}
          placeholder="owner/repo"
          spellCheck={false}
          autoComplete="off"
          className="text-foreground placeholder:text-muted-foreground/70 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {streaming ? (
          <Button type="button" size="icon" variant="outline" onClick={onStop} aria-label="Stop">
            <Square />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={disabled || repoUrl.trim().length === 0}
            aria-label="Explore repository"
          >
            <ArrowUp />
          </Button>
        )}
      </div>

      <label htmlFor="repo-question" className="sr-only">
        Optional question about the repository
      </label>
      <input
        id="repo-question"
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        placeholder="Optional: ask something specific (defaults to “what does it do & how is it structured?”)"
        className="text-muted-foreground placeholder:text-muted-foreground/60 border-border/70 bg-background/60 rounded-lg border px-3 py-2 text-sm outline-none focus:border-ring"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground/70 text-xs">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={disabled}
            onClick={() => onRepoUrlChange(ex)}
            className="border-border text-muted-foreground hover:bg-muted rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
