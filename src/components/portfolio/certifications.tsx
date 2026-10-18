import { ArrowUpRight } from "lucide-react";
import { certifications } from "@/lib/data";
import { toneDotClasses } from "@/lib/tones";
import { cn, formatMonth } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { Section } from "@/components/portfolio/section";

/** The current ISO year-month, so expiry badges stay truthful without an edit. */
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function Certifications() {
  const thisMonth = currentMonth();

  return (
    <Section
      id="certifications"
      label="Certifications"
      meta={`${certifications.length} credentials`}
    >
      <ol className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {certifications.map((cert, index) => {
          const isExpired = cert.expires !== undefined && cert.expires < thisMonth;

          return (
            <li key={cert.name}>
              <Reveal delay={Math.min(index * 0.05, 0.25)} className="flex gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    "mt-[0.45rem] size-1.5 shrink-0 rounded-full",
                    toneDotClasses[cert.tone],
                  )}
                />
                <div className="min-w-0">
                  <h3 className="text-[14px] leading-snug font-medium tracking-tight">
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Verify credential"
                        className="group inline-flex items-start gap-1 transition-colors hover:text-brand"
                      >
                        <span>{cert.name}</span>
                        <ArrowUpRight
                          aria-hidden
                          className="mt-[0.2rem] size-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-brand"
                        />
                      </a>
                    ) : (
                      cert.name
                    )}
                  </h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    {cert.issuer}
                    <span aria-hidden className="mx-1.5 text-border">
                      /
                    </span>
                    Issued {formatMonth(cert.issued)}
                  </p>
                  {isExpired ? (
                    <Tag tone="rose" className="mt-1.5 text-[10.5px]">
                      Expired {formatMonth(cert.expires!)}
                    </Tag>
                  ) : null}
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
