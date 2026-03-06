import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        className={`${manrope.variable} ${cormorant.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,194,112,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(84,101,160,0.16),transparent_24%),linear-gradient(180deg,rgba(8,10,16,0),rgba(8,10,16,0.4)_48%,rgba(8,10,16,0.95))]" />
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
