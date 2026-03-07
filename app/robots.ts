import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/library", "/studio", "/submit", "/login", "/auth"],
    },
    sitemap: "https://supaviewer.com/sitemap.xml",
    host: "https://supaviewer.com",
  };
}
