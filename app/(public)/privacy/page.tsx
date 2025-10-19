export const metadata = {
  title: 'Privacy Policy - SupaViewer',
  description: 'Privacy policy for SupaViewer',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="container-custom py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gradient-cinema mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use SupaViewer, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (email address) when you sign up</li>
              <li>Video submissions including titles, descriptions, and YouTube URLs</li>
              <li>Creator information you provide (name, website, social media)</li>
              <li>Your ratings and interactions with videos</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and maintain the SupaViewer service</li>
              <li>Process your video submissions and ratings</li>
              <li>Communicate with you about your account and submissions</li>
              <li>Improve our service and user experience</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              Your data is stored securely using Supabase (PostgreSQL database) with industry-standard encryption.
              We implement appropriate technical and organizational measures to protect your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Supabase</strong> - For authentication and database services</li>
              <li><strong>YouTube</strong> - For embedding videos (subject to YouTube&apos;s privacy policy)</li>
              <li><strong>Vercel</strong> - For hosting and deployment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies for authentication and session management. These cookies are necessary
              for the platform to function properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through the
              {' '}<a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
