"use client";

import { useEffect, useReducer, useRef } from "react";

export interface BootLine {
  text: string;
  type: "muted" | "success" | "accent";
}

interface Props {
  heading?: string;
  lines?: BootLine[];
  charSpeed?: number;
  linePause?: number;
}

const DEFAULT_LINES: BootLine[] = [
  { text: "Passify init — verifying platform integrity...", type: "muted" },
  { text: "✓ identity schema loaded (kyc_individual_v1)", type: "success" },
  { text: "Connecting to Solana mainnet-beta...", type: "muted" },
  { text: "✓ RPC connected — slot 284,091,337", type: "success" },
  { text: "Loading compliance rules...", type: "muted" },
  { text: "✓ 3 active rules synced", type: "success" },
  { text: "Attestation program ready — accepting requests", type: "accent" },
];

interface State {
  lineIndex: number;
  charIndex: number;
  done: boolean;
}

type Action = { type: "char" } | { type: "next-line" } | { type: "done" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "char":
      return { ...state, charIndex: state.charIndex + 1 };
    case "next-line":
      return { ...state, lineIndex: state.lineIndex + 1, charIndex: 0 };
    case "done":
      return { ...state, done: true };
  }
}

export function TerminalBoot({
  heading = "Passify v1.0.0",
  lines = DEFAULT_LINES,
  charSpeed = 28,
  linePause = 350,
}: Props) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [state, dispatch] = useReducer(reducer, { lineIndex: 0, charIndex: 0, done: prefersReduced });
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (state.done) return;
    const currentLine = lines[state.lineIndex];
    if (!currentLine) {
      dispatch({ type: "done" });
      return;
    }
    if (state.charIndex < currentLine.text.length) {
      timer.current = setTimeout(() => dispatch({ type: "char" }), charSpeed);
    } else if (state.lineIndex < lines.length - 1) {
      timer.current = setTimeout(() => dispatch({ type: "next-line" }), linePause);
    } else {
      dispatch({ type: "done" });
    }
    return () => clearTimeout(timer.current);
  }, [state, lines, charSpeed, linePause]);

  return (
    <div className="terminal-boot" role="log" aria-live="polite" aria-label="Platform initialization sequence">
      <div className="terminal-boot__bar">
        <span className="terminal-boot__dot" />
        <span className="terminal-boot__dot" />
        <span className="terminal-boot__dot" />
        <span className="terminal-boot__title">{heading}</span>
      </div>
      <div className="terminal-boot__body">
        {(state.done ? lines : lines.slice(0, state.lineIndex + 1)).map((line, i) => (
          <div key={i} className={`terminal-boot__line terminal-boot__line--${line.type}`}>
            <span className="terminal-boot__prompt">$</span>
            {state.done
              ? line.text
              : i < state.lineIndex
                ? line.text
                : line.text.slice(0, state.charIndex)}
          </div>
        ))}
        {state.done && <span className="terminal-boot__cursor">▊</span>}
      </div>
    </div>
  );
}
