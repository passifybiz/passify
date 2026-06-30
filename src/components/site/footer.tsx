import Link from "next/link";
import { GITHUB_URL, X_URL, STATUS_URL, EMAIL } from "@/lib/site";
import { TICKER } from "@/lib/token";
import { NewsletterForm } from "./newsletter-form";

type Col = { title: string; links: { label: string; href: string; external?: boolean }[] };

const COLUMNS: Col[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "Security", href: "/security" },
      { label: "Status", href: STATUS_URL, external: true },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "API reference", href: "/docs/api" },
      { label: "Authentication", href: "/docs/authentication" },
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
  {
    title: "Token",
    links: [
      { label: `${TICKER} overview`, href: "/docs/tokenomics" },
      { label: "Utility", href: "/docs/tokenomics/utility" },
      { label: "Supply & distribution", href: "/docs/tokenomics/supply" },
      { label: "Governance", href: "/docs/tokenomics/governance" },
      { label: "Token FAQ & risk", href: "/docs/tokenomics/faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/docs/faq" },
      { label: "Glossary", href: "/docs/glossary" },
      { label: "Roadmap", href: "/docs/roadmap" },
      { label: "Changelog", href: "/docs/changelog" },
      { label: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact sales", href: `mailto:${EMAIL.sales}`, external: true },
      { label: "Support", href: `mailto:${EMAIL.support}`, external: true },
      { label: "Security reports", href: `mailto:${EMAIL.security}`, external: true },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

function FooterLink({ link }: { link: Col["links"][number] }) {
  if (link.external) {
    return (
      <a href={link.href} className="site-footer__link" target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className="site-footer__link">
      {link.label}
    </Link>
  );
}

/**
 * Site-wide footer. Structured like a top SaaS/Web3 product: link columns,
 * a newsletter placeholder, social row, and a legal/version baseline. Used on
 * the landing page, docs, and standalone pages for one consistent brand edge.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" className="wordmark" style={{ fontSize: "18px" }}>
            Passify
          </Link>
          <p className="site-footer__tagline">Identity proven. Assets unlocked.</p>
          <p className="site-footer__desc">
            API-first identity and compliance infrastructure for Solana real-world-asset platforms.
          </p>
          <NewsletterForm />
        </div>

        <div className="site-footer__cols">
          {COLUMNS.map((col) => (
            <nav key={col.title} className="site-footer__col" aria-label={col.title}>
              <p className="site-footer__col-title">{col.title}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="site-footer__baseline">
        <p className="site-footer__copy">
          &copy; {year} Passify. Solana RWA compliance infrastructure.
        </p>
        <div className="site-footer__meta">
          <span className="site-footer__version">v1.0 · mainnet</span>
          <a href={STATUS_URL} className="site-footer__link" target="_blank" rel="noopener noreferrer">
            All systems operational
          </a>
          <div className="site-footer__social">
            <a href={GITHUB_URL} aria-label="Passify on GitHub" target="_blank" rel="noopener noreferrer" className="site-footer__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
              </svg>
            </a>
            <a href={X_URL} aria-label="Passify on X (placeholder)" target="_blank" rel="noopener noreferrer" className="site-footer__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
