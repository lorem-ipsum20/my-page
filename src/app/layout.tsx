import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { profile, projects, socials } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Aman Singanamala — Full Stack Software Developer";
const description =
  "Full Stack Software Developer building scalable, secure web applications with React, Spring Boot, Java and Azure. Writing about authentication, state management and LLM tooling.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: {
    // One canonical identity for the site, whatever URL it is browsed from.
    canonical: SITE_URL,
  },
  authors: [{ name: "Aman Singanamala", url: SITE_URL }],
  creator: "Aman Singanamala",
  keywords: [
    "Aman Singanamala",
    "Aman Singanamala portfolio",
    "Full Stack Developer",
    "Software Developer Pune",
    "React",
    "Spring Boot",
    "TypeScript",
    "Azure",
    "Java",
    "LLM tooling",
  ],
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: "@amans3103",
    creator: "@amans3103",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * schema.org Person, the machine-readable version of the portfolio. This is
 * what lets a search engine connect "amansinganamala" to this URL, the social
 * profiles it already knows (sameAs), and the projects described on the page.
 */
function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: SITE_URL,
    image: profile.avatar,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    worksFor: { "@type": "Organization", name: "UBS" },
    address: { "@type": "PostalAddress", addressLocality: profile.location, addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Vellore Institute of Technology" },
    knowsAbout: [
      "React",
      "Next.js",
      "Spring Boot",
      "Java",
      "TypeScript",
      "Microsoft Azure",
      "LLM integration",
      "Agentic application development",
    ],
    sameAs: socials
      .filter((social) => social.icon !== "mail")
      .map((social) => social.href),
    knowsLanguage: ["en", "te", "hi"],
    // The portfolio's projects as CreativeWorks, so they surface as the
    // person's creations rather than unlinked text.
    hasPart: projects.map((project) => ({
      "@type": "SoftwareApplication",
      name: project.name,
      applicationCategory: "WebApplication",
      description: project.description,
      url: project.demoUrl ?? project.repoUrl ?? undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is static JSON derived from data.ts — no user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // next-themes writes the theme class before paint, so the server markup
      // intentionally differs from the client on <html>.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <PersonJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
