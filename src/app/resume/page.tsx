import {
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  awards,
  certifications,
  education,
  experience,
  profile,
  projects,
  skillGroups,
  socials,
} from "@/lib/data";
import Link from "next/link";
import { socialIconMap } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/resume/print-button";

/**
 * The on-site résumé.
 *
 * The document is rendered from the same `src/lib/data.ts` the portfolio
 * reads, so there is a single source of truth; the downloadable PDF remains
 * the GitHub Releases asset and stays the version to hand to recruiters.
 *
 * Layout: on small screens the sheet runs near full-width and the type scales
 * down; from `sm` up it is a centred A4-proportioned page with generous
 * margins. Print styles in globals.css force a plain black-on-white sheet
 * regardless of theme.
 */
export const metadata = {
  title: "Résumé — Aman Singanamala",
  description:
    "The résumé of Aman Singanamala, full stack software developer — experience, projects, skills and education, rendered live from the same data as the site.",
};

const formatDate = (iso: string) => {
  const [year, month] = iso.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[Number(month) - 1]} ${year}`;
};

export default function ResumePage() {
  const github = socials.find((s) => s.icon === "github");
  const linkedin = socials.find((s) => s.icon === "linkedin");
  const leetcode = socials.find((s) => s.icon === "leetcode");
  const medium = socials.find((s) => s.icon === "medium");
  const websiteLinks = [github, linkedin, leetcode, medium].filter(Boolean);

  return (
    <div className="min-h-screen bg-muted/40 py-0 print:bg-white print:py-0">
      {/* Viewer toolbar. Stays sticky on both mobile and desktop; hidden in print. */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden className="text-base leading-none">
              ←
            </span>
            <span className="relative">
              Portfolio
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              nativeButton={false}
              className="rounded-full"
              render={<a href={profile.resumeUrl} target="_blank" rel="noreferrer" />}
            >
              <Download className="size-3.5" />
              PDF
            </Button>
            <PrintButton />
          </div>
        </div>
      </div>

      {/* The sheet. Near full-width on phones, centred A4-style page from sm up. */}
      <article
        className="mx-auto mt-4 mb-10 w-[calc(100%-1.5rem)] max-w-4xl rounded-lg border border-border bg-background px-5 py-8 shadow-sm sm:mt-8 sm:mb-16 sm:w-auto sm:px-12 sm:py-12 print:m-0 print:w-full print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
        style={{ minHeight: "auto" }}
      >
        {/* ---- Header ---- */}
        <header className="border-b border-border pb-6">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {profile.name}
              </h1>
              <p className="mt-1 text-[13.5px] text-muted-foreground sm:text-[15px]">
                {profile.role}
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 text-[12px] leading-relaxed text-muted-foreground sm:items-end sm:text-[12.5px]">
              <p className="inline-flex items-center gap-1.5">
                <MapPin className="size-3" />
                {profile.location}
              </p>
              <p className="inline-flex items-center gap-1.5">
                <Mail className="size-3" />
                <a href={`mailto:${profile.email}`} className="hover:text-foreground">
                  {profile.email}
                </a>
              </p>
              <p className="inline-flex items-center gap-1.5">
                <Phone className="size-3" />
                <a
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground"
                >
                  {profile.phone}
                </a>
              </p>
            </div>
          </div>

          {websiteLinks.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
              {websiteLinks.map((social) => {
                const Icon = socialIconMap[social!.icon];
                return (
                  <a
                    key={social!.href}
                    href={social!.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Icon className="size-3" />
                    {social!.handle}
                  </a>
                );
              })}
            </p>
          )}
        </header>

        {/* ---- Summary ---- */}
        <section className="mt-6">
          <p className="text-[13px] leading-relaxed text-foreground/90 sm:text-[13.5px]">
            {profile.summary}
          </p>
        </section>

        {/* ---- Skills ---- */}
        <ResumeSection title="Skills">
          <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {skillGroups.map((group) => (
              <div key={group.title} className="flex gap-3 text-[12.5px] leading-relaxed">
                <span className="w-28 shrink-0 font-medium text-foreground sm:w-32">
                  {group.title}
                </span>
                <span className="text-muted-foreground">
                  {group.skills.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </ResumeSection>

        {/* ---- Experience ---- */}
        <ResumeSection title="Experience">
          <div className="space-y-6">
            {experience.map((job) => (
              <div key={`${job.company}-${job.start}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <h3 className="text-[14px] font-medium tracking-tight">
                    {job.title}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {job.company}
                    </span>
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatDate(job.start)} — {job.end === "Present" ? "Present" : formatDate(job.end)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {job.location}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {job.highlights.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 text-[12.5px] leading-relaxed text-foreground/85"
                    >
                      <span aria-hidden className="mt-[0.55em] h-px w-2.5 shrink-0 bg-border" />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-mono text-[10.5px] text-muted-foreground/80">
                  {job.stack.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </ResumeSection>

        {/* ---- Projects ---- */}
        <ResumeSection title="Projects">
          <div className="space-y-5">
            {projects.map((project) => (
              <div key={project.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <h3 className="text-[14px] font-medium tracking-tight">
                    {project.name}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 inline-flex items-center gap-1 align-baseline text-[11px] font-normal text-brand hover:underline"
                      >
                        live
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {project.year}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">
                  {project.description}
                </p>
                <p className="mt-1 font-mono text-[10.5px] text-muted-foreground/80">
                  {project.stack.slice(0, 6).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </ResumeSection>

        {/* ---- Education ---- */}
        <ResumeSection title="Education">
          <div className="space-y-3">
            {education.map((school) => (
              <div key={school.school}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <h3 className="text-[13.5px] font-medium tracking-tight">
                    {school.school}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {school.period}
                  </span>
                </div>
                <p className="text-[12.5px] text-muted-foreground">
                  {school.qualification} · {school.detail} · {school.location}
                </p>
              </div>
            ))}
          </div>
        </ResumeSection>

        {/* ---- Certifications & awards ---- */}
        <ResumeSection title="Certifications & Awards">
          <ul className="space-y-1.5">
            {certifications.map((cert) => (
              <li
                key={cert}
                className="flex gap-2.5 text-[12.5px] leading-relaxed text-foreground/85"
              >
                <span aria-hidden className="mt-[0.55em] h-px w-2.5 shrink-0 bg-border" />
                {cert}
              </li>
            ))}
            {awards.map((award) => (
              <li
                key={award.title}
                className="flex gap-2.5 text-[12.5px] leading-relaxed text-foreground/85"
              >
                <span aria-hidden className="mt-[0.55em] h-px w-2.5 shrink-0 bg-border" />
                <span>
                  <span className="font-medium">{award.title}</span>
                  <span className="text-muted-foreground"> — {award.org}</span>
                </span>
              </li>
            ))}
          </ul>
        </ResumeSection>

        <footer className="mt-8 border-t border-border pt-4 text-[10.5px] text-muted-foreground/70">
          Rendered live from the portfolio&apos;s own data · PDF version always current at{" "}
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            the release link
          </a>
        </footer>
      </article>
    </div>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h2 className="mb-2.5 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
