"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/lib/docs/nav";

/**
 * Left navigation rail. Active item derived from the current path. Driven
 * entirely by `docsNav`, so adding a page wires it here automatically.
 */
export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="docs-sidebar" aria-label="Documentation">
      {docsNav.map((section) => (
        <div key={section.title} className="docs-sidebar__group">
          <p className="docs-sidebar__heading">{section.title}</p>
          <ul className="docs-sidebar__list">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`docs-sidebar__link${active ? " docs-sidebar__link--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
