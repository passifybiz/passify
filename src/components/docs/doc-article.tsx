import Link from "next/link";
import type { ReactNode } from "react";
import { getPager, getSectionTitle } from "@/lib/docs/nav";
import { DocToc, type TocEntry } from "./doc-toc";

/**
 * Standard wrapper for every documentation page. Renders breadcrumbs, the
 * page title + lead, the prose body, a previous/next pager, and the right-rail
 * table of contents. Breadcrumbs and pager are derived from `slug` via the
 * central nav tree, so pages never restate their position.
 */
export function DocArticle({
  slug,
  title,
  lead,
  toc = [],
  children,
}: {
  slug: string;
  title: string;
  lead?: string;
  toc?: TocEntry[];
  children: ReactNode;
}) {
  const section = getSectionTitle(slug);
  const { prev, next } = getPager(slug);

  return (
    <div className="doc-layout">
      <article className="doc-article">
        <nav className="doc-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/docs">Docs</Link>
          {section && (
            <>
              <span aria-hidden="true">/</span>
              <span>{section}</span>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="doc-breadcrumbs__current">{title}</span>
        </nav>

        <header className="doc-article__head">
          <h1 className="doc-article__title">{title}</h1>
          {lead && <p className="doc-article__lead">{lead}</p>}
        </header>

        <div className="docs-prose">{children}</div>

        <nav className="doc-pager" aria-label="Pagination">
          {prev ? (
            <Link href={prev.href} className="doc-pager__link doc-pager__link--prev">
              <span className="doc-pager__dir">Previous</span>
              <span className="doc-pager__title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className="doc-pager__link doc-pager__link--next">
              <span className="doc-pager__dir">Next</span>
              <span className="doc-pager__title">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="doc-toc-rail">
        <DocToc entries={toc} />
      </aside>
    </div>
  );
}
