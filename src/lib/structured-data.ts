import {
  NAME_ALTERNATES,
  PERSON_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
} from "@/lib/site";
import { certifications, profile, projects, socials } from "@/lib/data";

/**
 * The machine-readable identity of the site, as a single linked graph.
 *
 * Splitting the description of one person across separate, unconnected
 * `<script>` blocks makes each block an isolated guess; cross-referencing them
 * by `@id` makes them one entity a search engine can reconcile with the
 * LinkedIn and GitHub profiles it already knows. `sameAs` is what actually
 * performs that reconciliation, so the social URLs must stay exact.
 */

const organization = (name: string) => ({ "@type": "Organization", name });

/** The person. Site-wide — every route is about the same human. */
export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    alternateName: NAME_ALTERNATES,
    givenName: profile.firstName,
    familyName: profile.lastName,
    url: SITE_URL,
    image: profile.avatar,
    jobTitle: profile.role,
    description: profile.summary,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    worksFor: organization("UBS"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Vellore Institute of Technology" },
    knowsAbout: [
      "React",
      "Next.js",
      "Spring Boot",
      "Java",
      "TypeScript",
      "Microsoft Azure",
      "LLM integration",
      "Agentic application development",
    ],
    knowsLanguage: ["en", "te", "hi"],
    // Only the real profiles: `mailto:` is not something to reconcile.
    sameAs: socials
      .filter((social) => social.icon !== "mail" && social.href.startsWith("http"))
      .map((social) => social.href),
    // Credentials as first-class entities: search engines can show them with
    // the issuer and verification URL instead of reading them as page text.
    hasCredential: certifications.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert.name,
      credentialCategory: "certificate",
      identifier: cert.credentialId,
      url: cert.url,
      recognizedBy: organization(cert.issuer),
      validFrom: cert.issued,
      validUntil: cert.expires,
    })),
    // The portfolio's projects, so they surface as this person's creations
    // rather than as unlinked text on the page.
    hasPart: projects.map((project) => ({
      "@type": "SoftwareApplication",
      name: project.name,
      applicationCategory: "WebApplication",
      description: project.description,
      url: project.demoUrl ?? project.repoUrl ?? undefined,
    })),
  };
}

/** The site itself, owned by the person above. */
export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: NAME_ALTERNATES,
    description: `${profile.name} — ${profile.role}. Portfolio, projects, writing and résumé.`,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

/**
 * The home route specifically: schema.org's own type for "a page that is
 * about a person", which is what tells a search engine this URL is the
 * canonical profile rather than a blog post that mentions someone.
 */
export function profilePageNode() {
  return {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    url: SITE_URL,
    name: `${profile.name} — ${profile.role}`,
    description: profile.summary,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
  };
}

/**
 * Serialize a JSON-LD node for embedding.
 *
 * `<` is escaped because `JSON.stringify` leaves it intact, and a `</script>`
 * anywhere in the data would close the tag early. The data here is static and
 * authored, so this is hardening rather than a live vulnerability — but the
 * serializer is the wrong place to depend on that.
 */
export function jsonLd(nodes: unknown | unknown[]) {
  const graph = Array.isArray(nodes) ? nodes : [nodes];
  const payload = { "@context": "https://schema.org", "@graph": graph };
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
