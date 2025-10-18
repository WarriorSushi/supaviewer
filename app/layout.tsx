import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'SupaViewer - Discover AI-Generated Videos',
    template: '%s | SupaViewer',
  },
  description:
    'Explore and discover the best AI-generated videos from Sora, Runway, Pika, and more. Rate, share, and submit your own creations.',
  keywords: [
    'AI videos',
    'AI-generated',
    'Sora',
    'Runway',
    'Pika',
    'video discovery',
    'AI art',
    'generative AI',
  ],
  authors: [{ name: 'SupaViewer' }],
  creator: 'SupaViewer',
  publisher: 'SupaViewer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://supaviewer.com',
    title: 'SupaViewer - Discover AI-Generated Videos',
    description:
      'Explore and discover the best AI-generated videos from Sora, Runway, Pika, and more.',
    siteName: 'SupaViewer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SupaViewer - Discover AI-Generated Videos',
    description:
      'Explore and discover the best AI-generated videos from Sora, Runway, Pika, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
