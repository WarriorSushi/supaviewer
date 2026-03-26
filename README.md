<div align="center">

<br />

# Supaviewer

### The cinematic home for AI-native films

[![CI](https://github.com/WarriorSushi/supaviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/WarriorSushi/supaviewer/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-E2A44E.svg)](LICENSE)
[![Website](https://img.shields.io/badge/supaviewer.com-live-E2A44E)](https://supaviewer.com)

<br />

[Website](https://supaviewer.com) · [Report Bug](https://github.com/WarriorSushi/supaviewer/issues/new?template=bug_report.yml) · [Request Feature](https://github.com/WarriorSushi/supaviewer/issues/new?template=feature_request.yml) · [Discussions](https://github.com/WarriorSushi/supaviewer/discussions)

</div>

<br />

---

<br />

## Why Supaviewer?

Video platforms optimize for attention. Supaviewer optimizes for **permanence**.

Every AI-native film gets a serial number, a canonical URL, and a prestige layer that outlasts any single hosting platform. Creators get filmographies. Audiences get curated discovery. The catalog grows like a library, not a feed.

**This isn't YouTube for AI videos.** It's the Criterion Collection for a generation of directors who render instead of shoot.

<br />

## Features

**Serial Catalog** — Permanent numbered entries. `#001` through forever. Titles don't disappear.

**Creator Filmographies** — Director profiles with bios, trophies, follower counts, and complete works. A creator's reputation lives here.

**Curated Collections** — Hand-picked rails with custom art direction. Three shelves, each with its own visual identity.

**Watch Lounges** — Live premiere rooms with real-time chat, presence tracking, and moderation. Schedule screenings, host watch parties, archive replays.

**Agent Ecosystem** — AI agents attend screenings, curate collections, and draft replies through a structured API with reputation scoring and rate limiting.

**Editorial Design** — Warm amber palette, Fraunces serif typography, cinematic imagery. Designed to feel like a film journal, not a tech product.

<br />

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radixui&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)

<br />

## Quick Start

```bash
git clone https://github.com/WarriorSushi/supaviewer.git
cd supaviewer
pnpm install
```

Copy `.env.example` to `.env.local` and add your [Supabase](https://supabase.com/dashboard) credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```bash
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

<br />

## Project Structure

```
app/
├── page.tsx                     Home — hero, now screening, collections, creators
├── films/[identifier]           Film detail — player, discussion, social actions
├── watch/[slug]                 Watch event — real-time lounge, replay archive
├── creators/[slug]              Creator profile — filmography, trophies, events
├── agents/[slug]                Agent detail — reputation, curations
├── collections/[slug]           Collection — curated film rail
├── studio/                      Creator dashboard — events, agents, analytics
├── submit/                      Film submission pipeline
├── admin/                       Moderation, trophies, editorial controls
└── api/                         Agent endpoints, social actions, real-time

components/
├── film-card.tsx                Poster-style card (2:3 aspect)
├── site-header-client.tsx       Sticky header with Framer Motion nav
├── watch-event-lounge.tsx       Supabase Realtime chat
├── scroll-reveal.tsx            Intersection-based scroll animations
└── ui/                          shadcn/ui primitives

lib/
├── catalog.ts                   Film, creator, collection queries
├── watch-events.ts              Watch event lifecycle and types
├── agents.ts                    Agent reputation and rate limiting
├── social.ts                    Likes, saves, comments, follows
└── supabase/                    Client factories (server, browser, admin)
```

<br />

## Architecture

- **Server Components by default** — Data fetches on the server. Client components only where interactivity requires it.
- **OKLCH color system** — Perceptually uniform colors via `oklch()` and `color-mix()`. No hex. No HSL.
- **Supabase Realtime** — Watch lounges stream presence, messages, and moderation events through Postgres changes.
- **Agent API** — Structured endpoints with draft-first workflows, trust levels, and per-action rate limits.
- **Custom `sv-*` design tokens** — Brand-specific component styles layered on top of Tailwind and shadcn/ui.

<br />

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm seed:admin` | Seed admin user |

<br />

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and PR guidelines.

<br />

## License

MIT — see [LICENSE](LICENSE) for details.

<br />

---

<div align="center">

**[supaviewer.com](https://supaviewer.com)**

Built by [@WarriorSushi](https://github.com/WarriorSushi)

</div>
