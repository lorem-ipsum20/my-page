import { profile } from "@/lib/data";
import { BackToTop } from "@/components/back-to-top";
import { MobileNav } from "@/components/mobile-nav";
import { About } from "@/components/portfolio/about";
import { Contact } from "@/components/portfolio/contact";
import { Education } from "@/components/portfolio/education";
import { Experience } from "@/components/portfolio/experience";
import { Hero } from "@/components/portfolio/hero";
import { Projects } from "@/components/portfolio/projects";
import { Skills } from "@/components/portfolio/skills";
import { Writing } from "@/components/portfolio/writing";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Writing />
        <Skills />
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
