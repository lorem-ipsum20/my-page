import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt for the portfolio. Everything is crawlable; AI crawlers are
 * allowed too, since the site's purpose is to be found. Sitemap points
 * crawlers straight at the canonical URL list.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
