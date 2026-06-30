import type { ReactNode } from "react";

type CalloutTone = "note" | "tip" | "warning" | "security";

const labels: Record<CalloutTone, string> = {
  note: "Note",
  tip: "Best practice",
  warning: "Warning",
  security: "Security",
};

/**
 * Inline aside for notes, best practices, warnings, and security tips.
 * Flat fill, left brand/semantic rule — no icons, no gradient. Matches the
 * PRD's restraint: meaning carried by color and a label, not decoration.
 */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`callout-box callout-box--${tone}`} role="note">
      <p className="callout-box__label">{title ?? labels[tone]}</p>
      <div className="callout-box__body">{children}</div>
    </aside>
  );
}
