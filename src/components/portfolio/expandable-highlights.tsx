"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Highlight({ point }: { point: string }) {
  return (
    <li className="group flex gap-3 text-[14px] leading-relaxed">
      <span
        aria-hidden
        className="mt-[0.6rem] size-1 shrink-0 rounded-full bg-brand/50 transition-all duration-300 group-hover:scale-150 group-hover:bg-brand"
      />
      <span className="text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
        {point}
      </span>
    </li>
  );
}

/**
 * Shows the first few resume bullets and animates the rest open. Uses the
 * grid-template-rows 0fr→1fr technique so the height transition is smooth
 * without measuring anything.
 */
export function ExpandableHighlights({
  items,
  initial = 4,
}: {
  items: string[];
  initial?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = items.slice(0, initial);
  const rest = items.slice(initial);

  return (
    <div>
      <ul className="space-y-2.5">
        {preview.map((point) => (
          <Highlight key={point} point={point} />
        ))}
      </ul>

      {rest.length > 0 ? (
        <>
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
              expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <ul className="space-y-2.5 overflow-hidden pt-2.5">
              {rest.map((point) => (
                <Highlight key={point} point={point} />
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="group mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:text-brand"
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-300 ease-out",
                expanded && "-rotate-180",
              )}
            />
            {expanded ? "Show less" : `Show ${rest.length} more`}
          </button>
        </>
      ) : null}
    </div>
  );
}
