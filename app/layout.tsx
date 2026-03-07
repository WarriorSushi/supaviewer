import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://supaviewer.com"),
  title: {
    default: "Supaviewer",
    template: "%s | Supaviewer",
  },
  description: "A cinematic home for AI-native films, creator filmographies, and serial-numbered discovery.",
  applicationName: "Supaviewer",
  keywords: [
    "AI films",
    "AI cinema",
    "AI movies",
    "AI-generated video",
    "long-form AI video",
    "creator filmography",
    "serial catalog",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Supaviewer",
    title: "Supaviewer",
    description: "A cinematic home for AI-native films, creator filmographies, and serial-numbered discovery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supaviewer",
    description: "A cinematic home for AI-native films, creator filmographies, and serial-numbered discovery.",
  },
  icons: {
    icon: [
      { url: "/brand/supaviewer-logo.png", type: "image/png" },
      { url: "/brand/supaviewer-logo.webp", type: "image/webp" },
    ],
    shortcut: ["/brand/supaviewer-logo.png"],
    apple: ["/brand/supaviewer-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${fraunces.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="relative min-h-screen">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
