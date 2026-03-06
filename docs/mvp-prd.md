# MVP PRD

## Product Goal

Launch the first usable version of Supaviewer as a YouTube-backed AI-cinema discovery and viewing platform with strong browsing, creator profiles, submission, and curation.

## Primary User Types

### Viewer

Wants to:

- discover high-quality AI films quickly
- browse by genre, style, and creator
- save and follow things worth revisiting

### Creator

Wants to:

- submit work easily
- build identity and audience
- get surfaced through curation and discovery

## Product Principles

- fast on mobile first
- premium look without feeling exclusive
- low-friction submissions
- curation over chaos
- trust and safety built in
- optimized for immersive watching over short-form swiping

## In Scope

- public home feed
- films page with filters
- video watch page
- creator profiles
- user auth
- like, save, follow, comment
- creator submissions by YouTube link
- staff collections
- basic creator collections
- admin moderation and featuring
- visible serial number per accepted video
- exact serial-number search

## Out Of Scope

- direct video upload
- Vimeo support
- advanced recommendation engine
- ad system
- creator monetization
- public community collections
- native mobile app
- short-form vertical feed

## Key User Flows

### Browse And Watch

1. User lands on home page
2. Sees featured films and editorial collections with visible serial IDs
3. Opens a video detail page
4. Watches through embedded YouTube player
5. Likes, saves, comments, or follows creator

### Submit Content

1. Creator signs in
2. Opens submit page
3. Pastes YouTube link
4. Reviews auto-imported metadata
5. Adds structured metadata
6. Accepts AI and rights confirmations
7. Submits
8. If accepted, the platform assigns the next public serial number

### Moderate Content

1. Admin opens queue
2. Reviews reported or new content
3. Adjusts visibility or featured state
4. Removes violating content if needed

## Functional Requirements

### Home

- featured hero
- featured films row
- new and notable row
- director spotlights row
- curated collections row
- visible serial number on every video card

### Films

- search by title, creator, tag
- search by serial number
- filter by genre
- filter by format
- filter by tool
- filter by duration
- sort by featured, recent, runtime, discussed

### Video Page

- embedded player
- visible serial number beside title
- metadata panel
- credits panel
- creator card
- actions: like, save, comment, share
- related videos

### Creator Profiles

- avatar
- bio
- links
- videos grid
- follower count
- collections

### Submission

- URL validation
- metadata form
- rights confirmation
- AI-generated confirmation
- serial assigned after acceptance

### Admin

- review queue
- report queue
- visibility controls
- featuring controls
- taxonomy editing

## Success Metrics

For initial validation:

- percentage of searches using serial number
- percentage of shares referencing serial number
- submission conversion rate
- returning viewers
- saves per active user
- follows per creator
- weekly videos watched
- share rate
- percentage of homepage clicks on featured surfaces

## Risks

- low-quality spam submissions
- rights complaints
- weak metadata
- not enough reason to visit versus YouTube directly

## Mitigations

- hybrid curation
- structured taxonomy
- creator profiles
- collections
- trust/reporting workflow
- fast watch experience
- permanent public serial identity for each accepted video
