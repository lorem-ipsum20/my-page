"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Prints the résumé document. The browser's print dialog handles the rest —
 * the page's print stylesheet forces a plain black-on-white sheet whatever
 * the site theme is.
 */
export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={() => window.print()}
    >
      <Printer className="size-3.5" />
      Print
    </Button>
  );
}
