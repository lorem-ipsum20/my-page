import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  GOOGLE_SITE_VERIFICATION,
  NAME_ALTERNATES,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { profile } from "@/lib/data";
import { jsonLd, personNode, websiteNode } from "@/lib/structured-data";
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

/**
 * The description doubles as the search-result snippet, so the name leads it.
 * A name query is decided in the snippet: a visitor scanning results for
 * "Aman Singanamala" needs to see those exact words, not just a job title.
 */
const description =
  "Aman Singanamala is a Full Stack Software Developer in Pune, India, building secure web applications with React, Spring Boot, Java and Azure.";

/**
 * Search Console and Bing Webmaster verification. Both tokens are public by
 * design — they ship in the HTML head — so an environment variable is a
 * convenience for rotation, not a place a secret has to live. An empty string
 * counts as unset, and an absent token emits no tag at all.
 */
const envToken = (value: string | undefined) =>
  value && value.trim() ? value.trim() : undefined;

const googleVerification =
  envToken(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) ??
  GOOGLE_SITE_VERIFICATION;
const bingVerification = envToken(
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
);

const verification: Metadata["verification"] = {
  ...(googleVerification ? { google: googleVerification } : {}),
  ...(bingVerification
    ? { other: { "msvalidate.01": bingVerification } }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: {
    // One canonical identity for the site, whatever URL it is browsed from.
    canonical: SITE_URL,
  },
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  // Keywords carry no ranking weight with Google, but Bing and several
  // ATS/recruiter crawlers still read them, and the name variants cost
  // nothing to declare.
  keywords: [
    ...NAME_ALTERNATES,
    "Aman Singanamala portfolio",
    "Aman Singanamala resume",
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
  ...(Object.keys(verification).length > 0 ? { verification } : {}),
};

/**
 * The site-wide half of the JSON-LD graph: the person and the website they
 * own, cross-linked by `@id`. The home route adds a ProfilePage node on top
 * (see page.tsx); every other route still gets the identity.
 */
function IdentityJsonLd() {
  return (
    <script
      type="application/ld+json"
      // Structured data is static JSON derived from data.ts — no user input.
      dangerouslySetInnerHTML={{ __html: jsonLd([websiteNode(), personNode()]) }}
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
        <IdentityJsonLd />
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
