import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt for the portfolio. Everything is crawlable; AI crawlers are
 * allowed too, since the site's purpose is to be found. `host` names the
 * canonical origin for engines that honour it, and the sitemap points crawlers
 * straight at the URL list — the site has almost no internal link graph, so
 * discovery depends on it being declared.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
