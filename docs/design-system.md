# Design System - Cinema Bold

## Design Philosophy

SupaViewer's design should feel like a prestigious film festival website meets modern streaming platform. We treat AI video as art, not novelty. The design should be bold but not overwhelming, sophisticated but not pretentious, cinematic but not theatrical.

**Core Principles**:
- **Content First**: Video thumbnails and content are the hero
- **Bold but Breathable**: Strong colors with generous whitespace
- **Cinematic Feel**: Film festival aesthetic, not tech startup
- **Fast & Snappy**: Smooth animations, instant feedback
- **Accessible**: WCAG 2.1 AA compliance minimum

## Color Palette - Cinema Bold

### Primary Colors

**Deep Crimson** - `#DC2626`
- Primary brand color
- Use for: Primary buttons, links, active states, brand elements
- Represents: Passion, cinema, prestige
- Accessibility: Ensure sufficient contrast on dark backgrounds

**Warm Amber** - `#F59E0B`
- Accent color
- Use for: Secondary actions, highlights, ratings stars, success states
- Represents: Quality, awards, excellence
- Pairs beautifully with crimson

### Background Colors

**Very Dark Blue-Grey** - `#0F172A`
- Main background color
- Use for: Page backgrounds, empty areas
- Creates depth and sophistication

**Dark Slate** - `#1E293B`
- Surface color
- Use for: Cards, modals, elevated surfaces
- One step lighter than main background

**Deep Slate** - `#334155`
- Borders and dividers
- Use for: Card borders, separators, subtle divisions
- Should be subtle, not prominent

### Text Colors

**Off-White** - `#F8FAFC`
- Primary text color
- Use for: Headings, important text, body copy
- High contrast on dark backgrounds

**Slate Grey** - `#94A3B8`
- Secondary text color
- Use for: Metadata, timestamps, less important information
- Maintains readability while being visually secondary

**Medium Slate** - `#64748B`
- Tertiary text / placeholder
- Use for: Disabled text, placeholders, very subtle information

### Semantic Colors

**Success Green** - `#10B981`
- Use for: Success messages, approved status
- Keep usage minimal

**Warning Amber** - `#F59E0B` (same as accent)
- Use for: Warnings, pending status
- Dual purpose with accent color

**Error Red** - `#EF4444`
- Use for: Errors, rejected status, destructive actions
- Similar hue to crimson but brighter

**Info Blue** - `#3B82F6`
- Use for: Info messages, tips
- Use sparingly

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

**Video Cards**:
- Background: Dark Slate (#1E293B)
- Border: 1px solid Deep Slate (#334155)
- Border radius: 12px (rounded-xl)
- Padding: 0 (image full bleed), 16px for text content
- Hover: Subtle lift (transform: translateY(-4px)), border becomes crimson
- Transition: 200ms ease

**Content Cards**:
- Background: Dark Slate (#1E293B)
- Border: 1px solid Deep Slate (#334155)
- Border radius: 8px (rounded-lg)
- Padding: 24px (p-6)
- Shadow: Subtle (shadow-sm)

### Buttons

**Primary Button** (Crimson):
- Background: Deep Crimson (#DC2626)
- Text: Off-White (#F8FAFC)
- Padding: 12px 24px (px-6 py-3)
- Border radius: 8px (rounded-lg)
- Hover: Slightly lighter, subtle shadow
- Active: Slightly darker
- Font weight: 600 (SemiBold)

**Secondary Button** (Amber):
- Background: Warm Amber (#F59E0B)
- Text: Very Dark Blue-Grey (#0F172A)
- Same padding and radius as primary
- Hover: Slightly lighter

**Ghost Button**:
- Background: Transparent
- Border: 1px solid Deep Slate (#334155)
- Text: Off-White (#F8FAFC)
- Hover: Background becomes Dark Slate

**Icon Button**:
- Square, 40px × 40px
- Crimson on hover
- Rounded: 8px

### Inputs & Forms

**Text Input**:
- Background: Very Dark Blue-Grey (#0F172A)
- Border: 1px solid Deep Slate (#334155)
- Focus: Border becomes Crimson (#DC2626), subtle shadow
- Padding: 12px (p-3)
- Border radius: 8px (rounded-lg)
- Text: Off-White (#F8FAFC)
- Placeholder: Medium Slate (#64748B)

**Textarea**:
- Same as text input
- Min height: 100px
- Resize: vertical only

**Select / Dropdown**:
- Same styling as text input
- Icon: Chevron down in Slate Grey

**Checkbox / Radio**:
- Custom styled with Crimson accent
- 20px × 20px
- Rounded: 4px (checkbox), full (radio)

### Rating Stars

- Empty: Slate Grey (#94A3B8)
- Filled: Warm Amber (#F59E0B)
- Size: 20px (w-5 h-5)
- Hover state: Slightly larger (scale: 1.1)
- Interactive: Smooth transition

### Badges / Tags

**AI Tool Badge**:
- Background: Dark Slate (#1E293B)
- Border: 1px solid Deep Slate (#334155)
- Text: Slate Grey (#94A3B8)
- Padding: 4px 12px (px-3 py-1)
- Border radius: 6px (rounded-md)
- Font size: 14px (text-sm)

**Featured Badge**:
- Background: Crimson (#DC2626)
- Text: Off-White (#F8FAFC)
- Same padding and radius

**Status Badge**:
- Approved: Green background
- Pending: Amber background
- Rejected: Red background
- All with appropriate text color for contrast

### Navigation

**Top Nav**:
- Background: Dark Slate (#1E293B) with slight transparency
- Height: 64px
- Backdrop blur: 8px
- Sticky: Yes
- Border bottom: 1px solid Deep Slate

**Nav Links**:
- Text: Slate Grey (#94A3B8)
- Active: Crimson (#DC2626)
- Hover: Off-White (#F8FAFC)
- Font weight: 600 (SemiBold)

### Modals / Dialogs

- Background: Dark Slate (#1E293B)
- Border: 1px solid Deep Slate (#334155)
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
- Default: Slate Grey (#94A3B8)
- Active: Crimson (#DC2626)
- Hover: Off-White (#F8FAFC)

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

## Don't Use

- Purple/violet AI gradients
- Neon colors
- Comic Sans or playful fonts
- Busy patterns
- Too many shadows
- Excessive animations
- Anything that looks "generic SaaS"

## Design Inspiration References

- Letterboxd (film curation)
- A24 website (premium cinema)
- Behance (project showcase)
- Not like: YouTube, typical video platforms