import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/design-system/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Passify — Identity verification and compliance for Solana RWA",
  description: "API-first identity verification and compliance rule management for Solana RWA platforms.",
  metadataBase: new URL("https://passify.biz"),
  openGraph: {
    title: "Passify — Identity verification and compliance for Solana RWA",
    description: "API-first identity verification and compliance rule management for Solana RWA platforms.",
    url: "https://passify.biz",
    siteName: "Passify",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passify — Identity verification and compliance for Solana RWA",
    description: "API-first identity verification and compliance rule management for Solana RWA platforms.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://passify.biz",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
