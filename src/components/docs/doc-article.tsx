import Link from "next/link";
import type { ReactNode } from "react";
import { getPager, getSectionTitle, getDocItem, DOCS_LAST_UPDATED } from "@/lib/docs/nav";
import { SITE_URL } from "@/lib/site";
import { DocToc, type TocEntry } from "./doc-toc";

const UPDATED_LABEL = new Date(DOCS_LAST_UPDATED).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

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
  const item = getDocItem(slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Docs", item: `${SITE_URL}/docs` },
      ...(section ? [{ "@type": "ListItem", position: 2, name: section }] : []),
      { "@type": "ListItem", position: section ? 3 : 2, name: title, item: `${SITE_URL}${slug}` },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: lead ?? item?.summary,
    url: `${SITE_URL}${slug}`,
    dateModified: DOCS_LAST_UPDATED,
    isPartOf: { "@type": "WebSite", name: "Passify Documentation", url: `${SITE_URL}/docs` },
    publisher: { "@type": "Organization", name: "Passify", url: SITE_URL },
  };

  return (
    <div className="doc-layout">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
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

        <p className="doc-article__updated">
          Last updated <time dateTime={DOCS_LAST_UPDATED}>{UPDATED_LABEL}</time>
        </p>

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
