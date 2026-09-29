"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around next-themes.
 *
 * On 0.4.x this component's inner bootstrap <script> triggered React 19.2's
 * "scripts inside React components are never executed" dev warning; the 1.0
 * line renders its bootstrap script in a React-19-safe way, so upgrading the
 * dependency was the whole fix. API surface used here is unchanged.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
