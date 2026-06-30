import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Solution } from "@/components/landing/solution";
import { ApiFlow } from "@/components/landing/api-flow";
import { ProductPreview } from "@/components/landing/product-preview";
import { CodeExample } from "@/components/landing/code-example";
import { Trust } from "@/components/landing/trust";
import { UseCases } from "@/components/landing/use-cases";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { TokenSection } from "@/components/landing/token";
import { MobileNav } from "@/components/landing/mobile-nav";
import { AuthButton } from "@/components/landing/auth-buttons";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Passify",
    url: "https://passify.biz",
    applicationCategory: "FinanceApplication",
    description: "API-first identity and compliance layer for Solana RWA platforms. One KYC, every tokenized asset.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="header">
        <div className="header__inner">
          <Link href="/" className="wordmark">Passify</Link>
          <nav className="desktop-nav row" aria-label="Main navigation">
            <a href="#how-it-works" className="btn btn--link btn--sm">How it works</a>
            <a href="#use-cases" className="btn btn--link btn--sm">Use cases</a>
            <a href="#pricing" className="btn btn--link btn--sm">Pricing</a>
            <Link href="/docs/tokenomics" className="btn btn--link btn--sm">Token</Link>
            <Link href="/docs" className="btn btn--link btn--sm">Docs</Link>
            <AuthButton />
          </nav>
          <MobileNav />
        </div>
      </header>

      <main id="main-content">
        <Hero />
        <Trust />
        <ProductPreview />
        <Problem />
        <Solution />
        <ApiFlow />
        <CodeExample />
        <UseCases />
        <Pricing />
        <TokenSection />
        <Faq />
        <Cta />
      </main>

      <SiteFooter />
    </div>
  );
}
