import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title,
  description,
  authors: [{ name: "Aman Singanamala" }],
  keywords: [
    "Aman Singanamala",
    "Full Stack Developer",
    "React",
    "Spring Boot",
    "TypeScript",
    "Azure",
    "Java",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
};

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
