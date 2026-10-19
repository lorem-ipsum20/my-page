import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, ExternalLink, Play } from "lucide-react";
import { profile, projects } from "@/lib/data";
import { PERSON_ID, SITE_NAME, SITE_URL, WEBSITE_ID } from "@/lib/site";
import { jsonLd } from "@/lib/structured-data";
import { toneForTech } from "@/lib/tones";
import { RevealRule } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const SLUG = "/projects/dsa-lab";

const entry = projects.find((project) => project.caseStudyUrl === SLUG);
if (!entry?.image) {
  throw new Error(`The DSA Lab case study needs a project entry with an image at ${SLUG}.`);
}

/** Re-bound after the guard so the narrowing survives into the component. */
const project = entry;
const cover = entry.image;

const title = "DSA Lab — bringing algorithm state into view";
const description =
  "How DSA Lab traces JavaScript, TypeScript and Python in the browser: AST instrumentation, a sandboxed worker, normalized step snapshots and a canvas that diffs every state.";

export const metadata: Metadata = {
  title,
  description,
  // Every non-root route has to claim its own canonical URL, or it inherits
  // the homepage's and is treated as a duplicate of it.
  alternates: {
    canonical: `${SITE_URL}${SLUG}`,
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}${SLUG}`,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_IN",
    images: [
      {
        url: cover.src,
        width: cover.width,
        height: cover.height,
        alt: cover.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: "@amans3103",
    creator: "@amans3103",
    images: [cover.src],
  },
};

/**
 * The article node, cross-linked to the Person the layout already declares.
 * `TechArticle` rather than `Article` because this is an engineering write-up;
 * search engines read it as documentation about a piece of software.
 */
function CaseStudyJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@type": "TechArticle",
          "@id": `${SITE_URL}${SLUG}#article`,
          headline: title,
          description,
          url: `${SITE_URL}${SLUG}`,
          image: `${SITE_URL}${cover.src}`,
          inLanguage: "en",
          author: { "@id": PERSON_ID },
          isPartOf: { "@id": WEBSITE_ID },
          about: {
            "@type": "SoftwareApplication",
            name: project.name,
            applicationCategory: "WebApplication",
            url: project.demoUrl ?? undefined,
            operatingSystem: "Web",
            author: { "@id": PERSON_ID },
          },
          keywords: project.stack.join(", "),
        }),
      }}
    />
  );
}

/** A numbered pipeline stage in the architecture diagram. */
const PIPELINE = [
  {
    title: "Editor",
    detail:
      "CodeMirror 6 holds the solution and its JSON input. No build step, no upload — the code stays on the page.",
  },
  {
    title: "Instrumenter",
    detail:
      "acorn parses the source and a scope-aware walker splices capture hooks into the AST, so every state change announces itself.",
  },
  {
    title: "Sandboxed worker",
    detail:
      "The rewritten code runs in a Blob-constructed Web Worker with fetch, XHR, WebSockets and importScripts disabled.",
  },
  {
    title: "Step snapshots",
    detail:
      "Each meaningful change becomes one self-contained snapshot: deep-cloned, deduplicated, and capped at 3,000 steps.",
  },
  {
    title: "Normalizer",
    detail:
      "Worker output is untrusted data. A whitelist coerces every field and derives plain-English notes before the canvas sees a step.",
  },
  {
    title: "Canvas",
    detail:
      "Renderers diff each step against the previous one, animate what moved, and keep comparisons, swaps and writes on the counter.",
  },
] as const;

const DECISIONS = [
  {
    decision: "Trace in the browser, not on a server",
    wins: "A trace needs no network, no API key and no per-run cost, and user code never touches infrastructure.",
    costs:
      "The machine doing the work is the visitor’s, so step counts and time get hard caps.",
  },
  {
    decision: "Real CPython through Pyodide",
    wins: "Python runs with true semantics and true line numbers via sys.settrace — no AI translation, no round-trip.",
    costs:
      "The runtime is a large WASM download, which is why JavaScript and TypeScript stay the fast path.",
  },
  {
    decision: "Own the session, skip the auth provider",
    wins: "Google PKCE plus a stateless HS256 JWT in an httpOnly cookie is one dependency and one endpoint.",
    costs: "The refresh, expiry and cookie handling are mine to get right and keep right.",
  },
  {
    decision: "Normalize at the boundary",
    wins: "A malformed or hostile step can never reach a renderer; the canvas only knows one typed shape.",
    costs: "The schema is a contract to maintain every time the tracer learns a new structure.",
  },
] as const;

const NEXT_STEPS = [
  "Permalinks to a single step, so a mentor can send the exact state where the bug happens.",
  "More structures — heaps, tries and union-find are the requests that come up most.",
  "Measure learning, not engagement: completion of a trace, not minutes on the page.",
  "A server execution path for languages Pyodide cannot carry.",
] as const;

function Section({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24">
      <RevealRule className="h-px w-full bg-border" />
      <div className="grid gap-4 py-9 sm:grid-cols-[110px_1fr] sm:gap-10 sm:py-11">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground/60">
            {index}
          </p>
          <h2 className="mt-1 text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {label}
          </h2>
        </div>
        <div className="min-w-0 space-y-4 text-[15px] leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function DsaLabCaseStudy() {
  return (
    <>
      <CaseStudyJsonLd />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-4 px-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            {profile.name}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/#projects"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              All projects
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6">
        <article>
          <header className="pt-12 pb-8 sm:pt-16">
            <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              <span>Case study</span>
              <span aria-hidden className="text-muted-foreground/40">
                /
              </span>
              <span>{project.year}</span>
            </p>

            <h1 className="mt-3 text-[2.3rem] leading-[1.05] font-medium tracking-tight sm:text-[3rem]">
              DSA Lab
            </h1>

            <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground sm:text-[1.15rem]">
              A code visualizer that shows what an algorithm is doing, one state
              at a time — built as a client-side trace pipeline, not a gallery of
              finished answers.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Button
                nativeButton={false}
                className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                render={
                  <a
                    href={project.demoUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <Play className="size-3.5" />
                Open the live app
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                render={
                  <a
                    href="https://codevisualizer.vercel.app/docs"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <ExternalLink className="size-3.5" />
                Technical docs
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-5 text-[13px] sm:grid-cols-4">
              <div>
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground/60 uppercase">
                  Role
                </dt>
                <dd className="mt-1.5">Design and engineering</dd>
              </div>
              <div>
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground/60 uppercase">
                  Scope
                </dt>
                <dd className="mt-1.5">Solo build</dd>
              </div>
              <div>
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground/60 uppercase">
                  Status
                </dt>
                <dd className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground/60 uppercase">
                  Year
                </dt>
                <dd className="mt-1.5">{project.year}</dd>
              </div>
            </dl>
          </header>

          <figure>
            <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                sizes="(min-width: 672px) 624px, calc(100vw - 48px)"
                className="h-auto w-full"
                priority
              />
            </div>
            <figcaption className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground/80">
              A Fibonacci recursion trace: the active code line, the call stack
              and the state at the current step.
            </figcaption>
          </figure>

          <Section index="01" label="The problem">
            <p className="text-muted-foreground">
              Interview practice tools optimise for the verdict. You submit your
              solution, it passes or it fails, and the feedback is a line of
              text. The part that is actually hard to learn — which pointer
              moved, what the map held when the lookup missed, how deep the
              recursion had gone — is gone by the time you see the result.
            </p>
            <p>
              Reading someone else’s solution does not fix that either. You can
              follow the code line by line and still not see the state. DSA Lab
              starts from the opposite assumption:{" "}
              <span className="font-medium text-foreground">
                make the state the thing on screen, and let the code follow
                along.
              </span>
            </p>
          </Section>

          <Section index="02" label="What it does">
            <ul className="space-y-3">
              {[
                "Runs JavaScript, TypeScript and Python, and turns one execution into a navigable list of states.",
                "Renders arrays, strings, hash maps, matrices, graphs, linked lists, trees and call stacks, each in its own panel.",
                "Diffs every step against the one before it: changed cells, moved pointers, new map entries, updated links.",
                "Counts comparisons, swaps and writes as the trace plays, turning a walkthrough into a complexity lesson.",
                "Saves named solutions to a practice library behind Google sign-in.",
                "Answers questions about the run in place, with the current step supplied as context.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2.5 h-px w-3 shrink-0 bg-border"
                  />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section index="03" label="Architecture">
            <p className="text-muted-foreground">
              One trace is a pipeline, and each stage has exactly one job. The
              important boundary is between stage three and stage five: everything
              the worker emits is treated as untrusted input until it has been
              normalized.
            </p>

            <ol className="mt-6">
              {PIPELINE.map((stage, index) => (
                <li key={stage.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border font-mono text-[11px] text-muted-foreground">
                      {index + 1}
                    </span>
                    {index < PIPELINE.length - 1 ? (
                      <span
                        aria-hidden
                        className="my-1 w-px flex-1 bg-border"
                      />
                    ) : null}
                  </div>
                  <div className={index < PIPELINE.length - 1 ? "pb-5" : ""}>
                    <p className="text-[14px] font-medium">{stage.title}</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                      {stage.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Python takes a different route through the same idea: real CPython
              compiled to WebAssembly runs under{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                sys.settrace
              </code>
              , and its line events are converted into the same{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                VisualStep
              </code>{" "}
              shape. The canvas never knows which language produced a step.
            </p>
          </Section>

          <Section index="04" label="The hard parts">
            <h3 className="text-[15px] font-medium">
              Instrumentation, not guessing
            </h3>
            <p className="text-muted-foreground">
              There is no supported way to read a function’s local variables
              from outside it. So the tracer does not observe the program — it
              rewrites it. The source is parsed into an AST and capture calls
              are spliced in at the points where state changes: loop
              conditions, assignments, returns, map and array access, function
              entry.
            </p>
            <p className="text-muted-foreground">
              The awkward part is that the rewrite has to preserve the original
              semantics, including the corners: a bare{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                if
              </code>{" "}
              body that would detach once a statement is inserted, a ternary
              that evaluates while its own{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                const
              </code>{" "}
              is still in its temporal dead zone,{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                var
              </code>{" "}
              declarations hoisted out of a loop body, and overlapping edits
              that would otherwise apply twice against stale source offsets.
              Line numbers come from the AST, and translated solutions carry
              their own line directives so a step still points at the code the
              student actually wrote.
            </p>

            <h3 className="pt-3 text-[15px] font-medium">
              A sandbox that cannot phone home
            </h3>
            <p className="text-muted-foreground">
              Pasted code is arbitrary code, so it never runs on the main
              thread. A Blob-constructed Web Worker executes the instrumented
              source with networking APIs removed entirely — no fetch, no
              XHR, no WebSockets, no importScripts. History is protected too:
              every snapshot is deep-cloned at emit time with a cycle-aware
              clone, so a later mutation cannot rewrite an earlier step, and a
              cyclic linked list serialises as a marker instead of a hang.
            </p>
            <p className="text-muted-foreground">
              Traces are deduplicated and capped at 3,000 steps, with an
              adaptive timeout; a step that changed nothing visible is
              dropped. What comes back is still untrusted, so the normalizer
              whitelists every field and coerces it before the canvas renders
              anything.
            </p>

            <h3 className="pt-3 text-[15px] font-medium">
              Making a step explain itself
            </h3>
            <p className="text-muted-foreground">
              A list of snapshots is not a lesson. The canvas diffs each step
              against the previous one, so changed cells and map entries are
              highlighted with the value they replaced; integer variables in
              scope become labelled pointers above the array, and{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                left
              </code>
              /
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12.5px]">
                right
              </code>{" "}
              pairs draw a range band. Bars are keyed and FLIP-animated, so a
              swap visibly slides two values into each other’s places instead
              of popping.
            </p>
            <p className="text-muted-foreground">
              The plain-English explanation of a step is derived from the step
              itself — no model call. The model is used where it is actually
              needed: translating a solution between languages (cached in
              Postgres, rate-limited per visitor) and answering questions about
              the current run, with the step supplied as context rather than
              asking the model to remember it.
            </p>
          </Section>

          <Section index="05" label="Tradeoffs">
            <dl className="divide-y divide-border">
              {DECISIONS.map((item) => (
                <div key={item.decision} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-[14px] font-medium">{item.decision}</dt>
                  <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    <span className="text-foreground/80">Gain:</span>{" "}
                    {item.wins}{" "}
                    <span className="text-foreground/80">Cost:</span>{" "}
                    {item.costs}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section index="06" label="Next">
            <ul className="space-y-3">
              {NEXT_STEPS.map((item) => (
                <li key={item} className="flex gap-3">
                  <ArrowUpRight
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60"
                  />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <RevealRule className="h-px w-full bg-border" />

          <div className="grid gap-5 py-10 sm:grid-cols-[110px_1fr] sm:gap-10 sm:py-14">
            <h2 className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Stack
            </h2>
            <div>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Tag key={tech} tone={toneForTech(tech)}>
                    {tech}
                  </Tag>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
                <p className="text-[14px] leading-relaxed">
                  The best way to judge this one is to run a trace, not read
                  about it.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    nativeButton={false}
                    className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                    render={
                      <a
                        href={project.demoUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <Play className="size-3.5" />
                    Try DSA Lab
                  </Button>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    className="rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                    render={<Link href="/#contact" />}
                  >
                    Talk to me about it
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <footer className="mt-6 border-t border-border">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-8 text-[12px] text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <Link href="/" className="transition-colors hover:text-foreground">
            Portfolio
          </Link>
        </div>
      </footer>
    </>
  );
}
