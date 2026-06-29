"use client";

import { useState } from "react";

// Copy-to-clipboard text button. PRD: no toast, no animation — inline text
// feedback that reverts after 1.5s.
export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op, no toast
    }
  }

  return (
    <button type="button" className={`btn btn--link${className ? ` ${className}` : ""}`} onClick={handleCopy}>
      {copied ? "Copied" : label}
    </button>
  );
}
