import { experience } from "@/lib/data";
import { toneForTech } from "@/lib/tones";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { ExpandableHighlights } from "@/components/portfolio/expandable-highlights";
import { Section } from "@/components/portfolio/section";

export function Experience() {
  return (
    <Section
      id="experience"
      label="Experience"
      meta={`${experience.length} roles · UBS`}
    >
      <ol className="space-y-14">
        {experience.map((job) => (
          <li key={job.title}>
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-[15px] font-medium tracking-tight">{job.title}</h3>
                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  {job.period}
                </span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
                <span className="font-medium text-foreground/80">{job.company}</span>
                <span aria-hidden className="text-border">
                  /
                </span>
                <span>{job.location}</span>
              </p>
            </Reveal>

            <Reveal delay={0.06} className="mt-4">
              <p className="text-[14px] leading-relaxed text-foreground/85">{job.summary}</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-5">
              <ExpandableHighlights items={job.highlights} initial={4} />
            </Reveal>

            <Reveal delay={0.14} className="mt-6 flex flex-wrap gap-1.5">
              {job.stack.map((tech) => (
                <Tag key={tech} tone={toneForTech(tech)}>
                  {tech}
                </Tag>
              ))}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
