"use client";

import { useState } from "react";

/**
 * Documentation code block with a copy button and an optional title bar.
 * Deliberately lightweight — no syntax-highlighting dependency. Brand rule:
 * minimal, fast, flat. Monospace renders cleanly on the warm surface.
 */
export function CodeBlock({
  code,
  language = "bash",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{title ?? language}</span>
        <button
          type="button"
          className="code-block__copy"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="code-block__pre"
        tabIndex={0}
        role="region"
        aria-label={`${title ?? language} code sample`}
      >
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}
