# Contributing to Supaviewer

Thanks for your interest in contributing. This guide covers everything you need to get started.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 10+
- A [Supabase](https://supabase.com) project (free tier works)

### Local Setup

```bash
git clone https://github.com/WarriorSushi/supaviewer.git
cd supaviewer
pnpm install
cp .env.example .env.local
# Fill in your Supabase credentials
pnpm dev
```

### Running Tests

```bash
pnpm lint          # ESLint
pnpm build         # Type check + production build
pnpm test:e2e      # Playwright E2E tests
```

## Code Style

- **TypeScript** — Strict mode. No `any` unless absolutely necessary.
- **React** — Server Components by default. Client components only where state or browser APIs are needed.
- **Styling** — Tailwind CSS utilities + custom `sv-*` classes in `globals.css`. OKLCH colors only.
- **Formatting** — Let your editor handle it. No Prettier config — keep it simple.

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add replay interest tracking
fix: handle missing creator in film detail
chore: update Supabase client to v2.98
docs: add architecture section to README
refactor: simplify watch event status logic
```

Keep messages short and descriptive. Focus on *why*, not *what* — the diff shows the what.

## Pull Requests

1. **Fork and branch** — Create a feature branch from `main`.
2. **Keep it focused** — One logical change per PR. Small PRs get reviewed faster.
3. **Test your changes** — Run `pnpm build` at minimum. Run `pnpm test:e2e` if you touched any pages.
4. **Fill out the template** — The PR template asks for a summary, type of change, and testing notes.
5. **Be patient** — Maintainers review PRs on their own schedule.

## Issues

- **Bug reports** — Use the bug report template. Include reproduction steps.
- **Feature requests** — Use the feature request template. Explain the problem before proposing a solution.
- **Questions** — Use [Discussions](https://github.com/WarriorSushi/supaviewer/discussions) instead of issues.

## Project Conventions

- Pages fetch data with server-side functions from `lib/`. No client-side fetching for initial page loads.
- Supabase queries throw on error — callers handle with try/catch or `.catch()`.
- Components use `sv-*` CSS classes for brand styling, Tailwind for layout and spacing.
- The design system is documented in `.impeccable.md` — reference it for colors, typography, and spacing decisions.

## Not Sure Where to Start?

Look for issues labeled [`good-first-issue`](https://github.com/WarriorSushi/supaviewer/labels/good-first-issue) or [`help-wanted`](https://github.com/WarriorSushi/supaviewer/labels/help-wanted).
