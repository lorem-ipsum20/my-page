"use client";

import dynamic from "next/dynamic";

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
  /** Shows the "composing an answer" antenna pulse while the chat is streaming. */
  thinking?: boolean;
}) {
  return <MascotCanvas {...props} />;
}
