import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/data";
import { toneForTag } from "@/lib/tones";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { Section } from "@/components/portfolio/section";

export function Writing() {
  const years = Array.from(new Set(posts.map((post) => post.year)));

  return (
    <Section
      id="writing"
      label="Writing"
      meta={`${posts.length} articles`}
    >
      <ul className="divide-y divide-border">
        {posts.map((post, index) => (
          <li key={post.url}>
            <Reveal delay={Math.min(index * 0.035, 0.22)}>
              <a
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="group block py-4"
              >
                <div className="flex items-baseline justify-between gap-x-6">
                  <h3 className="min-w-0 flex-1 text-[14.5px] leading-snug font-medium tracking-tight">
                    <span className="relative">
                      {post.title}
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-300 ease-out group-hover:scale-x-100"
                      />
                    </span>
                  </h3>
                  <span className="shrink-0 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                    {post.date}
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                  {post.blurb}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <Tag key={tag} tone={toneForTag(tag)}>
                      {tag}
                    </Tag>
                  ))}
                  <span className="ml-1 text-[11.5px] text-muted-foreground/70">
                    {post.readingTime} read
                  </span>
                </div>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <a
          href="https://medium.com/@embed17"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-brand"
        >
          All articles on Medium
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground/70 uppercase">
          {years.at(-1)} — {years[0]}
        </span>
      </Reveal>
    </Section>
  );
}
