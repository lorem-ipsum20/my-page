import Image from "next/image";
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

      {/* A quiet portrait among the interests: small, grayscale until hovered,
          so it reads as part of the page's texture rather than a feature. */}
      <Reveal delay={0.1} className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Into
        </span>
        {interests.map((interest) => (
          <Tag key={interest.label} tone={interest.tone}>
            {interest.label}
          </Tag>
        ))}
        <Image
          src="/aman-portrait.jpeg"
          alt={profile.name}
          width={56}
          height={56}
          sizes="56px"
          className="ml-1 size-14 rounded-full object-cover saturate-[0.85] opacity-90 ring-1 ring-border transition-all duration-300 hover:opacity-100 hover:saturate-100"
          priority={false}
        />
      </Reveal>
    </Section>
  );
}
