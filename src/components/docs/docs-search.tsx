"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { docsFlat, getSectionTitle } from "@/lib/docs/nav";
import { useFocusTrap } from "@/lib/use-focus-trap";

/**
 * Documentation search — a lightweight command palette over the docs nav tree.
 * Opens with the button, Cmd/Ctrl+K, or "/". Filters page titles and summaries,
 * supports arrow-key navigation, Enter to open, and Escape to close. No index
 * or dependency: the nav tree is the source of truth, so results never drift
 * from what exists.
 */
export function DocsSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(dialogRef, open);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docsFlat;
    return docsFlat.filter((item) => {
      const section = getSectionTitle(item.href) ?? "";
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary ?? "").toLowerCase().includes(q) ||
        section.toLowerCase().includes(q)
      );
    });
  }, [query]);

  // Global open shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping())) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Reset + lock scroll when opening.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[active];
      if (target) go(target.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        className="docs-search__trigger"
        onClick={() => setOpen(true)}
      >
        <span className="docs-search__trigger-label">Search docs</span>
        <kbd className="docs-search__kbd">⌘K</kbd>
      </button>

      {open && (
        <div
          className="docs-search__overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="docs-search__dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            onKeyDown={onListKeyDown}
          >
            <input
              ref={inputRef}
              type="text"
              className="docs-search__input"
              placeholder="Search documentation…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search query"
              aria-controls="docs-search-results"
              autoComplete="off"
            />
            <ul id="docs-search-results" className="docs-search__results" role="listbox" aria-label="Results">
              {results.length === 0 && (
                <li className="docs-search__empty">No pages match “{query}”.</li>
              )}
              {results.map((item, i) => {
                const section = getSectionTitle(item.href);
                return (
                  <li key={item.href} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      className={`docs-search__result${i === active ? " docs-search__result--active" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item.href)}
                    >
                      <span className="docs-search__result-title">{item.title}</span>
                      {section && <span className="docs-search__result-section">{section}</span>}
                      {item.summary && <span className="docs-search__result-summary">{item.summary}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="docs-search__footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function isTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
}
