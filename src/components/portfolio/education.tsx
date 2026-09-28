import { awards, education } from "@/lib/data";
import { toneDotClasses } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/portfolio/section";

export function Education() {
  return (
    <Section id="education" label="Education" meta="2018 — 2024">
      <ol className="space-y-8">
        {education.map((item, index) => (
          <li key={item.school}>
            <Reveal delay={Math.min(index * 0.06, 0.12)}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-[14.5px] font-medium tracking-tight">{item.school}</h3>
                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  {item.period}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                {item.qualification}
                <span aria-hidden className="mx-2 text-border">
                  /
                </span>
                <span className="text-foreground/80">{item.detail}</span>
                <span aria-hidden className="mx-2 text-border">
                  /
                </span>
                {item.location}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-10 border-t border-border pt-6">
        <Reveal>
          <h3 className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Awards &amp; Leadership
          </h3>
        </Reveal>
        <ul className="mt-4 space-y-5">
          {awards.map((award, index) => (
            <li key={award.title}>
              <Reveal delay={Math.min(index * 0.06, 0.15)} className="flex gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "mt-[0.45rem] size-1.5 shrink-0 rounded-full",
                    toneDotClasses[award.tone],
                  )}
                />
                <div>
                  <p className="text-[14px] leading-snug">
                    {award.title}
                    <span className="text-muted-foreground"> — {award.org}</span>
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    {award.detail}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
