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

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

export const metadata: Metadata = {
  title: "Passify — Identity verification and compliance for Solana RWA",
  description: "API-first identity verification and compliance rule management for Solana RWA platforms.",
  metadataBase: new URL("https://passify.biz"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    title: "Passify — Identity verification and compliance for Solana RWA",
    description: "API-first identity verification and compliance rule management for Solana RWA platforms.",
    url: "https://passify.biz",
    siteName: "Passify",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Passify Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Passify — Identity verification and compliance for Solana RWA",
    description: "API-first identity verification and compliance rule management for Solana RWA platforms.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "try{Object.defineProperty(window,'ethereum',{configurable:!0,get(){return void 0},set(v){Object.defineProperty(window,'ethereum',{configurable:!0,writable:!0,value:v})}})}catch(e){}" }} />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
