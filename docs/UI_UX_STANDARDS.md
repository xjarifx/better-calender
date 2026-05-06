# UI/UX Standards & Guidelines

## Core Design Philosophy
- **Mobile-First Approach**: Design for mobile viewports first, then scale up to desktop layouts
- **Always Dark Mode**: Single persistent dark theme, no light mode toggle
- **Flat Solid Colors**: No gradients, use vibrant solid colors without light/dark variants of the same hue
- **Single Font Family**: Consistent typography with one font across the entire application

## Component Standards
- **Standardized Dimensions**: Consistent height, width, padding, margin, and positioning for all components
- **Space Efficiency**: Optimize padding and widths to respect screen real-estate, especially on mobile
- **No Scroll Bars**: Eliminate scroll bars via layout design, use alternative navigation (swipe, pagination) instead

## Visual Customization
- **Event Label Color Customization**: Allow users to assign custom colors to event labels/categories

## Interaction & Animation
- **Simple Animations**: Subtle, performant transitions for user interactions, avoid complex effects

## Accessibility
- **WCAG-Compliant Color Palette**: Ensure all color choices meet WCAG 2.1 contrast ratios for visual accessibility

---

## UI/UX Standards Definition

### 1. Design Philosophy Standards
| Standard | Definition | Real-World Examples |
|---------|-------------|---------------------|
| Mobile-First | Design for mobile viewports first, then adapt to desktop | Calenduh (native iOS calendar, gesture-driven), FamiliePlanner (swipe navigation proposal) |
| Always Dark Mode | Single dark theme, no light mode toggle | Raycast, Linear, Vercel Dashboard, Grit (dark-first design) |
| No Gradients | Flat, solid color usage only | Off Grid (brutalist terminal design), Raycast (flat surface stack) |
| Playful Solid Colors | Vibrant solid colors, no light/dark variants of the same hue | Dark Mode Developer Palette (#818CF8 accent), Material Dark (#BB86FC accent) |
| Single Font | One font family across all UI elements | Off Grid (Menlo monospace), Raycast (system font stack) |

### 2. Color System Standards
| Standard | Definition | Hex Values | Real-World Examples |
|---------|-------------|------------|---------------------|
| Base Surface | Primary app background | #0F172A (Dark Navy) | Linear, Vercel, Supabase |
| Elevated Surfaces | Card/panel backgrounds (lighter than base) | #1E293B (secondary), #334155 (tertiary) | Raycast (#1C1C1E → #242424 → #2C2C2E) |
| Text - Primary | Main body text | #F1F5F9 (15.4:1 contrast on #0F172A) | Skyryedesign Dark Mode Developer Palette |
| Text - Secondary | Labels, timestamps | #94A3B8 (5.2:1 contrast) | Same as above |
| Accent | Interactive elements, CTAs | #818CF8 (Indigo) | Dark Mode Developer Palette |
| Semantic Colors | Success/Warning/Error states | Success: #4ADE80, Warning: #FBBF24, Error: #EF4444 | Material Dark Semantic Colors |
| No Pure Black/White | Avoid #000000 and #FFFFFF | Use #0F172A instead of #000000, #F1F5F9 instead of #FFFFFF | Material Dark (#121212), Raycast (#1C1C1E) |

### 3. Typography Standards
| Standard | Definition | Real-World Examples |
|---------|-------------|---------------------|
| Single Font Family | One font across all components | Inter (most SaaS dark apps), System font stack (Raycast) |
| Hierarchy | Size/color differentiation, not weight | Raycast (14-15px medium primary, 11-12px regular secondary) |
| Readability | Line height 1.6 for body text | Venture Crane (dark-first design system) |

### 4. Component Standards
| Standard | Definition | Real-World Examples |
|---------|-------------|---------------------|
| Standardized Dimensions | Consistent padding (16px), margin (8px), button height (48px) | Grit Design System |
| Space Efficiency | Minimize wasted padding, respect screen real-estate | Off Grid (information density over decoration) |
| No Scroll Bars | Use swipe/pagination instead of scrollable content | Calenduh (gesture navigation), VideoDiary (HorizontalPager day swiping) |
| Border-Based Elevation | Use light borders instead of shadows for depth | Raycast (rgba(255,255,255,0.08) borders) |
| Shape | 8px border radius for components, 12px for sheets | Gorhom Bottom Sheet (default 12px radius) |

### 5. Interaction & Animation Standards
| Standard | Definition | Real-World Examples |
|---------|-------------|---------------------|
| Simple Animations | 200ms ease transitions, no complex effects | Raycast (subtle surface transitions) |
| Gesture-Based Navigation | Swipe, long-press, pull-to-refresh | Calenduh (pinch to zoom, swipe to reschedule), FamiliePlanner (swipe nav proposal) |
| Bottom Sheets | Event details via slide-up sheets instead of modals | Gorhom Bottom Sheet, React Native Bottom Sheet patterns |
| No Scroll Bars | Alternative navigation (swipe, pagination) | Layout Scene (dark mode design guide) |

### 6. Accessibility Standards
| Standard | Definition | Real-World Examples |
|---------|-------------|---------------------|
| WCAG 2.1 AA | 4.5:1 text contrast, 3:1 large text/UI components | Skyryedesign Dark Mode Developer Palette, BrowserStack Accessibility Guide |
| Colorblind-Friendly | Avoid red-green pairs, use labels/patterns | HueHive (color blindness simulator) |
| Focus Indicators | Visible focus rings for keyboard navigation | Material 3 Dark Mode (focus ring states) |

---

## Proposed Improvement: Gesture-Based Calendar Navigation
### Overview
Replace traditional navigation/modals with mobile-native gesture patterns aligned with the core design principles.

### Key Features
1. **Swipe Navigation**: Navigate between days/weeks/months via left/right swipe gestures
2. **Bottom Sheet Event Details**: Tap events to slide up a bottom sheet (instead of full modals/pages)
3. **Pull-to-Refresh**: Swipe down to sync calendar data
4. **Long-Press Quick Actions**: Long-press dates to instantly create events

### Alignment with Design System
- Mobile-first: Uses native mobile interaction patterns
- No scroll bars: Horizontal navigation via swipe instead of scrollable tabs
- Simple animations: Smooth slide transitions only
- Space efficient: Bottom sheets preserve screen context
- Dark mode/solid colors: Maintains existing visual guidelines
