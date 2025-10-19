export const metadata = {
  title: 'Terms of Service - SupaViewer',
  description: 'Terms of service for SupaViewer',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="container-custom py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gradient-cinema mb-8">Terms of Service</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using SupaViewer, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these terms, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              SupaViewer is a platform for discovering and sharing AI-generated videos. Users can:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Browse and watch AI-generated videos</li>
              <li>Submit videos for community review</li>
              <li>Rate and review videos</li>
              <li>Create creator profiles</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Only submit content you have the rights to share</li>
              <li>Not submit content that violates copyright, trademark, or other intellectual property rights</li>
              <li>Not submit harmful, offensive, or illegal content</li>
              <li>Not attempt to circumvent security measures or abuse the platform</li>
              <li>Respect other users and community guidelines</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Content Submission</h2>
            <p className="text-muted-foreground mb-4">
              When you submit content to SupaViewer:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All submissions are subject to admin review and approval</li>
              <li>We reserve the right to reject any submission without explanation</li>
              <li>You grant SupaViewer a license to display and distribute your submitted content</li>
              <li>You retain ownership of your content</li>
              <li>You must ensure all linked YouTube videos comply with YouTube&apos;s Terms of Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Account Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for violations of
              these terms, or for any other reason we deem necessary to protect the platform and its users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              SupaViewer and its original content, features, and functionality are owned by SupaViewer
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              either express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              SupaViewer shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of any
              material changes. Your continued use of the service after such modifications constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us through the
              {' '}<a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
