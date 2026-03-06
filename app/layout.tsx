import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
  metadataBase: new URL("https://superviewer.com"),
  title: "Superviewer",
  description: "A cinematic home for AI-native films and numbered discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${fraunces.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_22%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.04),transparent_16%),radial-gradient(circle_at_50%_120%,rgba(20,20,24,0.34),transparent_38%),linear-gradient(180deg,rgba(6,6,8,0),rgba(6,6,8,0.62)_48%,rgba(6,6,8,0.98))]" />
        <div className="relative min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
