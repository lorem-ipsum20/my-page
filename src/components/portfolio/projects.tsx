import { ArrowUpRight, Play } from "lucide-react";
import { projects } from "@/lib/data";
import { toneDotClasses, toneForTech } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { GitHubIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { Section } from "@/components/portfolio/section";

export function Projects() {
  return (
    <Section id="projects" label="Projects" meta={`${projects.length} selected`}>
      <ol className="space-y-11">
        {projects.map((project) => (
          <li key={project.name}>
            <Reveal className="relative pl-5">
              <span
                aria-hidden
                className={cn(
                  "absolute top-2 left-0 size-1.5 rounded-full",
                  toneDotClasses[project.accent],
                )}
              />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-[15px] font-medium tracking-tight">{project.name}</h3>
                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  {project.kind}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground/70">
                  {project.year}
                </span>
              </div>

              <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
                {project.description}
              </p>

              <ul className="mt-3.5 space-y-2">
                {project.highlights.map((point) => (
                  <li key={point} className="flex gap-3 text-[13.5px] leading-relaxed">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-border" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Tag key={tech} tone={toneForTech(tech)}>
                    {tech}
                  </Tag>
                ))}
              </div>

              {project.demoUrl || project.repoUrl ? (
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 text-[13px] transition-colors hover:text-brand"
                    >
                      <Play className="size-3.5" />
                      <span className="relative">
                        Live demo
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
                        />
                      </span>
                    </a>
                  ) : null}
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 text-[13px] transition-colors hover:text-brand"
                    >
                      <GitHubIcon className="size-3.5" />
                      <span className="relative">
                        Source
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
                        />
                      </span>
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 font-mono text-[11.5px] text-muted-foreground/70">
                  Private repository — happy to walk through it.
                </p>
              )}
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="mt-10">
        <a
          href="https://github.com/aman-singanamala?tab=repositories"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-brand"
        >
          <GitHubIcon className="size-3.5" />
          All repositories on GitHub
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </Section>
  );
}
