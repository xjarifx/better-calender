# Google Calendar UI/UX Redesign Plan

**Date**: 2026-05-07
**Status**: Ready for Implementation
**Goal**: Transform Better Calendar to match Google Calendar's simplicity and efficiency

---

## Design Research References

### Material Design 3 Official Documentation
| Topic | URL |
|-------|-----|
| M3 Overview | https://m3.material.io/ |
| M3 Color System | https://m3.material.io/styles/color/overview |
| M3 Typography | https://m3.material.io/styles/typography/overview |
| M3 Shape System | https://m3.material.io/styles/shape/overview |
| M3 Components | https://m3.material.io/components |
| M3 Layout Foundations | https://m3.material.io/foundations/layout |
| M3 Design Tokens | https://m3.material.io/foundations/design-tokens |
| M3 Accessibility | https://m3.material.io/foundations/accessibility |

### Google Calendar UX Analysis
| Source | URL | Key Insights |
|--------|-----|--------------|
| Google Calendar UX Audit | https://aks2k.medium.com/google-calendar-ux-audit-10bb2a72f7ad | Schedule view clutter, navigation issues, inconsistent CTA placement |
| Calendar Redesign (Smashing) | https://smashingmagazine.com/2015/07/redesigning-a-calendar-experience-for-android/ | Density management, navigation drawer, mini calendar picker |
| Nielsen's Heuristics Analysis | https://medium.com/design-bootcamp/the-key-to-google-calendars-success-lies-in-ux-design-magic-271de40f7ff2 | Real-time updates, error prevention, consistency |
| Google Calendar Design Patterns | https://medium.com/@khriziakamille/design-patterns-of-google-calendar-fa2823537b4c | Drag & drop, modals, keyboard shortcuts, forgiving format |
| M3 Expressive Update (2026) | https://lifetips.alibaba.com/tech-efficiency/google-calendar-brings-back-improves-month-view-on-mob | Month view efficiency gains, 48dp touch targets, spatial memory |

---

## Problem Statement

Current app issues identified:
1. **Too many views** - Day/Week/Month views are overwhelming, week/day views are underutilized
2. **Missing Schedule/Agenda view** - No chronological list view for upcoming events
3. **Poor responsiveness** - Layouts don't adapt well to different screen sizes
4. **Inconsistent design** - Not following Material Design principles consistently
5. **Performance issues** - Slow rendering with many events, unnecessary re-renders

---

## Solution Overview

### Simplified View System
Replace Day/Week/Month with **Month + Agenda** toggle:
- **Month View**: 6-week grid showing event titles (max 3 per day)
- **Agenda/Schedule View**: Chronological list grouped by date
- **Toggle Control**: Segmented button to switch between views

### Material Design 3 Integration
Enhance current Tailwind + shadcn/ui stack with M3 principles:
- Add M3 design tokens (colors, typography, shapes, elevation)
- Follow M3 window size classes for responsive breakpoints
- Use M3 component patterns (navigation drawer, bottom sheets, cards)
- Ensure WCAG 2.2 compliance (48x48dp touch targets)

---

## Phase 1: Simplify Views (Remove Day/Week)

### Changes Required

**1. Update `lib/calendar-context.tsx`**
```typescript
// BEFORE
export type ViewMode = 'day' | 'week' | 'month'

// AFTER
export type ViewMode = 'month' | 'agenda'
```

Remove day/week-specific state:
- Remove `selectedHour` state (DayView time indicator)
- Remove week navigation helpers
- Keep `currentDate`, `setCurrentDate`, `navigateToday`, `firstDayOfWeek`

**2. Modify `app/calendar/page.tsx`**

Remove components:
- `DayView` component (lines 288-408) - DELETE
- `WeekView` component (lines 410-563) - DELETE
- Keep `MonthView` (lines 565-645)
- Keep `EventCard` (lines 647-689)

Add agenda view state:
```typescript
const [viewMode, setViewMode] = useCalendar()
// Toggle between 'month' and 'agenda'
```

Update view rendering:
```tsx
{viewMode === 'month' ? <MonthView ... /> : <AgendaView ... />}
```

**3. Update `components/Sidebar.tsx`**

Change view switcher from 3 tabs to 2:
```tsx
// BEFORE
{['day', 'week', 'month'].map(view => ...)

// AFTER
{['month', 'agenda'].map(view => ...)
```

Update labels:
- "Month" (icon: `Calendar`)
- "Agenda" (icon: `List`)

---

## Phase 2: Add Agenda/Schedule View

### New Component: `components/AgendaView.tsx`

**Purpose**: Vertical chronological list of all upcoming events grouped by date

**Structure**:
```typescript
interface AgendaViewProps {
  events: Event[]
  onEventClick: (event: Event) => void
}
```

**Features**:
1. **Date Grouping**: Events grouped by date with sticky headers
2. **Date Labels**: "Today", "Tomorrow", or full date format
3. **Event Cards**: Color indicator, title, time range, location
4. **Empty State**: Message when no upcoming events
5. **Past Events**: Option to show/hide past events (default: hide)

**Styling** (Material Design 3 List):
- Background: `--md-surface`
- Date header: `--md-title-large` (22px/28px)
- Event title: `--md-body-large` (16px/24px)
- Event time: `--md-body-medium` (14px/20px), `--md-on-surface-variant`
- Color indicator: 4px wide left border in event color

**Implementation**:
```tsx
function AgendaView({ events, onEventClick }) {
  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    return groupBy(sorted, event =>
      format(new Date(event.startDate), 'yyyy-MM-dd')
    )
  }, [events])

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
          <h3 className="text-title-large text-on-surface sticky top-0 bg-surface py-2">
            {formatDateLabel(new Date(date))}
          </h3>
          <List className="divide-y divide-surface-variant">
            {dayEvents.map(event => (
              <AgendaEventItem event={event} onClick={onEventClick} />
            ))}
          </List>
        </div>
      ))}
    </div>
  )
}
```

---

## Phase 3: Apply Material Design 3 System

### Update `app/globals.css`

Add M3 design tokens following the existing OKLCH color scheme:

```css
:root {
  /* ========== M3 Color System ========== */
  /* Primary colors */
  --md-primary: 40.33% 0.083 303.55;              /* #6750A4 in OKLCH */
  --md-on-primary: 100% 0 0;                        /* #FFFFFF */
  --md-primary-container: 87.56% 0.065 303.55;     /* #EADDFF */
  --md-on-primary-container: 24.71% 0.071 303.55;  /* #21005D */

  /* Surface colors */
  --md-surface: 100% 0 0;                          /* #FFFBFE */
  --md-on-surface: 17.65% 0.003 296.93;            /* #1C1B1F */
  --md-surface-variant: 92.16% 0.008 296.93;       /* #E7E0EC */
  --md-on-surface-variant: 33.33% 0.009 296.93;    /* #49454F */

  /* Outline colors */
  --md-outline: 64.71% 0.006 296.93;               /* #79747E */
  --md-outline-variant: 83.92% 0.008 296.93;       /* #CAC4D0 */

  /* ========== M3 Typography Scale ========== */
  /* Using existing Inter font from layout.tsx */
  --md-display-large: 57px/64px;
  --md-headline-large: 32px/40px;
  --md-headline-medium: 28px/36px;
  --md-title-large: 22px/28px;
  --md-title-medium: 16px/24px;
  --md-body-large: 16px/24px;
  --md-body-medium: 14px/20px;
  --md-label-large: 14px/20px;

  /* ========== M3 Shape System ========== */
  --md-shape-none: 0px;
  --md-shape-extra-small: 4px;
  --md-shape-small: 8px;
  --md-shape-medium: 12px;
  --md-shape-large: 16px;
  --md-shape-extra-large: 28px;
  --md-shape-full: 9999px;

  /* ========== M3 Elevation ========== */
  --md-elevation-0: 0px 0px 0px rgba(0,0,0,0);
  --md-elevation-1: 0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15);
  --md-elevation-2: 0px 2px 4px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15);
  --md-elevation-3: 0px 4px 8px rgba(0,0,0,0.3), 0px 4px 12px 4px rgba(0,0,0,0.15);

  /* ========== M3 Window Size Classes ========== */
  /* Compact: <600px (phone)
     Medium: 600-839px (tablet portrait)
     Expanded: 840-1199px (tablet landscape, small desktop)
     Large: 1200-1599px (desktop)
     Extra-large: 1600px+ (ultrawide) */
}

/* Dark theme - overlay existing dark styles */
[data-theme="dark"] {
  --md-surface: 17.65% 0.003 296.93;              /* #1C1B1F */
  --md-on-surface: 90.20% 0.002 296.93;            /* #E6E1E5 */
  --md-surface-variant: 33.33% 0.009 296.93;       /* #49454F */
  --md-on-surface-variant: 83.92% 0.008 296.93;    /* #CAC4D0 */
  /* ... adjust other tokens for dark mode */
}
```

### Apply M3 Classes to Existing Components

**Event Cards** (Month View):
```tsx
<div className="rounded-md bg-surface-variant p-1 cursor-pointer
             hover:elevation-1 transition-shadow">
  <div className="h-1 rounded-full bg-[var(--event-color)]" />
  <p className="text-label-large text-on-surface truncate">
    {event.title}
  </p>
</div>
```

**Buttons** (use shadcn/ui variants with M3 shapes):
```tsx
<Button className="rounded-full">  {/* M3 FAB shape */}
<Button className="rounded-lg">   {/* M3 rectangular shape */}
```

---

## Phase 4: Fix Responsiveness

### M3 Window Size Classes Implementation

Add responsive utilities to `tailwind.config.ts` (if exists) or use inline classes:

```typescript
// Breakpoints matching M3
const breakpoints = {
  compact: 0,      // <600px
  medium: 600,     // 600-839px
  expanded: 840,   // 840-1199px
  large: 1200,     // 1200-1599px
  'extra-large': 1600  // 1600px+
}
```

### Specific Fixes

**1. Month Grid Responsive**
```tsx
<div className="grid grid-cols-7 gap-px">
  {/* Days - ensure minimum 48x48px touch target */}
  <div className="min-h-[48px] sm:min-h-[64px] p-1">
```

**2. Sidebar Behavior**
- Desktop (expanded+): Permanent rail (256px / 16rem)
- Mobile (compact): Temporary drawer with swipe gesture

Already implemented in `components/Sidebar.tsx` - verify breakpoints match M3.

**3. Agenda View Responsive**
```tsx
<div className="px-4 py-3 max-w-3xl mx-auto">
  {/* Center content on large screens, full width on mobile */}
```

**4. Touch Targets**
Ensure all interactive elements meet M3 minimum:
- Buttons: `min-h-[48px] min-w-[48px]`
- Calendar day cells: `min-h-[48px]`
- Navigation items: `min-h-[48px]`

---

## Phase 5: Improve Performance

### 1. Memoize Expensive Calculations

```typescript
// In MonthView component
const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate])

const eventsByDate = useMemo(() =>
  events.reduce((acc, event) => {
    const dateKey = format(new Date(event.startDate), 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)
, [events])
```

### 2. Optimize EventCard with React.memo

```typescript
const EventCard = React.memo(function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div onClick={() => onClick(event)}>
      {/* Card content */}
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.event.id === nextProps.event.id &&
         prevProps.event.updatedAt === nextProps.event.updatedAt
})
```

### 3. Virtualization (If Needed)

For users with 100+ events/month, consider `react-window`:
```bash
npm install react-window
```

Only implement if performance testing shows lag with current date-fns rendering.

### 4. Event Fetching Optimization

Implement SWR or React Query for better caching:
```bash
npm install swr
# or
npm install @tanstack/react-query
```

```typescript
import useSWR from 'swr'

function useEvents() {
  const { data, error, mutate } = useSWR('/api/events', fetcher)
  return {
    events: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
```

---

## Implementation Order

1. **Phase 1: Simplify views** - Remove day/week, keep month only
2. **Phase 2: Add Agenda view** - Create `components/AgendaView.tsx`
3. **Phase 3: Apply M3 design** - Update `globals.css` with tokens
4. **Phase 4: Fix responsiveness** - Verify breakpoints, touch targets
5. **Phase 5: Performance** - Memoization, optional virtualization

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/AgendaView.tsx` | **CREATE** | New agenda/schedule view component |
| `lib/calendar-context.tsx` | **MODIFY** | Change ViewMode to 'month' \| 'agenda' |
| `app/calendar/page.tsx` | **MODIFY** | Remove day/week, add agenda toggle |
| `components/Sidebar.tsx` | **MODIFY** | Update view switcher to month/agenda |
| `app/globals.css` | **MODIFY** | Add M3 design tokens |
| `app/calendar/page.tsx` (MonthView) | **MODIFY** | Ensure M3 styling, responsive grid |

---

## Testing Checklist

### View Functionality
- [ ] Month view displays correctly with 6-week grid
- [ ] Agenda view shows chronological event list
- [ ] Toggle switch works between month/agenda
- [ ] Clicking event opens details (BottomSheet)
- [ ] Navigation (prev/next/today) works in both views

### Responsiveness
- [ ] Compact (<600px): Single column, stacked layout
- [ ] Medium (600-839px): Sidebar visible, larger touch targets
- [ ] Expanded (840px+): Full desktop layout
- [ ] All touch targets ≥48x48px
- [ ] Swipe gestures work on mobile

### Material Design Compliance
- [ ] M3 color tokens applied (check with dev tools)
- [ ] Typography follows M3 scale
- [ ] Shape borders match M3 (8px small, 12px medium, etc.)
- [ ] Elevation shadows correct
- [ ] Dark mode follows M3 dark theme

### Performance
- [ ] Smooth scrolling with 50+ events
- [ ] No lag when switching views
- [ ] Month navigation is instant
- [ ] Memory usage stable (no leaks)

---

## Expected Outcomes

After implementation:
1. **Simplified UI** - Only 2 views (Month + Agenda) instead of 3
2. **Google Calendar Feel** - Familiar toggle, similar layout
3. **Better Mobile UX** - Proper touch targets, responsive breakpoints
4. **Consistent Design** - Material Design 3 throughout
5. **Faster Performance** - Memoized renders, optimized lists

---

## References for Development

**To read before coding:**
1. M3 Layout: https://m3.material.io/foundations/layout
2. M3 Components: https://m3.material.io/components
3. Calendar UX Audit: https://aks2k.medium.com/google-calendar-ux-audit-10bb2a72f7ad
4. Existing docs: `docs/UI_UX_REFACTOR_PLAN.md` (for Sidebar implementation)

**Component Inspiration:**
- Google Calendar month view: Observe how events truncate, "+X more" behavior
- Google Calendar agenda view: Note date grouping, event card layout
- Material Design 3 Lists: https://m3.material.io/components/lists

---

**Next Step**: Begin Phase 1 implementation (simplify views)
