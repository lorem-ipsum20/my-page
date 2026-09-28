import type { ReactNode } from "react";
import { Reveal, RevealRule } from "@/components/reveal";

export function Section({
  id,
  label,
  meta,
  children,
}: {
  id: string;
  label: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <RevealRule className="h-px w-full bg-border" />
      <div className="grid gap-5 py-10 sm:grid-cols-[110px_1fr] sm:gap-10 sm:py-14">
        <Reveal>
          <div className="flex items-baseline gap-3 sm:block">
            <h2 className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {label}
            </h2>
            {meta ? (
              <p className="text-[11px] text-muted-foreground/70 sm:mt-1.5">{meta}</p>
            ) : null}
          </div>
        </Reveal>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
