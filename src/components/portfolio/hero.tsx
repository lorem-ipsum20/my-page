import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { profile, socials } from "@/lib/data";
import { socialIconMap } from "@/components/icons";
import { MascotCompanion } from "@/components/mascot/companion";
import { Reveal } from "@/components/reveal";
import { Typewriter } from "@/components/typewriter";
import { Button } from "@/components/ui/button";

const ROLES = [
  "Full stack developer",
  "Frontend developer",
  "Backend developer",
  "Software engineer",
] as const;

export function Hero() {
  return (
    <section id="top" className="relative pt-10 pb-14 sm:pt-20 sm:pb-20">
      {/*
        The companion is inline beside the name on narrow screens; from xl up it
        moves to the margin and travels the page, so it is deliberately outside
        the Reveal below — Motion puts a transform on that element, which would
        become the containing block for a fixed child.
      */}
      <div className="flex items-center gap-4">
        <MascotCompanion fallbackSrc={profile.avatar} fallbackAlt={profile.name} />

        <Reveal immediate className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium">{profile.name}</span>
          <span className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
            {profile.role}
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {profile.location}
            </span>
          </span>
        </Reveal>
      </div>

      <Reveal immediate delay={0.09}>
        <h1 className="mt-8 text-[2rem] leading-[1.12] font-medium tracking-tight text-balance sm:text-[2.6rem]">
          I build scalable, secure web applications.
        </h1>
      </Reveal>

      {/* Fixed height so the cycling role never shifts the copy below it. */}
      <Reveal immediate delay={0.17}>
        <p className="mt-3 h-[1.5rem] text-[1.15rem] leading-[1.3] font-medium tracking-tight text-muted-foreground sm:h-[1.95rem] sm:text-[1.5rem]">
          <Typewriter words={ROLES} />
        </p>
      </Reveal>

      <Reveal immediate delay={0.24}>
        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {profile.summary}
        </p>
      </Reveal>

      <Reveal immediate delay={0.31}>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
            render={<a href={profile.resumeUrl} target="_blank" rel="noreferrer" />}
          >
            <Download className="size-3.5" />
            Résumé
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
            render={<a href={`mailto:${profile.email}`} />}
          >
            Get in touch
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      </Reveal>

      <Reveal immediate delay={0.38}>
        <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          {socials.map((social) => {
            const Icon = socialIconMap[social.icon];
            const isMail = social.icon === "mail";
            return (
              <li key={social.href}>
                <a
                  href={social.href}
                  target={isMail ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-200 hover:text-brand"
                >
                  <Icon className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  <span className="relative">
                    {social.label}
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
