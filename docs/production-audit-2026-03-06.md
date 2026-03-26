# Supaviewer Production Audit

Date: 2026-03-06
Workspace: `C:\coding\supaviewer`
Status: Not production ready

## Progress Update

Completed after this audit:

- Exposed credentials were removed from the login UI.
- Playwright auth credentials were moved to env vars.
- Auth `next` handling was constrained to safe internal paths.
- Collection cards now link to real collection routes.
- Collection detail pages were added.
- Save/comment counters are now synchronized through DB triggers.
- Film view tracking now uses a DB-backed RPC and a real watch-page tracker.
- Submission flow now validates YouTube URLs, canonicalizes them, checks embed availability, and rejects duplicate source videos.
- Admin comment deletion now revalidates the real film route instead of a broken serial-only path.
- Admin actions now write moderation activity to `moderation_cases`, and the admin panel shows recent moderation history.
- Public metadata now covers the homepage, films, creators, creator detail, collections, plus `sitemap.xml` and `robots.txt`.
- JSON-LD structured data now exists on key public pages.
- E2E coverage now includes public collections/creators plus an authenticated duplicate-submission regression test.
- Admin moderation now accepts operator notes for rejections and deletions, and activity review has basic filters.
- Catalog search/filtering on `/films` now pushes filtering and sorting into SQL instead of loading the full catalog into memory.
- Admin moderation queues now have pagination and confirmation on destructive actions.
- Admin moderation now has bulk actions for submissions and comment removal.
- Internal/authenticated routes now explicitly opt out of search indexing.
- Founder badge definitions now exist in Supabase and surface across creator pages, film pages, cards, and studio.
- Trophy definitions and assignment infrastructure now exist, with live signal trophies plus admin-managed editorial trophies.
- Film and creator routes now generate Supaviewer-native share cards through dynamic OG image routes.
- Creator pages and studio now expose status-heavy brag surfaces and canonical URL messaging.
- An initial public agent lobby and hosted `/agents/connect.md` plus `/agents/auth.md` docs are now live.
- Agent identity records, hashed bearer credentials, draft-submission API, agent replies, and separate agent reaction signals now exist.
- Agent drafts can now be promoted by the human owner into the real moderation queue from authenticated creator surfaces.
- Creator studio now exposes saves, discussion, share tracking, and collection-placement analytics.
- Admin rejection flows now store structured creator-facing reasons and feedback.
- Watch pages now avoid dropping users straight into a broken YouTube frame by default, and keep a canonical source fallback visible.
- Public agent curator rails now exist and re-use the canonical collection system instead of a separate discovery layer.
- Admin now has first-pass agent trust, status, official-companion, and curator-rail controls.
- Agent reputation summaries, first-action review gates, and per-action rate limits now exist for public agent replies and reactions.
- Homepage collection rails now render real preview media and collection routes have richer editorial context instead of sparse shells.
- The catalog now includes additional embeddable long-form AI-native YouTube titles and richer collection membership.
- A first watch-lounge foundation now exists with scheduled `/watch/[slug]` rooms, creator-side launch-party scheduling, split human/agent rails, and Supabase realtime attendee/message flow.
- Watch lounges now have host lifecycle controls, room moderation, replay-interest capture, and event analytics for attendance, message volume, and share performance.
- Watch rooms now generate dedicated share cards, and authenticated e2e coverage includes scheduling and joining a lounge.
- Watch lounges now preserve replay markers, analytics-history snapshots, visible moderator history, and a public `/watch` index for live rooms plus replay archives.

Still outstanding before public launch:

- The admin password still needs to be rotated out-of-band.
- Internal operator surfaces are improved, but a full shared-token cleanup is still not complete across every authenticated page.
- Moderation depth is improved, but still lacks a richer case workflow.
- Catalog/search scaling is improved for `/films`, but pagination and deeper indexed search strategy are still missing.
- Metadata, sitemap, structured data, and broader SEO coverage are still incomplete.
- E2E coverage is better, but still thin outside smoke plus the new authenticated lounge path.
- Agent identity, scoped auth, creator-facing submission feedback, trust tooling, and first-pass reputation controls are now in place, but broader moderation workflow depth is still not finished.
- Watch lounges are now materially more complete, but room-scale moderation policy, richer replay curation tooling, and longer-term analytics/reporting still need deeper iteration.

## Scope

This audit covered:

- Public routes: `/`, `/films`, `/films/[identifier]`, `/creators`, `/creators/[slug]`
- Auth/account routes: `/login`, `/library`, `/studio`, `/submit`
- Admin route: `/admin`
- Shared UI shell, search, cards, metadata, and Supabase-backed actions
- Database schema/migrations and current product wiring

Verification run during this audit:

- `pnpm lint`
- `pnpm build`
- `pnpm test:e2e`

These pass, but the app still has multiple launch blockers and several incomplete product surfaces.

## Executive Summary

The product already has a strong foundation:

- real Supabase auth
- real serial-numbered catalog
- real submissions and admin approval
- saved/liked library
- creator claims and creator studio
- shareable film routes

But it is still not ready for a real public launch. The biggest gaps are not "more features"; they are production integrity issues:

- exposed admin credentials in the login UI and test suite
- unsafe redirect handling in auth
- stale engagement counters that do not reflect actual likes/saves/comments/views
- homepage collection rail that is low-contrast and not functional
- incomplete route model for collections
- inconsistent theme implementation on internal surfaces
- weak submission validation and duplicate protection
- thin test coverage for critical flows

## Launch Blockers

### P0. Admin credentials are exposed in the product UI and test code

Status: Mostly fixed. Credentials were removed from the UI and test code, but the live admin password still needs rotation.

Why it matters:

- The login page currently shows the real admin email/password and pre-fills them.
- The Playwright suite also hardcodes the same admin credentials.
- This is an immediate production security blocker.

Where:

- `app/login/page.tsx`
- `tests/authenticated-studio.spec.ts`

Required fix:

- Remove all hardcoded credentials from the UI.
- Remove prefilled admin defaults.
- Move test credentials to test-only env vars.
- Rotate the current admin password after removal.

### P0. Auth `next` handling is not constrained to internal paths

Status: Fixed.

Why it matters:

- `normalizeNextPath()` only trims input.
- A crafted `next` value could create an open redirect or navigation to unintended locations.

Where:

- `app/login/actions.ts`

Required fix:

- Only allow internal relative paths beginning with `/`.
- Reject protocol-relative URLs, absolute URLs, and malformed values.
- Centralize this as a safe redirect helper used across all auth flows.

### P0. Engagement metrics shown to users are not authoritative

Status: Fixed for saves, comments, and views. Like count is still relational only, but it is not currently exposed in the UI.

Why it matters:

- Likes/saves/comments actions write relational rows.
- The displayed `saves_count`, `discussion_count`, and `views_count` are denormalized fields on `films`.
- Those counters are not updated by the current like/save/comment flows.
- Result: cards and metadata can show incorrect counts, which is unacceptable for a public media product.

Where:

- `app/actions/social.ts`
- `lib/catalog.ts`
- `lib/viewer.ts`
- `lib/social.ts`
- `supabase/migrations/0001_initial_schema.sql`

Required fix:

- Add DB triggers or RPC-backed mutations to keep counts in sync.
- Add a real view-count strategy.
- Reconcile existing stale counts.

### P0. Homepage collections rail is visually broken and functionally empty

Status: Functionally fixed. Collection cards now navigate to real collection routes. Contrast was improved, but this area should still be reviewed during the next design pass.

Why it matters:

- The section the user flagged is real: collection cards use dark backgrounds with theme-colored text, which fails contrast in light mode.
- The cards are not links, so the section does not actually help navigation.
- There are no collection detail routes, so the "curated rails" concept is not fully implemented.

Where:

- `app/page.tsx`
- `components/collection-card.tsx`
- missing route: `app/collections/[slug]/page.tsx`

Required fix:

- Either remove the section or make it truly navigable.
- Add collection detail pages and click-through behavior.
- Fix light-mode contrast for collection surfaces.

### P0. Login experience is still configured like an internal test harness

Status: Fixed.

Why it matters:

- The login page copy explicitly talks about "fast local testing".
- That is not acceptable product copy for a production auth surface.
- Combined with exposed credentials, it reads like a staging app.

Where:

- `app/login/page.tsx`

Required fix:

- Rewrite the auth surface as real product auth copy.
- Remove all staging/testing hints from the user-facing experience.

## High Priority Product Gaps

### P1. Collections are incomplete as a product concept

Status: Partially fixed. Collection routing now exists, but deeper editorial ownership and richer collection storytelling are still missing.

Current state:

- Collections appear on the homepage.
- There is no collection page, no collection browse route, no shelf ownership model, and no editorial context beyond title + description.

Impact:

- A prominent homepage module currently dead-ends.

Required fix:

- Add `collections/[slug]` pages.
- Add collection pages to routing and search.
- Add editorial fields if collections are meant to be a core discovery surface.

### P1. Submission validation is too weak for a public platform

Status: Partially fixed. YouTube URL validation, canonical video IDs, duplicate blocking, and embed checks are now implemented. More advanced moderation heuristics and richer source validation are still missing.

Current state:

- Submission accepts any string as a YouTube URL.
- No duplicate URL detection.
- No duplicate title/source detection.
- No check that the source is actually embeddable.

Where:

- `app/submit/actions.ts`

Impact:

- High moderation noise.
- Duplicate films.
- Broken watch pages from invalid or non-embeddable URLs.

Required fix:

- Validate YouTube URLs structurally.
- Extract and store canonical video IDs.
- Reject duplicates or flag them for moderation.
- Test embed availability before acceptance.

### P1. Admin moderation lacks operational depth

Status: Partially fixed. Activity logging, reviewer notes, basic filters, pagination, confirmation UX, and bulk actions now exist, but a richer case workflow is still missing.

Current state:

- Approve/reject exists.
- Comment delete exists.
- Visibility changes exist.

Missing:

- audit trail
- moderation notes
- reviewer attribution
- pagination
- filters
- bulk actions
- confirmation UX for destructive actions
- case workflow tied to `moderation_cases`

Where:

- `app/admin/page.tsx`
- `app/admin/actions.ts`
- `supabase/migrations/0001_initial_schema.sql`

Impact:

- Admin tools are functional but not production-operator grade.

### P1. Internal surfaces still use one-off styling instead of the shared design system

Status: Partially fixed. `/admin` was moved much closer to the shared system, but the remaining authenticated surfaces still need a consistency pass.

Current state:

- Public surfaces are much more consistent now.
- Admin in particular still contains many hardcoded dark styles and custom one-off panel treatments.

Where:

- `app/admin/page.tsx`
- some remaining internal surface classes in `app/*`

Impact:

- Theme regressions and contrast bugs are more likely.
- UI is harder to maintain and polish.

Required fix:

- Move remaining internal pages onto shared `sv-*` tokens/components.
- Remove one-off hardcoded color stacks where possible.

### P1. Shareability is improved, but not complete

Status: Partially fixed. Public metadata coverage is broader now, and in-product share tracking now exists for creator and film status surfaces, but campaign attribution and richer OG tuning are still incomplete.

Current state:

- Film pages now have share metadata and a share button.

Missing:

- collection share routes
- creator share metadata tuning
- site-wide OG consistency
- campaign attribution / referral measurement

Where:

- `app/films/[identifier]/page.tsx`
- `app/layout.tsx`

Impact:

- Good start, but not yet a complete distribution loop.

## Medium Priority Gaps

### P2. Search and catalog filtering do not scale

Status: Partially fixed. `/films` now filters, sorts, and paginates in SQL, but a deeper indexed search strategy is still missing.

Current state:

- `filterFilms()` loads the full public catalog into memory and filters/sorts in app code.

Where:

- `lib/catalog.ts`

Impact:

- Fine for a tiny catalog.
- Poor for hundreds or thousands of titles.

Required fix:

- Push filtering/sorting/pagination into SQL.
- Add indexed search fields and cursor/page-based catalog loading.

### P2. Metadata/SEO coverage is incomplete

Status: Partially fixed. Public metadata, `sitemap.xml`, `robots.txt`, and baseline JSON-LD now exist, but deeper OG tuning still needs work.

Current state:

- Film pages have better metadata.
- Other major surfaces do not yet have rich metadata strategy.

Missing:

- homepage OG tune-up
- creator metadata
- collections metadata
- sitemap
- robots
- structured data / JSON-LD

Where:

- `app/layout.tsx`
- route metadata across `app/*`

### P2. Catalog enrichment is uneven

Status: Still open.

Current state:

- New films were added quickly to expand density.
- Many newer entries do not have full credits, richer provenance, or stronger editorial metadata.

Where:

- `lib/catalog.ts`
- current film seed strategy

Impact:

- Browse density improved, but detail depth is inconsistent.

### P2. Revalidation coverage is incomplete

Status: Partially fixed. Admin comment deletion and editorial updates now revalidate real film routes, but the broader revalidation model should still be audited after more admin work lands.

Examples:

- `deleteComment()` revalidates `/films/${filmSerial}`, but film routes are really `/films/${serial}-${slug}`.
- Some admin actions revalidate core browse routes but not all dependent surfaces.

Where:

- `app/admin/actions.ts`

Impact:

- Stale UI is possible after moderation actions.

### P2. Test coverage is still too thin for launch confidence

Status: Partially fixed. Public browse coverage is better and duplicate-submission coverage exists, but authenticated flows are still env-gated and moderation edge cases still need direct e2e coverage.

Current state:

- Three smoke tests pass.

Missing:

- collection flow
- admin moderation details
- approval -> publish -> browse verification
- theme regression checks
- mobile navigation/header checks
- share flow
- invalid submission validation
- magic link auth loop

Where:

- `tests/*`

## Lower Priority / Product Depth

### P3. Missing collection browsing and editorial storytelling

Collections could become a differentiator, but right now they are not.

### P3. No watch history / continue watching

For a long-form video product, this becomes important quickly.

### P3. No notifications / creator-facing status updates

Submission and claim workflows would benefit from system feedback beyond page refresh state.

### P3. Share and referral instrumentation is still partial

If Supaviewer is intended to grow through shared links, you need visibility into:

- which film pages are shared
- which sources convert
- which collections drive return visits

## What Currently Works

These are not blockers:

- password auth and magic link auth
- admin bootstrap + admin role gating
- serial-numbered film routing
- saved and liked library flow
- creator claims and creator studio basics
- submission persistence
- admin approval pipeline
- film share button and film-level metadata
- larger seeded film catalog
- lint/build/e2e smoke pass

## Recommended Implementation Order

1. Remove exposed credentials and rotate admin secret
2. Fix auth redirect safety
3. Fix engagement counters and view tracking at the DB layer
4. Decide whether to remove or fully implement collections
5. Make collection cards/routes functional and high-contrast
6. Strengthen submission validation and dedupe
7. Refactor remaining internal surfaces onto shared tokens
8. Improve admin moderation depth
9. Expand metadata/sitemap/SEO coverage
10. Expand test coverage around real production flows

## Suggested Definition Of "Production Ready"

Before calling this ready for public launch, the following should be true:

- no exposed credentials or test-only UI
- no unsafe redirects
- all displayed counts are accurate
- all homepage modules are functional navigation, not decorative dead ends
- theme consistency across all routes
- validated and deduplicated submissions
- admin operations have safe moderation controls
- route metadata and share previews are complete
- critical flows are covered by meaningful e2e tests
