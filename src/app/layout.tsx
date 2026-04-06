import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupaViewer - Supabase Database Explorer",
  description: "A beautiful, professional Supabase database explorer in the browser",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-oled text-zinc-200 antialiased">{children}</body>
    </html>
  );
}
