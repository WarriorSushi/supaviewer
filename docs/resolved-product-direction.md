# Resolved Product Direction

This document converts the answered discovery questions into concrete decisions for the first version of Supaviewer.

## What We Now Know

- first users: both creators and viewers
- initial wedge: cinematic AI work with emphasis on longer-form viewing
- target ambition: mass market
- accepted content: fully AI-generated only
- YouTube only in v1
- accounts and profiles in v1
- likes, saves, follows, and comments in v1
- Vimeo and direct uploads later

## Core Tension

You want both:

- premium feel
- mass-market scale

That is possible, but not by making the product behave like an open dumping ground.

The correct approach is:

**premium presentation, mass-market accessibility**

Meaning:

- easy to browse
- easy to submit
- easy to understand
- but still curated and structured

## Strategic Position

Supaviewer should launch as:

**A fast, mobile-first discovery platform for AI-native cinema, starting with YouTube-hosted content.**

This is better than "YouTube for AI videos" because it gives you a reason to exist even before you host videos yourself.

## Serial Number System

Every accepted video should receive a platform-wide public serial number starting from `1`.

Example display:

- `#1 The Last Light`
- `#248 Neon Cathedral`

This serial should be:

- unique
- sequential
- visible in cards and watch pages
- searchable directly
- shareable as part of the video's identity

### Why This Helps

- gives early creators status for being early
- makes the catalog feel finite and collectible
- creates simple social language like "I got #42"
- makes discovery and recall easier than long titles

### Important Constraint

This only works as a moat if serial numbers are public, permanent, and prestigious.

Do not renumber later.

Do not recycle deleted numbers.

If a video is removed, keep the serial reserved.

## Resolved Answers For The Open Questions

## Homepage Model

The homepage should be **hybrid**:

- editorial hero at the top
- algorithmic ranking inside sections
- manual overrides for featured placements

Why:

- pure editorial does not scale
- pure algorithmic becomes junk fast
- hybrid gives you quality control plus momentum

### Homepage Structure

1. Hero premiere
2. Featured films
3. New and notable
4. Director spotlights
5. Collections
6. Browse by genre or mood
7. Recently submitted

Add serial numbers visibly in all video cards, but keep them visually secondary to the title and thumbnail.

### Ranking Inputs For v1

- recent views on Supaviewer
- saves
- likes
- completion proxy if measurable
- submission recency
- staff feature boost
- creator trust score

Do not build a deep recommendation system yet.

## Featured Logic

A video becomes featured when it scores well on quality and fit, not just traffic.

Featured criteria:

- strong thumbnail
- clear AI-native identity
- good title and metadata
- high early engagement
- no trust flags
- fits a homepage or collection theme

Add a manual `featured_weight` field in admin so you can control placement without code changes.

## Collections

Collections should exist in three modes:

1. Staff collections
2. Creator collections
3. Saved personal watchlists

Do not open public community collections on day one. That adds moderation load without proving value first.

## Submission Flow

Submission should happen through:

- a lightweight modal or page for first submission
- a creator dashboard for later management

Reason:

- a form is faster for onboarding
- a dashboard is better once creators have multiple videos

### Submission Fields For v1

Required:

- YouTube URL
- title
- short description
- creator display name
- thumbnail source or imported YouTube thumbnail
- format
- duration
- primary genre
- tools used
- AI-generated confirmation checkbox
- rights confirmation checkbox

Optional:

- tags
- model version
- soundtrack notes
- prompt or workflow notes
- behind-the-scenes text

Auto-ingest where possible:

- video title
- thumbnail
- duration
- channel metadata

Allow manual correction because YouTube metadata will often be weak.

Serial numbers should be assigned only after a submission becomes an accepted video record.

Use separate internal states:

- submission received
- accepted and assigned serial
- hidden or removed

## Moderation Model

Do **not** make every submission fully public immediately without checks.

YouTube being public is not a sufficient legal or trust filter.

Safer v1 model:

- submissions publish immediately into a low-trust pool
- only trusted and high-performing items can reach featured surfaces
- all content has report actions
- admin can unlist, hide, or remove quickly

This keeps submission friction low while still protecting the brand.

### Moderation Rules For v1

- ban non-AI videos
- ban impersonation and likeness abuse
- ban obvious copyright misuse when reported or detected
- ban illegal sexual or violent material
- ban misleading metadata

You should also add:

- report content
- report creator
- rights complaint form
- takedown email and policy page

## Trust And Safety Position

You said you want to stay safe legally. That means v1 needs explicit policy, not just intuition.

Minimum trust stack:

- Terms of Service
- Content Policy
- Copyright / takedown process
- AI disclosure statement
- reporting flow
- admin review queue

Later, you can add stronger provenance support using standards like C2PA.

## Brand Direction

You want both film culture and creator economy. The right blend is:

**cinematic credibility with creator energy**

Brand personality:

- modern
- sharp
- ambitious
- tasteful
- accessible
- not elitist

The first 10-second feeling should be:

**"This is where the best AI-native AI films live, and I want to settle in and watch."**

## Product Scope For v1

Public:

- home
- films
- search
- video detail/watch page
- creator profiles
- collections

User account:

- sign up and sign in
- follow creators
- like videos
- save videos
- comment
- submit links
- manage creator profile

Admin:

- review queue
- feature controls
- taxonomy management
- reports
- soft delete and hide actions

## Metadata Schema For v1

Every video should support:

- serial_number
- internal id
- external provider
- external video id
- canonical watch URL
- embed URL
- title
- description
- creator id
- source channel name
- thumbnail URL
- duration
- published at
- submitted at
- content status
- visibility status
- featured weight
- format
- genre
- mood
- tools used
- model names
- tags
- ai_generation_type
- language
- nsfw flag
- rights declaration
- provenance status

Constraints:

- `serial_number` must be unique
- `serial_number` must be indexed
- users must be able to search exact serial values like `42` or `#42`
- serial remains attached to the video permanently

## UX Direction

You want premium and snappy. That means:

- mobile-first architecture
- instant-feeling interactions
- strong visual hierarchy
- cinematic imagery
- very deliberate typography
- low-clutter navigation

The experience should bias toward:

- immersive watch pages
- landscape-first presentation
- longer descriptions and credits
- less clutter, fewer novelty surfaces

The serial number should be part of the brand language.

UI rule:

- always show it before the title
- keep it compact and crisp
- make it tappable from the watch page if you want future collectible behavior

Recommended top-level nav:

- Home
- Films
- Collections
- Creators
- Submit

On mobile, use a bottom navigation plus a strong floating search entry point.

## Technical Recommendation

Use:

- Next.js
- TypeScript
- Supabase
- Tailwind
- shadcn/ui only as a primitive layer, not a visual identity
- YouTube embeds with lazy loading

Prioritize:

- server-rendered content pages
- aggressive image optimization
- skeleton states
- optimistic actions for likes, saves, follows

## The Correct Next Build Sequence

1. Write MVP PRD
2. Write information architecture
3. Write design direction brief
4. Design core screens
5. Scaffold app
6. Build database schema and auth
7. Build browsing and watch flows
8. Build submission and moderation

## Hard Truth

If the product allows too much junk too early, you will train users to think the brand is low quality.

So even for a mass-market product, the homepage must feel curated from day one.
