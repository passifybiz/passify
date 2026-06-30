import type { MetadataRoute } from "next";
import { docsFlat } from "@/lib/docs/nav";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const marketing: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/enterprise`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Every documentation route, derived from the single nav source of truth.
  const docs: MetadataRoute.Sitemap = docsFlat.map((item) => {
    const isTop = item.href === "/docs";
    const isToken = item.href.startsWith("/docs/tokenomics");
    return {
      url: `${SITE_URL}${item.href}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: isTop ? 0.9 : isToken ? 0.7 : 0.6,
    };
  });

  return [...marketing, ...docs];
}
