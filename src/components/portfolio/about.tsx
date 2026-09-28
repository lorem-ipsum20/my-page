import { interests, profile } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { Section } from "@/components/portfolio/section";

export function About() {
  return (
    <Section id="about" label="About" meta="In detail">
      <div className="space-y-4">
        <Reveal>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {profile.summarySecondary}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="text-[15px] leading-relaxed">{profile.currently}</p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Into
        </span>
        {interests.map((interest) => (
          <Tag key={interest.label} tone={interest.tone}>
            {interest.label}
          </Tag>
        ))}
      </Reveal>
    </Section>
  );
}
