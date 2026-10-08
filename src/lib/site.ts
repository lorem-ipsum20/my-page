/**
 * The site's own identity, separate from the portfolio content in data.ts:
 * the deployed URL and the name used for social-card metadata.
 */

/**
 * The canonical origin. Everything — canonical tags, Open Graph URLs, the
 * sitemap and the JSON-LD graph — is built from this one constant, so moving
 * to a custom domain is a single-line change here (and a redirect).
 */
export const SITE_URL = "https://amansinganamala.vercel.app";

export const SITE_NAME = "Aman Singanamala — Portfolio";

/**
 * Stable identifiers so the JSON-LD graph can cross-reference its own nodes
 * instead of repeating them. Search engines read a linked graph as one entity;
 * three disconnected blobs guessing at the same person read as three.
 */
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The date content last actually changed — not the build date. A `lastmod`
 * that moves on every deploy while the copy stays identical teaches crawlers
 * to ignore the field, so this is a hand-set constant that is bumped only when
 * data.ts meaningfully changes.
 */
export const CONTENT_UPDATED = new Date("2026-10-08");

/**
 * Google Search Console's HTML-tag verification token for this property.
 *
 * This is committed on purpose. The token is not a secret — it is published in
 * the page's <head> for anyone to read, and its only function is to prove we
 * control this URL. Keeping it in the repo means a plain `git push` deploys it
 * without anyone needing dashboard access to set an environment variable.
 *
 * `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` overrides it if set, so the property
 * can be re-verified or moved without a code change.
 */
export const GOOGLE_SITE_VERIFICATION = "FNUa1AciQ9Yud4MaBkU0fb1i3TRC3HeqdbEjzROyIdk";

/**
 * Name variants a person might actually type. `alternateName` in the JSON-LD
 * and the keyword list both read from here, so the spelled-out name, the
 * "lastname firstname" ordering and the handle all point at one identity.
 */
export const NAME_ALTERNATES = [
  "Aman Singanamala",
  "Singanamala Aman",
  "aman-singanamala",
  "amansinganamala",
];
