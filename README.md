# Aman Singanamala — Portfolio

A minimal single-column portfolio built with **Next.js 16 (App Router)**, **TypeScript**,
**Tailwind CSS v4**, **shadcn/ui**, **Motion** and **three.js**. Light and dark themes,
colour-coded tags, scroll-driven animation, and a cel-shaded 3D companion that follows the page.

## The 3D companion

A small cel-shaded cartoon character accompanies the page. It is **built entirely from three.js
primitives** — spheres, capsules and a cylinder — so there is no GLTF/GLB to fetch, no loading
state and nothing to license.

### Placement

- **In the hero** — inline beside the name at 80px (96px from `sm`, and docked size below `xl`),
  so it reads as an avatar that is part of the intro rather than an element orphaned above it.
- **Docked, every width** — once the hero has scrolled past it leaves the flow and stays on
  screen for the rest of the page: on phones and tablets it lands just above the back-to-top
  button in the corner at 96px (the content column leaves no margin there, so the corner is the
  only spot that never covers copy), and from `xl` up it takes the free right margin at 208px.
  A companion that scrolls away with the hero has nothing to react to, so the docked state is
  what makes the scroll awareness below possible.

The xl right offset is `calc(50% - 542px)` rather than a fixed `right`, which reproduces the
content column's edge plus its 22px gap at any width past `xl` instead of drifting with the
viewport. On mobile the dock sits at `bottom: 76px` — 24px edge + 40px back-to-top button +
12px gap. The companion is a real button (it opens the chat, see below), so it takes pointer
events in both states; its box stays inside the free margin at `xl` and in the corner below it.

The wrapper is deliberately a sibling of the `<Reveal>` around the name block: Motion puts a
`transform` on that element, which would make it the containing block for a positioned child and
break the margin placement.

- `src/components/mascot/character.ts` — the whole three.js scene: geometry, toon gradient
  material, lighting, and the animation state machine. Owns no DOM.
- `src/components/mascot/mascot-canvas.tsx` — a client component that mounts the canvas, sizes it
  with a `ResizeObserver`, tracks the pointer and the scroll, and runs/pauses the loop.
- `src/components/mascot/companion.tsx` — the wrapper that keeps it inline in the hero and docks
  it in the corner (or the margin from `xl` up) once the hero scrolls away, and the button that
  toggles the chat panel.
- `src/components/mascot/mascot.tsx` — a thin `next/dynamic` wrapper.

### Why `next/dynamic` and not a plain `import()`

A bare `await import("./character")` inside an effect still lets Next hoist the whole `three`
chunk into the page as `<script async>` — confirmed by inspecting the built HTML, where the 536KB
chunk appeared in the initial document. `dynamic(..., { ssr: false })` is what actually defers it.

### Behaviour

- **Cel shading** — `MeshToonMaterial` with a 3-band `DataTexture` gradient map.
- **Outline** — vertices extruded along their normals by a fixed world distance, so the line stays
  even between the fat body and the thin arms. A uniformly scaled copy would vanish on the arms.
- **Idle** — breathing squash, vertical bob, arm sway out of phase, pulsing antenna tip.
- **Cursor** — the body turns to follow the pointer (damped, so it eases rather than snaps) and the
  eyes drift slightly further than the head.
- **Scroll** — the host derives a scroll intent from how far the page moved since the last frame,
  and the scene smooths it into a head pitch: it looks down as the reader works down the page and
  back up when they scroll up, with the eyes leading the head. Because the intent is smoothed
  rather than sampled, the nod eases in and unwinds on its own once the scrolling stops.
- **Greeting** — reaching Projects or Contact plays a one-shot wave (arm raised past 90°, wobble and
  a lean into it). The request is a single frame's worth of state, so a wave asked for while the
  canvas is off screen is dropped rather than replayed late — which matters on phones when the
  reader jumps to the bottom before the companion has ever docked.
- **Blinking** — randomised every 2.6–5.8s on the eye group's Y scale.
- **Perf** — the loop stops when the canvas leaves the viewport or the tab is hidden; scroll is a
  passive listener that only accumulates a delta; DPR is capped at 2; the palette swaps on theme
  change without rebuilding the scene.
- **Reduced motion** — renders one settled frame and never starts the loop; no wave, no nod, and
  the dock transition is disabled.
- **Fallback** — if WebGL is unavailable the GitHub avatar image renders in its place.

The character replaced the small round avatar image in the hero, so the hero no longer shows a
photo.

## Ask Nova — the portfolio assistant

Tapping the companion opens a small chat panel: **Nova answers questions about Aman and nothing
else**. Recruiters can ask about experience, projects or contact details without reading the whole
page.

### How it stays grounded

The entire knowledge base is `src/lib/data.ts` serialized into the system prompt (a few KB, so it
fits whole — no embeddings, no vector store, no RAG). `src/lib/assistant.ts` builds that prompt,
plus strict rules: third person only, refuse anything not about Aman, admit when the facts don't
cover it, never quote the instructions. Editing `data.ts` instantly updates what Nova knows.

### Anatomy

- `src/lib/assistant.ts` — facts dump + system prompt + suggested starter questions.
- `src/app/api/chat/route.ts` — POST endpoint: per-IP rate limit (12/min), message cap, and the
  provider switch below. Standalone text questions use a 24-hour server cache, normalised for
  casing, whitespace, and trailing punctuation, so repeats do not call the model again. Follow-up
  questions still use their current conversation context. No conversation storage anywhere —
  history lives only in the visitor's browser for the visit.
- `src/components/chat/chat-panel.tsx` — the panel: streaming responses via the AI SDK's `useChat`,
  suggestion chips, stop/regenerate, and a graceful amber banner (with retry) when the API key is
  missing or the provider fails.
- Mascot integration — the companion button toggles the panel, and while it is open the character's
  antenna pulses faster and the eyes widen (`MascotHandle.setThinking`), so the 3D character and
  the assistant read as one being.

### Choosing a provider (env vars, no code change)

Nova runs through [OpenRouter](https://openrouter.ai), which uses an OpenAI-compatible chat
endpoint. Set these in Vercel under Project → Settings → Environment Variables:

1. `OPENROUTER_API_KEY` — required; create one at [OpenRouter Keys](https://openrouter.ai/keys).
   Keep it server-only; never expose it as `NEXT_PUBLIC_*`.
2. `OPENROUTER_MODEL` — optional; defaults to `~openai/gpt-sol-latest`, an alias that stays on
   the newest GPT Sol model. Set a different OpenRouter model slug here to change models without
   modifying the route. GPT Sol is a paid model, so ensure the OpenRouter account has credits and
   appropriate spend limits.
3. `SITE_URL` — optional; the public deployment URL used for OpenRouter app attribution. It
   defaults to the portfolio's production URL.

Without the key, the site still builds and deploys — Nova just apologises that it isn't
connected yet. Model IDs live in `src/app/api/chat/route.ts` if you ever want to swap them.

## Content

Everything lives in **`src/lib/data.ts`**:

- `profile` — name, role, tagline, summaries, location, avatar, résumé link
- `socials` — GitHub, LeetCode, LinkedIn, Medium, X, email
- `experience` — UBS full-time + internship, with the résumé bullets
- `projects` — DSA Lab, linkhub, Uber ETL Pipeline, Streamlit Apps
- `posts` — the 8 Medium articles from `medium.com/@embed17`
- `skillGroups`, `certifications`, `education`, `awards`, `interests`

### Updating the résumé (no redeploy)

The PDF is **not** in the repo. `profile.resumeUrl` points at the GitHub Releases
"latest download" URL, which never changes but always serves the newest asset on the
`resume` release:

> https://github.com/lorem-ipsum20/my-page/releases/latest/download/AmanSinganamala-Resume.pdf

To publish a new résumé: open the [resume release](https://github.com/lorem-ipsum20/my-page/releases/tag/resume)
on GitHub, delete the old asset, upload the new PDF **with the exact same filename**, save.
The site picks it up on the next download — no commit, no deploy, doable from a phone.
The release must stay the latest one, and the repo must stay public for the link to work
anonymously.

### Known gaps to fill in

`projects[0].repoUrl` (DSA Lab) is `null` — the source is private, so the card shows its live
demo link (codevisualizer.vercel.app) only. Add a public repo URL if one ever exists.

## Theming

- `next-themes` with `attribute="class"`, defaulting to the system preference.
- Tokens are defined twice in `src/app/globals.css` under `:root` and `.dark`, in OKLCH.
- `--brand` is the single accent colour used for focus rings, links and the scroll progress bar.
- The toggle in the header is a **segmented sun/moon switch** — both options always visible with
  the active one raised, so it shows the current theme instead of a static icon. It animates with
  the **View Transitions API** — a radial wipe that expands from the click point. It falls back to
  an instant swap where unsupported or when the user prefers reduced motion. The highlight applies
  after mount, keeping hydration exact (next-themes cannot know the system theme on the server).

## Colour coding

`src/lib/tones.ts` defines one tone per category, in light and dark:

| Layer              | Tone    |
| ------------------ | ------- |
| Languages          | sky     |
| Frontend           | violet  |
| Backend            | amber   |
| AI & LLM Tooling   | emerald |
| Cloud & DevOps     | cyan    |
| Databases & Tools  | rose    |
| Data / notebooks   | teal    |
| Tooling / tests    | indigo  |

`toneForTech()` applies the same palette to stack tags on experience rows and projects, so a
technology looks identical wherever it appears. `toneForTag()` does the same for Medium tags.

## Motion

- `Reveal` / `RevealRule` (`src/components/reveal.tsx`) — scroll-triggered fade-and-lift, and a
  hairline rule that draws itself in.
- The hero staggers on mount.
- `SiteHeader` tracks scroll progress with a spring and highlights the active section against a
  probe line (not `IntersectionObserver`, so the last section still activates at the page end).
  The probe-line logic lives in `useActiveSection()` (`src/lib`), shared with the mobile dock so
  both can never disagree.
- **Mobile nav** — below `md` the header links are replaced by a frosted pill fixed at the bottom
  (`src/components/mobile-nav.tsx`): all six sections as chips, the active one inverted. It hides
  while the reader scrolls down and returns on scrolling up or at the top, with a short suppression
  window after a tap so using it never hides it. On phones the floating elements stack in the right
  corner — mobile dock band, back-to-top above it, docked companion above that — while `md`+ widths
  keep the plain corner.
- Resume bullets past the first four expand with a `grid-template-rows: 0fr → 1fr` transition.
- `BackToTop` fades in once the hero leaves the viewport and rides the page's own
  `scroll-behavior`, so it is smooth normally and instant under reduced motion without any JS
  branching. While hidden it is `invisible` rather than transparent, which keeps an invisible tab
  stop off the end of the page. It uses the `ghost` button variant deliberately: `outline` carries
  `dark:bg-input/30`, which is a separate variant group and so is emitted after the surface classes,
  quietly replacing the background in dark mode.
- Everything respects `prefers-reduced-motion`.

## Commands

```bash
npm run dev             # dev server
npm run build           # production build (static prerender)
npm run start           # serve the production build
npx tsc --noEmit        # typecheck
npx eslint src          # lint
```

## Structure

```
src/
  app/
    layout.tsx                     # fonts, metadata, ThemeProvider
    page.tsx                       # composes every section
    globals.css                    # light/dark tokens, view-transition styles
  components/
    site-header.tsx                # sticky nav, progress bar, scroll spy
    mobile-nav.tsx                 # bottom section dock on <md screens
    back-to-top.tsx                # floating jump-to-top, appears past the hero
    theme-toggle.tsx               # radial-wipe theme switch
    theme-provider.tsx
    reveal.tsx                     # shared scroll-reveal primitives
    typewriter.tsx                 # cycling role headline
    tag.tsx                        # colour-coded pill
    icons.tsx                      # brand SVGs (removed from lucide)
    mascot/
      mascot.tsx                   # next/dynamic wrapper (ssr: false)
      companion.tsx                # hero placement / margin dock
      mascot-canvas.tsx            # canvas, sizing, loop, pointer, scroll
      character.ts                 # the three.js scene itself
    portfolio/
      hero.tsx about.tsx experience.tsx projects.tsx writing.tsx
      skills.tsx education.tsx contact.tsx
      section.tsx                  # labelled section + animated rule
      expandable-highlights.tsx
    ui/                            # shadcn: badge, button
  lib/
    data.ts                        # all content
    tones.ts                       # colour-coding system
    utils.ts
public/
  AmanSinganamala-Resume.pdf
```
