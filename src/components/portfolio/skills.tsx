import { certifications, skillGroups } from "@/lib/data";
import { toneDotClasses } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { Section } from "@/components/portfolio/section";

export function Skills() {
  return (
    <Section id="skills" label="Skills" meta={`${skillGroups.length} layers`}>
      <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        {skillGroups.map((group, index) => (
          <Reveal key={group.title} delay={Math.min(index * 0.05, 0.24)}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn("size-1.5 rounded-full", toneDotClasses[group.tone])}
              />
              <h3 className="text-[13px] font-medium">{group.title}</h3>
            </div>
            <p className="mt-1 text-[11.5px] text-muted-foreground/70">{group.blurb}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <Tag key={skill} tone={group.tone}>
                  {skill}
                </Tag>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6">
        <span className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Certified
        </span>
        <div className="flex flex-wrap gap-1.5">
          {certifications.map((certification) => (
            <Tag key={certification} tone="teal">
              {certification}
            </Tag>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
