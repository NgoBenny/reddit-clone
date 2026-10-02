import type { MetadataRoute } from "next";
import { siteUrl } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Index entry points; crawlers discover public communities and posts through links.
  return [
    "/",
    "/communities",
    "/privacy",
    "/terms",
    "/cookies",
    "/contact",
  ].map((path) => ({ url: new URL(path, siteUrl).href }));
}
