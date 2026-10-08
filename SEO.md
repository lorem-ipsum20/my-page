# Getting the portfolio to rank for "Aman Singanamala"

Written 2026-10-08, after diagnosing why the site does not appear in search
results for its own name.

## The diagnosis

The site is **not indexed at all**. A `site:amansinganamala.vercel.app` query
returns zero results. The plain name query returns LinkedIn, GitHub, Kaggle, a
Streamlit app and a YouTube video — every one of them a page that has existed for
years, links outward, and is linked *to* from somewhere else.

That is the whole story: technical SEO on the site was already sound (robots,
sitemap, canonical, Open Graph, `Person` JSON-LD all present and correct). Two
things were missing, one in code and one not:

1. **Nothing was wrong with the markup that a crawler could not read** — the page
   renders fully server-side, the name appears ~30 times in the HTML, and there
   is no `noindex` anywhere. The blocker was that **Google had no reason to know
   the URL existed**. A new `vercel.app` subdomain with no inbound links is
   discovered only by sitemap submission or a backlink, and neither had happened.
2. **The on-page signals pointed away from the name.** The `<h1>` was
   "I build scalable, secure web applications." and the meta description never
   contained the name, so even once indexed the page did not present itself as
   *the* page about this person.

## Fixed in code

- The name is now the `<h1>` on the home route, in the meta description, and in
  the site-wide `WebSite`/`Person`/`ProfilePage` JSON-LD graph (cross-linked by
  `@id`, with the social profiles as `sameAs`).
- `/resume` declared `canonical = /` — i.e. it told Google it was a duplicate of
  the homepage — because it inherited the root layout's `alternates`. It now owns
  its own canonical and Open Graph tags.
- `robots.txt` declares `Host`; the sitemap uses a stable content date rather
  than the build date, so `lastmod` is a signal instead of noise.
- The Google Search Console verification token is committed in
  `src/lib/site.ts` and emitted on every route, so verification works from a
  plain deploy with no dashboard access. It is not a secret — it is published
  in the page's `<head>` by design. `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
  overrides it (verified), as does `NEXT_PUBLIC_BING_SITE_VERIFICATION` for
  Bing's `msvalidate.01` tag.

## The critical path — only you can do this

Nothing above makes Google crawl the site. These steps do, in order:

### 1. Search Console (do this first — it is the difference between indexed and invisible)

1. Merge the SEO changes and let Vercel deploy. The verification tag is already
   part of the build, so nothing else is needed to make the property provable.
2. Go to <https://search.google.com/search-console> → **Add property** →
   **URL prefix** → `https://amansinganamala.vercel.app`.
3. Choose the **HTML tag** method. The token is already live on the site, so
   click **Verify** — do not edit anything.
4. **Sitemaps** → submit `sitemap.xml`.
5. **URL Inspection** → enter the homepage → **Request Indexing**. Repeat for
   `/resume`.

The verification token expires only if the tag is ever removed from the page —
if that happens, Search Console flags the property and it must be re-verified.

Import the same property into <https://www.bing.com/webmasters> — it can pull
from Search Console in one click, and Bing feeds several AI assistants.

### 2. Backlinks (this is what actually wins the ranking)

For a name query the ranking is decided by which URLs the search engine already
trusts for that string. Every profile below already ranks on page one. Put the
site URL on all of them; each one is a link from an authoritative page to this
one:

- [ ] **GitHub** → profile → *Edit profile* → **Website** field, plus a line in
      your profile README. (Currently the README links to Kaggle/LinkedIn/Medium
      but not to this site.)
- [ ] **LinkedIn** → *Contact info* → **Website** (label it "Portfolio").
- [ ] **Medium** → profile → *Edit profile* → bio link.
- [ ] **X** → profile → bio website field.
- [ ] **Kaggle** → profile → website.
- [ ] **LeetCode** → profile → website.

Use the exact same URL (`https://amansinganamala.vercel.app`, no trailing slash)
everywhere so every link consolidates to one identity.

### 3. Verify it worked

- `site:amansinganamala.vercel.app` — should return 1–2 results once indexed.
- `"Aman Singanamala"` — the target. Expect it to appear within days to a few
  weeks of indexing; a new page with a handful of links typically settles on page
  one for an uncommon name query, but be patient with a page Google has never
  crawled.

`site:` returning zero is the signal to check Search Console's Pages report —
it will say *Discovered – currently not indexed* (needs links) or *URL is unknown*
(needs submission).

## If you buy a custom domain

A `*.vercel.app` subdomain is shared infrastructure and carries no authority of
its own; `amansinganamala.com` would be a stronger long-term home and makes the
backlinks more valuable.

1. Add the domain in Vercel → Settings → Domains, and set the apex to redirect to
   `https://www.` (or vice versa — pick one and stay consistent).
2. Change `SITE_URL` in `src/lib/site.ts`. Everything else — canonical, Open
   Graph, sitemap, robots, JSON-LD — is built from that one constant.
3. Add the new domain as a property in Search Console and set
   **Settings → Change of address** from the `vercel.app` property. Keep the old
   URL redirecting permanently; that passes the accumulated signals across.
