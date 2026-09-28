/**
 * Colour coding for tags. Every tone is defined once for light and dark so
 * tags stay legible without hand-tuning each call site.
 */
export type Tone =
  | "sky"
  | "violet"
  | "amber"
  | "emerald"
  | "cyan"
  | "rose"
  | "indigo"
  | "teal";

export const toneClasses: Record<Tone, string> = {
  sky: "bg-sky-50 text-sky-700 ring-sky-200/80 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-200/80 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-200/80 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200/80 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/25",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/80 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25",
  indigo:
    "bg-indigo-50 text-indigo-700 ring-indigo-200/80 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25",
  teal: "bg-teal-50 text-teal-700 ring-teal-200/80 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25",
};

/** Solid dot colours, used for timelines and accent markers. */
export const toneDotClasses: Record<Tone, string> = {
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  cyan: "bg-cyan-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
};

/** Deterministic tone per Medium tag, so the same tag always reads the same. */
export const tagTones: Record<string, Tone> = {
  Express: "amber",
  Authentication: "rose",
  JavaScript: "amber",
  React: "sky",
  Redux: "violet",
  "State management": "violet",
  Java: "amber",
  DP: "indigo",
  Leetcode: "indigo",
  Recursion: "indigo",
  "Linked lists": "indigo",
  Python: "teal",
  "scikit-learn": "cyan",
  ML: "emerald",
  "Machine learning": "emerald",
  NLP: "emerald",
  sklearn: "cyan",
};

export function toneForTag(tag: string): Tone {
  return tagTones[tag] ?? "indigo";
}

/**
 * Technology → tone. Ordered, because "JavaScript" must resolve to the language
 * colour before "Java" can claim it. This keeps the colour language consistent
 * across experience rows, project stacks and the skills grid.
 */
const TECH_RULES: [RegExp, Tone][] = [
  [/typescript|javascript|python|\bsql\b|jupyter/, "sky"],
  [/react|next\.js|nextjs|tailwind|shadcn|\bhtml\b|\bcss\b|axios|redux|oauth/, "violet"],
  [/spring|\bjava\b|node|microservice|rest api|express/, "amber"],
  [/postgres|mongo|supabase|pgadmin|\betl\b/, "rose"],
  [/azure|docker|kubernetes|ansible|vercel|\baks\b/, "cyan"],
  [/langchain|\bllm\b|\bmcp\b|copilot|\bnim\b|codex|agentic/, "emerald"],
  [/streamlit|pandas|scikit|sklearn/, "teal"],
  [/vitest|\bgit\b|gitlab|postman|linux/, "indigo"],
];

export function toneForTech(tech: string): Tone {
  const value = tech.toLowerCase();
  for (const [pattern, tone] of TECH_RULES) {
    if (pattern.test(value)) return tone;
  }
  return "indigo";
}
