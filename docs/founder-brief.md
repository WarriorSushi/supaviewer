# Supaviewer Founder Brief

## The Core Bet

AI-generated video is not a niche format. It is becoming a new content category with its own creator workflows, aesthetics, tools, and audiences.

The opportunity is not just "YouTube for AI videos." That framing is too broad and puts you in direct competition with large platforms that already own storage, feeds, and distribution.

The better first position is:

**The best place to discover, organize, and watch high-quality AI-native cinema.**

That gives you a sharper edge:

- curated, not just uploaded
- creator-first, not algorithm-slop-first
- quality and provenance aware
- optimized for AI-native formats, not retrofitted from traditional video platforms

## What To Build First

Do not start with direct video hosting.

Start with a link-based platform that:

- lets creators submit YouTube links
- ingests metadata and thumbnails
- plays via YouTube embed
- adds your own curation, taxonomy, collections, profiles, and discovery layers
- tracks engagement on your platform

This keeps infrastructure light while you validate demand, retention, and content shape.

## The MVP

The first version should do a small number of things extremely well:

1. Home feed
2. Category browsing
3. Search and filtering
4. Creator profiles
5. Collections
6. Submission flow for creators
7. Admin curation and moderation tools

### Home Feed

The home feed should not be an endless generic grid.

It should feel editorial and premium:

- featured premiere
- featured films
- new and notable
- director spotlights
- premieres
- episodic AI series
- award-worthy experiments

### Filters That Matter

This is where you can beat generic video platforms.

Useful metadata:

- tool used: Sora, Veo, Runway, Pika, Kling, etc.
- format: feature film, short film, episode, trailer, proof-of-concept
- duration
- style: photoreal, anime, claymation, abstract, retro, horror
- creation method: fully generated, hybrid, edited live footage, AI-assisted
- sound type: AI voice, human voice, no dialogue
- provenance status: self-declared, verified metadata, unknown

## Your Positioning

You should avoid becoming "the biggest pile of AI slop."

That is the default failure mode in this category.

The stronger positioning is:

**Not the biggest library. The most watchable AI-cinema library.**

This means:

- high-signal curation
- strong taste
- clear creator identity
- clean provenance language
- fewer but better surfaced videos

## Where Others Are

The current landscape is fragmented:

- creator tools are building feeds around generation
- film festivals are showcasing the best long-form work
- creator communities exist, but discovery is scattered
- large consumer platforms still do not treat AI-native video as a first-class category

That leaves room for a focused discovery and curation product.

## How To Place Yourself

Do not market the product as only "AI-generated videos."

Market it as:

- the home for AI-native cinema
- a discovery platform for the next generation of creators
- a curated network for AI filmmakers

That language is more premium and less disposable.

## Future-Proofing

Build the data model now so you can change infrastructure later without a rewrite.

Your internal `videos` entity should support:

- external provider today: YouTube
- direct uploads later
- multi-source playback later
- provenance fields later
- rights and licensing fields later
- model and workflow metadata now

Recommended content model:

- `video`
- `creator`
- `source_asset`
- `collection`
- `tag`
- `tool`
- `submission`
- `moderation_case`
- `provenance_record`

## Technical Direction

For a fast web MVP:

- Next.js
- TypeScript
- Supabase for auth, Postgres, storage for lightweight assets only
- YouTube embeds for playback
- Tailwind plus a tightly controlled design token system
- Vercel for deployment

Keep the architecture simple:

- app layer
- content database
- ingest pipeline for YouTube metadata
- moderation/admin tools

Do not overbuild recommendations on day one. Start with editorial curation plus lightweight ranking signals.

## UX Direction

The product should feel closer to:

- MUBI for taste
- Letterboxd for identity and curation
- Netflix for premium immersion
- YouTube for accessibility

It should not feel like:

- a crypto marketplace
- a template SaaS dashboard
- a short-form swipe app
- an anime neon prompt dump

Design principles:

- mobile-first
- very fast perceived performance
- large visual cards with decisive hierarchy
- strong typography
- restrained motion
- instant hover and tap feedback
- no cluttered sidebars on mobile

## Micro-Interactions

Use motion to reinforce confidence, not decoration.

- cards lift quickly on hover
- tap states respond in under 100ms
- filters slide in without layout jank
- embeds load behind a thumbnail shell
- save, like, and follow states confirm instantly
- skeleton loading should match final layout closely

## The Procedure From Here

Yes, research first, but not for too long.

The correct sequence is:

1. Write the product thesis
2. Define target users
3. Map adjacent competitors
4. Lock MVP scope
5. Define the information architecture
6. Define the design system direction
7. Build a clickable prototype
8. Test with creators and viewers
9. Build the MVP

## Recommended Working Rhythm

Use markdown docs first. They reduce drift and make decisions explicit.

You need three documents before serious UI work:

- product brief
- MVP PRD
- design direction brief

Then move into:

- wireframes
- high-fidelity UI
- implementation

## Immediate Next Step

The next useful step is not coding the final product.

It is to decide:

- who the first users are
- what content quality bar you want
- how curation works
- what the first screen should optimize for

If you get those wrong, the visual polish will not save the product.
