import type { MetadataRoute } from "next";
import { siteUrl } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/settings",
        "/saved",
        "/notifications",
        "/r/create",
        "/r/*/create",
        "/r/*/moderation",
        "/post/*/edit",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
