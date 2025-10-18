import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-gradient-cinema inline-block mb-4">
              SupaViewer
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              The premier discovery and curation platform for AI-generated video content.
              Elevating quality AI cinema.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Browse Videos
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Submit Video
                </Link>
              </li>
              <li>
                <Link href="/creators" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Creators
                </Link>
              </li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} SupaViewer. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-2 sm:mt-0">
            Built for the AI cinema community
          </p>
        </div>
      </div>
    </footer>
  );
}
