import { Fragment } from "react";

/**
 * Renders plain prose with a few key phrases made bold.
 *
 * The copy lives in `data.ts` as strings — the JSON-LD graph, Nova's knowledge
 * base and the résumé sheet all read it — so emphasis belongs at the render
 * site, not in the data. Matching is case-insensitive and phrase-exact;
 * longer phrases are tried first, so "JavaScript" is never half-bolded as
 * "Java".
 */
export function Emphasize({
  text,
  phrases,
  emphasisClassName = "font-medium text-foreground",
}: {
  text: string;
  phrases: readonly string[];
  /** Applied to every bolded phrase; defaults to a darker tone inside muted prose. */
  emphasisClassName?: string;
}) {
  if (phrases.length === 0) return <>{text}</>;

  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        sorted.some((phrase) => phrase.toLowerCase() === part.toLowerCase()) ? (
          <strong key={index} className={emphasisClassName}>
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Regex-escape a literal phrase so punctuation like (RBAC) matches as typed. */
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
