# Design System - Cinema Bold

## Design Philosophy

SupaViewer's design should feel like a prestigious film festival website meets modern streaming platform. We treat AI video as art, not novelty. The design should be bold but not overwhelming, sophisticated but not pretentious, cinematic but not theatrical.

**Core Principles**:
- **Content First**: Video thumbnails and content are the hero
- **Bold but Breathable**: Strong colors with generous whitespace
- **Cinematic Feel**: Film festival aesthetic, not tech startup
- **Fast & Snappy**: Smooth animations, instant feedback
- **Accessible**: WCAG 2.1 AA compliance minimum

### YouTube-Inspired Card Design Ideology

We follow YouTube's proven visual principles for video card design:

| Principle | What it means | Why it matters |
|-----------|---------------|----------------|
| **Visual Hierarchy** | Thumbnail (primary) → Title (secondary) → Meta (tertiary) | Guides user's eye naturally |
| **Contrast over Color** | Subtle contrast steps, not harsh whites | Prevents eye strain in dark mode |
| **Neutral Container, Bright Content** | Card background neutral; thumbnails carry visual "pop" | Keeps feed consistent and scannable |
| **Density Balance** | Thumbnail ≈ 80% of card height; text ≈ 20% | Feels clean and professional |
| **Micro-typography** | Each text layer has distinct font weight, opacity, spacing | Enhances legibility and hierarchy |

**Key Measurements:**
- Card width: 320-360px (sweet spot for 4-5 per row on desktop)
- Thumbnail: 100% width, 16:9 aspect ratio, rounded corners 0.75rem
- Text area: 60-70px height, padding 1rem
- Hover: Subtle lift (-3px translateY) + soft shadow

**Typography Hierarchy** (Researched from actual YouTube):
- **Title**: 14px (0.875rem), weight 500, color white `#ffffff`, max 2 lines, leading-tight
- **Creator**: 12px (0.75rem), weight 400 (normal), color `rgb(96,96,96)` light / `#aaaaaa` dark
- **Meta**: 12px (0.75rem), weight 400 (normal), same gray as creator, dot separators (•)

**Philosophy Recap:**
- **Depth**: Subtle elevation and shadow, not contrast explosions
- **Rhythm**: Consistent padding (1rem inner, 1.5rem outer)
- **Information balance**: Maximum 3 visual hierarchies per card

## Color Palette - Cinema Bold

### HSL-Based Color System

All colors use HSL (Hue, Saturation, Lightness) format for dynamic theming capabilities. The system allows for easy theme variations by adjusting hue values programmatically.

### Primary Brand Colors

**Deep Crimson** - `hsl(0, 72%, 51%)` / `#DC2626`
- Primary brand color
- Use for: Primary buttons, links, active states, brand elements
- Represents: Passion, cinema, prestige
- Accessibility: Ensure sufficient contrast on dark backgrounds

**Warm Amber** - `hsl(38, 92%, 50%)` / `#F59E0B`
- Secondary brand color
- Use for: Secondary actions, highlights, ratings stars, success states
- Represents: Quality, awards, excellence
- Pairs beautifully with crimson

### Gradient System

**Crimson Gradient** - `.text-gradient-crimson`
```css
background: linear-gradient(135deg, #b91c1c 0%, #DC2626 50%, #ef4444 100%);
```
- Dark red → Crimson → Bright red
- 135° angle for consistent flow

**Amber Gradient** - `.text-gradient-amber`
```css
background: linear-gradient(135deg, #d97706 0%, #F59E0B 50%, #fbbf24 100%);
```
- Dark amber → Amber → Light amber
- Warm, golden feel

**Cinema Gradient** - `.text-gradient-cinema` ✨
```css
background: linear-gradient(135deg, #d4a017 0%, #ffe63a 50%, #f7b731 100%);
```
- Bronze gold → Bright yellow → Honey gold
- Premium, luxurious spectrum
- Use for: Logo, hero headings, brand moments

### Background Colors (Dark Theme)

**Deep Slate Navy** - `hsl(215, 29%, 8%)` / `#0E141B`
- Main background color (`--background`)
- Use for: Page backgrounds, empty areas
- Creates depth and sophistication
- Note: YouTube uses `#181818`, we use slightly darker for more drama

**Gentle Card Surface** - `hsl(217, 24%, 14%)` / `#1B2533`
- Surface color (`--card`, `--muted`)
- Use for: Cards, modals, elevated surfaces
- Gentle contrast from background
- Note: YouTube uses `#212121`, ours is similar lightness

**Clean Borders** - `hsl(215, 20%, 22%)` / `#2A3443`
- Border color (`--border`, `--input`)
- Use for: Card borders, separators, subtle divisions
- Thin, clean lines

**Professional Blue** - `hsl(217, 91%, 60%)` / `#3B82F6`
- Accent color (`--accent`)
- Use for: Interactive elements, hover states
- Professional yet energetic

### Text Colors

**Primary Text** - `hsl(240, 5%, 98%)` / `#F9FAFB` or `#FFFFFF`
- Primary text color (`--foreground`)
- Use for: Video titles, headings, important text
- Calm, high readability
- Note: YouTube uses pure white `#ffffff` for titles

**Secondary Text (YouTube-Researched)** - `rgb(96, 96, 96)` light / `#aaaaaa` dark
- Secondary text color for metadata
- Use for: Channel names, view counts, dates, timestamps
- Significantly muted from primary text (YouTube spec)
- Falls back to our `--muted-foreground` (`#94A3B8`) which is similar
- **Key**: This creates strong visual hierarchy vs white titles

### Semantic Colors

**Success Green** - `#10B981`
- Use for: Success messages, approved status
- Keep usage minimal

**Warning Amber** - `hsl(38, 92%, 50%)` (same as brand amber)
- Use for: Warnings, pending status
- Dual purpose with brand color

**Destructive** - `hsl(0, 63%, 31%)`
- Use for: Errors, rejected status, destructive actions
- Darker, more muted than primary crimson

**Professional Blue** - `hsl(217, 91%, 60%)` / `#3B82F6`
- Use for: Info messages, accent interactions
- Professional tech feel

### Theme Customization

The HSL-based system enables future theme variations:

**Current Theme: Cinema Bold (Deep Navy)**
- Base hue: 215° (cool slate)
- Creates professional, calm atmosphere
- Warm gradients provide contrast

**Potential Variations** (Future):
- **Warm Sunset**: Shift hue to 25° (warm browns)
- **Forest Night**: Shift hue to 160° (deep teals)
- **Royal Twilight**: Shift hue to 270° (deep purples)

Simply adjust the hue value in CSS variables to create new themes while maintaining contrast ratios and design consistency.

### Contrast Ratios & Color Layering

Following YouTube's "relative contrast" methodology, our dark theme uses subtle lightness differences rather than absolute brightness:

| Layer | HSL Lightness | Hex Value | Purpose |
|-------|---------------|-----------|---------|
| **Background** | 8% | #0E141B | True dark foundation (cinematic tone) |
| **Card** | 14% | #1B2533 | Visible depth separation |
| **Border** | 22% | #2A3443 | Edge definition |
| **Text Primary** | 98% | #F9FAFB | Headlines (never full white #FFF) |
| **Text Secondary** | 65% | #94A3B8 | Creator names, labels |
| **Text Muted** | 40% | (varies) | Metadata, timestamps |
| **Accent** | 45-60% | #3B82F6 | Interactive hover highlights |

**Key Principles:**
- Ideal contrast ratio for dark UI readability: **12:1** between primary text and background
- Never use full white (`#FFFFFF`) — aim for `hsl(210, 40%, 96%)`
- Maintain 6-8% lightness steps between adjacent layers for subtle depth
- Text hierarchy uses opacity variations (`/80`, `/60`, `/40`) for tertiary elements

## Typography

### Font Family

**Outfit** (Google Fonts)
- Single font family for consistency
- Modern, geometric, editorial feel
- Excellent readability at all sizes
- Professional without being corporate

Import weights needed:
- 400 (Regular) - Body text, descriptions
- 600 (SemiBold) - UI elements, secondary headings  
- 700 (Bold) - Primary headings, emphasis

### Type Scale

Base size: 16px (1rem)
Scale ratio: 1.25 (Major Third)

**Display** - 3.052rem (48.8px)
- Use for: Hero headings, major page titles
- Weight: 700 (Bold)
- Line height: 1.1

**H1** - 2.441rem (39px)
- Use for: Page titles
- Weight: 700 (Bold)
- Line height: 1.2

**H2** - 1.953rem (31.2px)
- Use for: Section headings
- Weight: 700 (Bold)
- Line height: 1.3

**H3** - 1.563rem (25px)
- Use for: Card titles, subsection headings
- Weight: 600 (SemiBold)
- Line height: 1.4

**H4** - 1.25rem (20px)
- Use for: Smaller headings, labels
- Weight: 600 (SemiBold)
- Line height: 1.5

**Body** - 1rem (16px)
- Use for: Paragraphs, most text
- Weight: 400 (Regular)
- Line height: 1.6

**Small** - 0.875rem (14px)
- Use for: Captions, metadata
- Weight: 400 (Regular)
- Line height: 1.5

**Tiny** - 0.75rem (12px)
- Use for: Fine print, timestamps
- Weight: 400 (Regular)
- Line height: 1.4

## Spacing System

Use Tailwind's spacing scale (4px base unit).

**Common Patterns**:
- Component padding: 16px (p-4) or 24px (p-6)
- Section spacing: 48px (space-y-12) or 64px (space-y-16)
- Card spacing: 20px (p-5)
- Tight spacing: 8px (gap-2)
- Generous spacing: 32px (gap-8)

**Grid Gaps**:
- Video grid: 24px (gap-6)
- Metadata items: 12px (gap-3)
- Form fields: 20px (space-y-5)

## Component Styling

### Cards

**Video Cards** (YouTube-Inspired):
- Background: `bg-card` (#1B2533) - Neutral container
- Border: None (clean, borderless like YouTube)
- Border radius: 12px (rounded-xl)
- Padding: 0 for thumbnail (full bleed), 16px (p-4) for text content
- Hover effects:
  - Subtle lift: `translateY(-3px)` (not -4px, gentler)
  - Shadow: `0 8px 20px hsl(var(--border) / 0.15)` (soft, diffused)
  - Thumbnail zoom: `scale(1.03)` (subtle, not jarring)
  - Gradient overlay: `opacity-0` to `opacity-100` on hover
- Transition: 250ms ease (smooth, not too fast)
- Thumbnail: 80% of card visual weight, 16:9 aspect ratio
- Text area: 20% of card, maximum 3 hierarchies

**YouTube-Style Micro-Details** (Accurate Specs):
- Duration overlay: `bg-black/60` bottom-right, `backdrop-blur-sm`
- Featured badge: Top-right, `bg-amber` with `text-background`
- Gradient overlay on hover: `from-black/30 via-transparent to-transparent`
- Title: 2-line clamp, `14px` (0.875rem), weight 500, white, hover to primary color
- Creator: `12px` (0.75rem), weight 400, `#606060` (light) / `#aaa` (dark)
- Meta: `12px` (0.75rem), weight 400, same gray, dot separators with minimal gap
- Padding: Reduced to `12px` (p-3) to match YouTube's compact spacing
- Line height: `20px` (leading-5) for title, normal for metadata

**Content Cards**:
- Background: `bg-card` (#1B2533)
- Border: 1px solid `border-border` (#2A3443)
- Border radius: 8px (rounded-lg)
- Padding: 24px (p-6)
- Shadow: Subtle (shadow-sm)

### Buttons

**Primary Button** (Crimson):
- Background: `bg-primary` (#DC2626)
- Text: `text-primary-foreground` (#F9FAFB)
- Padding: 12px 24px (px-6 py-3)
- Border radius: 8px (rounded-lg)
- Hover: Slightly lighter, subtle shadow
- Active: Slightly darker
- Font weight: 600 (SemiBold)

**Secondary Button** (Amber):
- Background: `bg-secondary` (#F59E0B)
- Text: `text-secondary-foreground` (dark)
- Same padding and radius as primary
- Hover: Slightly lighter

**Ghost Button**:
- Background: Transparent
- Border: 1px solid `border-border` (#2A3443)
- Text: `text-foreground` (#F9FAFB)
- Hover: Background becomes `bg-accent` (#3B82F6)

**Icon Button**:
- Square, 40px × 40px
- Crimson on hover
- Rounded: 8px

### Inputs & Forms

**Text Input**:
- Background: `bg-background` (#0E141B)
- Border: 1px solid `border-input` (#2A3443)
- Focus: Border becomes `border-primary` (#DC2626), subtle shadow
- Padding: 12px (p-3)
- Border radius: 8px (rounded-lg)
- Text: `text-foreground` (#F9FAFB)
- Placeholder: `text-muted-foreground` (#94A3B8)

**Textarea**:
- Same as text input
- Min height: 100px
- Resize: vertical only

**Select / Dropdown**:
- Same styling as text input
- Icon: Chevron down in `text-muted-foreground`

**Checkbox / Radio**:
- Custom styled with Crimson accent
- 20px × 20px
- Rounded: 4px (checkbox), full (radio)

### Rating Stars

- Empty: `text-muted-foreground` (#94A3B8)
- Filled: `text-secondary` (#F59E0B - Amber)
- Size: 20px (w-5 h-5)
- Hover state: Slightly larger (scale: 1.1)
- Interactive: Smooth transition

### Badges / Tags

**AI Tool Badge**:
- Background: `bg-card` (#1B2533)
- Border: 1px solid `border-border` (#2A3443)
- Text: `text-muted-foreground` (#94A3B8)
- Padding: 4px 12px (px-3 py-1)
- Border radius: 6px (rounded-md)
- Font size: 14px (text-sm)

**Featured Badge**:
- Background: `bg-primary` (#DC2626)
- Text: `text-primary-foreground` (#F9FAFB)
- Same padding and radius

**Status Badge**:
- Approved: Green background
- Pending: Amber background
- Rejected: Red background
- All with appropriate text color for contrast

### Navigation

**Top Nav**:
- Background: `.glass` - `rgba(20, 25, 33, 0.7)` with backdrop blur
- Height: 64px (h-16)
- Backdrop blur: 12px
- Sticky: Yes
- Border bottom: 1px solid `border-border` (#2A3443)

**Nav Links**:
- Text: `text-muted-foreground` (#94A3B8)
- Active: `text-primary` (#DC2626)
- Hover: `text-foreground` (#F9FAFB)
- Font weight: 600 (SemiBold)

### Modals / Dialogs

- Background: `bg-card` (#1B2533)
- Border: 1px solid `border-border` (#2A3443)
- Border radius: 12px (rounded-xl)
- Backdrop: Black with 50% opacity
- Max width: 500px (forms) or 800px (video preview)
- Padding: 24px (p-6)

## Layout Patterns

### Container Widths

- **Max width**: 1400px (max-w-7xl)
- **Content width**: 1200px (max-w-6xl) for text-heavy sections
- **Narrow width**: 800px (max-w-4xl) for forms, single-column content

### Grid Systems

**Video Grid**:
- Desktop: 4 columns
- Tablet: 3 columns
- Mobile: 1 column
- Gap: 24px (gap-6)
- Auto-fit pattern, not fixed

**Creator Grid**:
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

### Sections

**Hero Section**:
- Min height: 60vh
- Centered content
- Large display text
- Featured video or gradient background

**Video Browse Section**:
- Full width container
- Filters in sidebar (desktop) or top (mobile)
- Grid layout for videos

## Animations & Transitions

### Timing

- **Fast**: 150ms - Hovers, simple state changes
- **Medium**: 200ms - Card animations, fades
- **Slow**: 300ms - Page transitions, complex animations

### Easing

- Default: ease-in-out
- Entrance: ease-out
- Exit: ease-in
- Bouncy: cubic-bezier (for special effects)

### Common Animations

**Card Hover**:
```
transform: translateY(-4px)
shadow: medium
border-color: crimson
transition: 200ms ease
```

**Button Press**:
```
scale: 0.98
transition: 100ms ease
```

**Page Load**:
```
fade in from opacity 0
duration: 300ms
```

**Loading Spinner**:
```
rotate continuously
crimson color
size: 24px
```

## Iconography

Use Lucide React icons throughout.

**Icon Sizes**:
- Small: 16px (w-4 h-4)
- Medium: 20px (w-5 h-5) - Default
- Large: 24px (w-6 h-6)
- XL: 32px (w-8 h-8)

**Icon Colors**:
- Default: `text-muted-foreground` (#94A3B8)
- Active: `text-primary` (#DC2626)
- Hover: `text-foreground` (#F9FAFB)

## Accessibility

### Contrast Ratios

All text must meet WCAG AA standards:
- Large text (18px+): Minimum 3:1
- Normal text: Minimum 4.5:1
- UI components: Minimum 3:1

Our color palette is tested for these ratios.

### Focus States

All interactive elements must have visible focus indicators:
- Focus ring: 2px crimson
- Offset: 2px
- Rounded: match element's border radius

### Keyboard Navigation

- Tab order must be logical
- All actions accessible via keyboard
- Focus trapped in modals
- ESC closes modals

### Screen Readers

- Use semantic HTML
- Proper ARIA labels
- Alternative text for images
- Status messages announced

## Responsive Breakpoints

Follow Tailwind defaults:
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

**Mobile-First**: Design for mobile, enhance for desktop.

## Special Effects (Use Sparingly)

### Subtle Film Grain
- Opacity: 3%
- Only on hero sections
- PNG texture overlay

### Gradient Overlays
- On video thumbnails
- Bottom fade: black to transparent
- Helps text readability

### Backdrop Blur
- Navigation: 8px blur
- Modals: 4px blur
- Creates depth

## Design Guidelines: What to Avoid

- Purple/violet gradients or blue/violet tones (avoid cool spectrum)
- Neon or overly bright colors
- Light whitish colors in gradients
- Comic Sans or playful fonts
- Busy patterns or textures
- Too many shadows or depth effects
- Excessive animations
- Anything that looks "generic SaaS"
- Rainbow-like multi-color gradients

**Stay Close to:**
- Warm color palette (reds, oranges, ambers, golds)
- Cinema Bold identity with crimson and amber
- Professional, premium aesthetic
- Deep, rich backgrounds (navy, slate tones)

## Design Inspiration References

- Letterboxd (film curation)
- A24 website (premium cinema)
- Behance (project showcase)
- Not like: YouTube, typical video platforms