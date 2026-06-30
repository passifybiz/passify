"use client";

import { useEffect, useState } from "react";

export type TocEntry = { id: string; title: string };

/**
 * Right-rail "On this page" table of contents with scrollspy. Highlights the
 * heading nearest the top of the viewport. Static anchor links degrade
 * gracefully without JS.
 */
export function DocToc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string>(entries[0]?.id ?? "");

  useEffect(() => {
    if (entries.length === 0) return;
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (items) => {
        const visible = items
          .filter((i) => i.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="doc-toc" aria-label="On this page">
      <p className="doc-toc__title">On this page</p>
      <ul className="doc-toc__list">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className={`doc-toc__link${active === e.id ? " doc-toc__link--active" : ""}`}
            >
              {e.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
