"use client";

import dynamic from "next/dynamic";
import type { MascotExpression } from "./character";

export type { MascotExpression } from "./character";

/**
 * `ssr: false` is what actually keeps `three` out of the initial HTML — a plain
 * dynamic import() still gets hoisted into the page as a <script async> tag, so
 * the ~530KB chunk would download on every visit.
 *
 * The parent reserves the box size, so rendering nothing while the chunk loads
 * costs no layout shift.
 */
const MascotCanvas = dynamic(
  () => import("./mascot-canvas").then((module) => module.MascotCanvas),
  { ssr: false, loading: () => null },
);

export function Mascot(props: {
  className?: string;
  fallbackSrc?: string;
  fallbackAlt?: string;
  /** The chat lifecycle drives Nova's face and gestures. */
  expression?: MascotExpression;
}) {
  return <MascotCanvas {...props} />;
}
