import type { Metadata } from "next";
import { DocsNavbar } from "@/components/docs/docs-navbar";
import { DocsSidebar } from "@/components/docs/sidebar";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  title: {
    default: "Documentation — Passify",
    template: "%s — Passify Docs",
  },
  description:
    "Developer documentation for Passify: API-first identity verification and compliance for Solana real-world-asset platforms.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <DocsNavbar />
      <div className="docs-shell">
        <aside className="docs-sidebar-rail">
          <DocsSidebar />
        </aside>
        <main id="main-content" className="docs-main">
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
