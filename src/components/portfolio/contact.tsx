import { ArrowUpRight, Download, FileText, Phone } from "lucide-react";
import { profile, socials } from "@/lib/data";
import { socialIconMap } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/portfolio/section";

export function Contact() {
  return (
    <Section id="contact" label="Contact" meta="Available">
      <div className="space-y-7">
        <Reveal>
          <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Full-stack engineering, platform teams and applied LLM tooling. Fastest way to reach me is
            email — I usually reply within a day.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-baseline gap-2 text-[1.35rem] tracking-tight sm:text-[1.6rem]"
          >
            <span className="relative">
              {profile.email}
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-400 ease-out group-hover:scale-x-100"
              />
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              nativeButton={false}
              className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              render={<a href={profile.resumeUrl} target="_blank" rel="noreferrer" />}
            >
              <Download className="size-3.5" />
              Download résumé
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              render={<a href="/resume" />}
            >
              <FileText className="size-3.5" />
              Preview résumé
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              render={<a href={`tel:${profile.phone.replace(/\s/g, "")}`} />}
            >
              <Phone className="size-3.5" />
              {profile.phone}
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-7">
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
      </div>
    </Section>
  );
}
