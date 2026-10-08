import type { MetadataRoute } from "next";
import { CONTENT_UPDATED, SITE_URL } from "@/lib/site";

/**
 * Sitemap for the portfolio: the single page plus the printable résumé sheet,
 * both public and both listed explicitly so crawlers pick up /resume even when
 * no internal link is followed.
 *
 * `lastModified` is the hand-set content date rather than `new Date()` at build
 * time. A lastmod that changes on every deploy while the copy is identical is
 * noise, and crawlers discount the field once they notice the pattern — which
 * costs us the signal on the deploys that do change something.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
