import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://passify.biz", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://passify.biz/docs", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://passify.biz/security", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://passify.biz/enterprise", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://passify.biz/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://passify.biz/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://passify.biz/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
