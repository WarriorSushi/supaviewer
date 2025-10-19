import { Mail, MessageSquare, Github } from 'lucide-react'

export const metadata = {
  title: 'Contact Us - SupaViewer',
  description: 'Get in touch with the SupaViewer team',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="container-custom py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-cinema mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            Have questions or feedback? We&apos;d love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* General Inquiries */}
          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">General Inquiries</h2>
            <p className="text-muted-foreground mb-4">
              For general questions, partnerships, or business inquiries
            </p>
            <a
              href="mailto:hello@supaviewer.com"
              className="text-primary hover:underline font-medium"
            >
              hello@supaviewer.com
            </a>
          </div>

          {/* Support */}
          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-amber" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">Support</h2>
            <p className="text-muted-foreground mb-4">
              Need help with your account or have technical issues?
            </p>
            <a
              href="mailto:support@supaviewer.com"
              className="text-primary hover:underline font-medium"
            >
              support@supaviewer.com
            </a>
          </div>

          {/* GitHub */}
          <div className="bg-card border border-border rounded-xl p-8 hover:border-primary transition-all md:col-span-2">
            <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center mb-4">
              <Github className="w-6 h-6 text-crimson" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">Open Source</h2>
            <p className="text-muted-foreground mb-4">
              SupaViewer is open source! Report bugs, request features, or contribute on GitHub
            </p>
            <a
              href="https://github.com/warriorsushi/supaviewer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center gap-2"
            >
              View on GitHub
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-muted/50 rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
          <p className="text-sm text-muted-foreground">
            We aim to respond to all inquiries within 24-48 hours during business days.
            For urgent issues, please mention &ldquo;URGENT&rdquo; in your email subject line.
          </p>
        </div>
      </div>
    </div>
  )
}
