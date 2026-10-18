import { profile } from "@/lib/data";
import { jsonLd, profilePageNode } from "@/lib/structured-data";
import { BackToTop } from "@/components/back-to-top";
import { MobileNav } from "@/components/mobile-nav";
import { About } from "@/components/portfolio/about";
import { Certifications } from "@/components/portfolio/certifications";
import { Contact } from "@/components/portfolio/contact";
import { Education } from "@/components/portfolio/education";
import { Experience } from "@/components/portfolio/experience";
import { Hero } from "@/components/portfolio/hero";
import { Projects } from "@/components/portfolio/projects";
import { Skills } from "@/components/portfolio/skills";
import { Writing } from "@/components/portfolio/writing";
import { SiteHeader } from "@/components/site-header";

/**
 * The home route declares itself a ProfilePage — schema.org's type for "this
 * URL is the canonical page about a person" — and points at the Person node
 * the layout already emits. It lives here rather than in the layout so the
 * résumé route does not also claim to be the profile page.
 */
function ProfilePageJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(profilePageNode()) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <ProfilePageJsonLd />
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Writing />
        <Skills />
        <Certifications />
        <Education />
        <Contact />
      </main>

      <BackToTop />
      <MobileNav />

      <footer className="mt-6 border-t border-border">
        <div className="mx-auto w-full max-w-2xl px-6 py-8 text-[12px] text-muted-foreground">
          © {new Date().getFullYear()} {profile.name}
        </div>
      </footer>
    </>
  );
}
