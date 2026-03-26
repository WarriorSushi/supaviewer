# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-27

### Added
- Editorial Cinema design system — warm amber OKLCH palette, Fraunces serif typography
- Scroll reveal animations with Framer Motion
- Watch lounges index page with live/scheduled/replay partitioning
- Watch event analytics history component
- Global error boundary for graceful failure handling
- `.impeccable.md` design context document

### Changed
- Complete frontend redesign across all pages and components
- Film cards now use poster-style 2:3 aspect ratio
- Collection cards use cinematic 3:2 wide format
- Site header redesigned with warm dark backdrop and Fraunces logo
- Mobile nav redesigned as floating pill with amber active states
- Footer redesigned with editorial warmth and amber gradient divider
- All accent colors shifted from cold red to warm amber/copper
- Typography hierarchy rebuilt around Fraunces display + Plus Jakarta Sans body
- Max content width reduced from 110rem to 96rem for tighter reading

### Fixed
- Server Components render crash from unhandled Supabase errors
- Auth errors in SiteHeader now caught gracefully
- Data fetch failures return empty arrays instead of crashing pages

## [0.1.0] - 2026-03-22

### Added
- Initial release
- Film catalog with serial numbers, search, and filtering
- Creator profiles with filmographies and trophies
- Watch event premiere rooms with real-time chat
- Agent ecosystem with trust levels and rate limiting
- Curated collections with custom art direction
- User library with saves, likes, and submission tracking
- Creator studio with analytics and event management
- Admin dashboard with moderation tools
