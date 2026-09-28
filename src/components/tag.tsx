import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toneClasses, type Tone } from "@/lib/tones";

/**
 * A colour-coded pill. Built on the shadcn Badge so spacing and type scale
 * stay consistent, with the border replaced by a soft ring in the tone colour.
 */
export function Tag({
  children,
  tone = "indigo",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-0 px-2.5 font-normal ring-1 transition-colors duration-200",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
