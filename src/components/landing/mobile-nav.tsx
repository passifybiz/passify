"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthButton } from "./auth-buttons";

export function MobileNav() {
  const [open, setOpen] = useState(false);

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
    <>
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className={`hamburger${open ? " hamburger--open" : ""}`} />
      </button>
      {open && (
        <nav className="mobile-nav" onClick={() => setOpen(false)}>
          <a href="#how-it-works" className="mobile-nav__link">How it works</a>
          <a href="#use-cases" className="mobile-nav__link">Use cases</a>
          <a href="#pricing" className="mobile-nav__link">Pricing</a>
          <Link href="/docs/tokenomics" className="mobile-nav__link">Token</Link>
          <Link href="/docs" className="mobile-nav__link">Docs</Link>
          <AuthButton className="btn btn--primary btn--block" />
        </nav>
      )}
    </>
  );
}
