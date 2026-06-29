import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── Button ───────────────────────────────────────────────────
// PRD: hover opacity 0.85, active 0.7, no scale, no shadow.
type ButtonVariant = "primary" | "outline" | "ghost" | "ghost-danger" | "link";
type ButtonSize = "md" | "sm";

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn btn--primary",
  outline: "btn btn--outline",
  ghost: "btn btn--ghost",
  "ghost-danger": "btn btn--ghost-danger",
  link: "btn btn--link",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeClass = size === "sm" ? " btn--sm" : "";
  const blockClass = block ? " btn--block" : "";
  return (
    <button className={`${variantClass[variant]}${sizeClass}${blockClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({
  pad = false,
  className = "",
  children,
}: {
  pad?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`card${pad ? " card--pad" : ""} ${className}`.trim()}>{children}</div>;
}

// ── Input / Select / Field ───────────────────────────────────
export function Input({
  label,
  error,
  mono = false,
  className = "",
  id,
  ...rest
}: {
  label?: string;
  error?: string;
  mono?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? rest.name;
  return (
    <div className="form-row">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={`input${mono ? " input--mono" : ""}${error ? " input--error" : ""} ${className}`.trim()}
        {...rest}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export function Select({
  label,
  className = "",
  id,
  children,
  ...rest
}: {
  label?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const selectId = id ?? rest.name;
  return (
    <div className="form-row">
      {label && <label htmlFor={selectId}>{label}</label>}
      <select id={selectId} className={`select ${className}`.trim()} {...rest}>
        {children}
      </select>
    </div>
  );
}

// ── Status text (no pill, no dot) ────────────────────────────
type StatusTone = "success" | "warning" | "error" | "muted";
export function Status({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}

// ── Badge-ish inline tag for tier / plan ─────────────────────
export function InlineTag({ children }: { children: ReactNode }) {
  return <span className="text-sm text-muted">{children}</span>;
}

// ── Heading components ───────────────────────────────────────
export function H1({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`h1 ${className}`.trim()}>{children}</h1>;
}
export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`h2 ${className}`.trim()}>{children}</h2>;
}
export function H3({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`h3 ${className}`.trim()}>{children}</h3>;
}
export function H4({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h4 className={`h4 ${className}`.trim()}>{children}</h4>;
}
export function H5({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h5 className={`h5 ${className}`.trim()}>{children}</h5>;
}

export function MutedText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-muted ${className}`.trim()}>{children}</p>;
}

export function NavLink({ href, children, active = false }: { href: string; children: ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className="btn btn--link"
      style={active ? { fontWeight: 600 } : undefined}
    >
      {children}
    </Link>
  );
}
