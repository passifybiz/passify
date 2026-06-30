"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DocsSidebar } from "./sidebar";
import { DocsSearch } from "./docs-search";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { GITHUB_URL } from "@/lib/site";

/**
 * Sticky documentation top bar. On mobile it also hosts the slide-down
 * navigation drawer (the sidebar tree), since the rail is hidden < 1024px.
 */
export function DocsNavbar() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, open);

  // Lock body scroll while the mobile drawer is open, and close on Escape.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="docs-topbar">
      <div className="docs-topbar__inner">
        <div className="row" style={{ gap: "var(--space-4)" }}>
          <button
            type="button"
            className="docs-topbar__menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`hamburger${open ? " hamburger--open" : ""}`} />
          </button>
          <Link href="/" className="wordmark" style={{ fontSize: "18px" }}>
            Passify
          </Link>
          <span className="docs-topbar__crumb">Docs</span>
        </div>

        <nav className="docs-topbar__nav" aria-label="Site">
          <DocsSearch />
          <Link href="/docs" className="docs-topbar__link">Docs</Link>
          <Link href="/docs/tokenomics" className="docs-topbar__link">Token</Link>
          <a href={GITHUB_URL} className="docs-topbar__link" target="_blank" rel="noopener noreferrer">GitHub</a>
          <Link href="/login" className="btn btn--primary btn--sm">Sign in</Link>
        </nav>
      </div>

      {open && (
        <div ref={drawerRef} className="docs-drawer" role="dialog" aria-modal="true" aria-label="Documentation navigation">
          <DocsSidebar onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
