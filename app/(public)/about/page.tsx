import { Sparkles, Users, Video, Heart } from 'lucide-react'

export const metadata = {
  title: 'About - SupaViewer',
  description: 'Learn about SupaViewer and our mission',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="container-custom py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-cinema mb-4">
            About SupaViewer
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The ultimate platform for discovering and sharing AI-generated videos
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-16 bg-gradient-to-br from-crimson/10 to-amber/10 rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            SupaViewer is dedicated to showcasing the incredible creativity and innovation happening
            in AI-generated video content. We provide a curated platform where creators can share their
            work, and audiences can discover the latest and greatest in AI video generation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Curated Content</h3>
            <p className="text-muted-foreground">
              Every video is carefully reviewed to ensure quality. We showcase only the best
              AI-generated content from talented creators around the world.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-crimson" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Creator-First</h3>
            <p className="text-muted-foreground">
              We put creators at the heart of everything we do. SupaViewer provides a platform
              to showcase your work and connect with an audience passionate about AI video.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-amber" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Easy Discovery</h3>
            <p className="text-muted-foreground">
              Browse videos by AI tool, genre, creator, or rating. Our intuitive interface makes
              it easy to find exactly what you&apos;re looking for or discover something new.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Community Driven</h3>
            <p className="text-muted-foreground">
              Rate and review videos, help others discover great content, and be part of a
              growing community of AI video enthusiasts and creators.
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Built With Modern Tech</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground mb-4">
              SupaViewer is built with cutting-edge technologies to provide a fast, reliable,
              and delightful user experience:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span><strong>Next.js 15</strong> - React framework for production</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span><strong>Supabase</strong> - Open source Firebase alternative</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span><strong>TypeScript</strong> - Type-safe development</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span><strong>Tailwind CSS</strong> - Utility-first styling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span><strong>Vercel</strong> - Edge deployment platform</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span><strong>shadcn/ui</strong> - Beautiful UI components</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Open Source */}
        <div className="text-center bg-gradient-to-br from-primary/10 to-crimson/10 rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Open Source</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            SupaViewer is proudly open source. Check out our code, contribute, or build your own
            version on GitHub.
          </p>
          <a
            href="https://github.com/warriorsushi/supaviewer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
