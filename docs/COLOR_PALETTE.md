# Color Palette Documentation

## Overview
Better Calendar uses a Google Calendar-inspired dark color theme for optimal readability and visual hierarchy.

## Color Palette (Dark Theme - Google Calendar Inspired)

### Base Colors

| Variable | OKLCH Value | Hex Equivalent | Purpose |
|-----------|--------------|----------------|---------|
| `--background` | `oklch(0.20 0.02 264)` | `~#1a1a2e` | Main page background |
| `--foreground` | `oklch(0.92 0.005 264)` | `~#e8eaed` | Primary text color |
| `--card` | `oklch(0.28 0.02 264)` | `~#2a2a3e` | Card/panel backgrounds |
| `--card-foreground` | `oklch(0.92 0.005 264)` | `~#e8eaed` | Text on cards |
| `--popover` | `oklch(0.28 0.02 264)` | `~#2a2a3e` | Popover backgrounds |
| `--popover-foreground` | `oklch(0.92 0.005 264)` | `~#e8eaed` | Text on popovers |

### Interactive Colors

| Variable | OKLCH Value | Hex Equivalent | Purpose |
|-----------|--------------|----------------|---------|
| `--primary` | `oklch(0.62 0.21 264)` | `#4285F4` | Google Calendar Blue - buttons, links, active states |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on primary elements |
| `--secondary` | `oklch(0.35 0.02 264)` | `~#3a3a4e` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.92 0.005 264)` | `~#e8eaed` | Text on secondary |
| `--muted` | `oklch(0.35 0.02 264)` | `~#3a3a4e` | Muted/elevated surfaces |
| `--muted-foreground` | `oklch(0.78 0.015 264)` | `~#b8b8cc` | Muted/secondary text |

### Accent & Semantic Colors

| Variable | OKLCH Value | Hex Equivalent | Purpose |
|-----------|--------------|----------------|---------|
| `--accent` | `oklch(0.35 0.02 264)` | `~#3a3a4e` | Accent surfaces |
| `--accent-foreground` | `oklch(0.92 0.005 264)` | `~#e8eaed` | Text on accent |
| `--destructive` | `oklch(0.58 0.24 25)` | `#EA4335` | Google Calendar Red - errors, delete actions |
| `--success` | `oklch(0.63 0.16 155)` | `#34A853` | Google Calendar Green - success states |
| `--warning` | `oklch(0.85 0.17 95)` | `#FBBC04` | Google Calendar Yellow - warnings |

### Border & Input Colors

| Variable | Value | Purpose |
|-----------|-------|---------|
| `--border` | `rgba(255, 255, 255, 0.18)` | Borders for components (18% white opacity for clear visibility) |
| `--input` | `rgba(255, 255, 255, 0.25)` | Input field borders |
| `--ring` | `oklch(0.78 0.015 264)` | Focus ring color |

## Lightness Hierarchy

The color palette maintains a clear visual hierarchy with distinct lightness levels:

| Lightness | Components |
|-----------|------------|
| 20% | Background (base) |
| 28% | Cards, Popovers |
| 35% | Secondary, Muted, Accent surfaces |
| 58-85% | Semantic colors (destructive, success, warning) |
| 92% | Foreground text |

## Google Calendar Color Inspiration

The palette is directly inspired by Google Calendar's dark theme:

- **Primary Blue**: `#4285F4` - Used for buttons, active states, default event color
- **Success Green**: `#34A853` - Success messages, confirmations
- **Warning Yellow**: `#FBBC04` - Warnings, alerts  
- **Destructive Red**: `#EA4335` - Errors, delete actions

## Tailwind CSS Usage

The CSS variables are mapped to Tailwind classes via `@theme inline` in `app/globals.css`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  /* ... etc */
}
```

Usage in components:
- `bg-background` - Main background
- `text-foreground` - Primary text
- `bg-card` - Card backgrounds
- `bg-primary` - Primary buttons/elements
- `border-border` - Component borders
- `text-muted-foreground` - Secondary text

## Event Colors

Default event color: `#4285F4` (Google Calendar Blue)

Events can be customized with these Google Calendar-inspired colors:
- `#4285F4` - Blue (default)
- `#E67C73` - Flamingo Red
- `#D50000` - Tomato Red
- `#F4511E` - Tangerine Orange
- `#EF6C00` - Pumpkin Orange
- `#009688` - Eucalyptus Teal
- `#0B8043` - Basil Green
- `#FBBC04` - Yellow

## Why These Colors?

1. **Readability**: Background at 20% lightness reduces eye strain while maintaining dark aesthetic
2. **Clear boundaries**: 18% opacity borders (vs previous 8%) make component boundaries clearly visible
3. **Google Calendar consistency**: Users familiar with Google Calendar will feel at home
4. **Accessible**: Contrast ratios meet WCAG AA standards for text readability
