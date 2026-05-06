# UI/UX Refactoring Plan

**Date**: 2026-05-06  
**Status**: Ready for Implementation

---

## Problem Summary

After initial UI/UX standards implementation, several issues were identified:

1. **Missing Month View** - Calendar only has Day/Week views
2. **Navigation Not Responsive** - Horizontal nav doesn't collapse on small screens, no hamburger menu
3. **Wrong Navigation Direction** - Horizontal nav should be vertical sidebar
4. **Poor Icon Usage** - Inline SVGs instead of Lucide icons, no icons in nav
5. **AI Page Layout Broken** - Model dropdown + Extract + Clear buttons stay in one row on mobile
6. **Page Naming Issues** - "AI Event Extraction" too long, nav shows "AI"
7. **Components Not Responsive** - Grid layouts don't adapt, buttons/inputs don't stack on mobile

---

## Solution Overview

### 1. New Vertical Sidebar (`components/Sidebar.tsx`)

Replace horizontal Navbar with responsive vertical sidebar.

**Desktop (lg+)**:
- Fixed left sidebar, 256px (64rem) wide
- Vertical navigation with Lucide icons + labels
- User info + logout at bottom
- Always visible

**Mobile (< lg)**:
- Hamburger menu icon in top-right corner
- Tapping opens bottom sheet drawer with vertical nav
- Auto-closes on navigation

**Navigation Items**:
| Label | Icon | Route |
|-------|------|-------|
| Calendar | `Calendar` | `/calendar` |
| Events | `List` | `/events` |
| Extract | `Sparkles` | `/events/input` |
| Settings | `Settings` | `/settings` |

**Sidebar Structure**:
```tsx
<div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex flex-col">
  <div className="p-4 border-b border-border">
    <h1 className="text-lg font-semibold">Better Calendar</h1>
  </div>
  
  <nav className="flex-1 p-3 space-y-1">
    {/* Navigation links with icons */}
  </nav>
  
  <div className="p-3 border-t border-border">
    {/* User info + logout */}
  </div>
</div>
```

---

### 2. Add Month View (`app/calendar/page.tsx`)

Add third view mode to existing calendar.

**View Toggle** (pill-style):
```tsx
<div className="flex items-center gap-1 bg-muted rounded-lg p-1">
  {['day', 'week', 'month'].map(view => (
    <button
      key={view}
      onClick={() => setViewMode(view)}
      className={`px-3 py-1.5 rounded-md text-sm ${
        viewMode === view ? 'bg-background shadow-sm' : ''
      }`}
    >
      {view.charAt(0).toUpperCase() + view.slice(1)}
    </button>
  ))}
</div>
```

**Month View Features**:
- 7-column grid (Sunday-Saturday)
- Each cell shows day number + colored event dots (max 3 visible, "+N more" text)
- Click day → switches to day view
- Swipe left/right → previous/next month
- Current day highlighted with `bg-primary/20 text-primary`

**Month View Component**:
```tsx
function MonthView({ currentDate, events, onEventClick }) {
  // Generate 42 days (6 weeks) for the month
  // Map events to their respective days
  // Render grid with day cells
}
```

---

### 3. Fix AI Extract Page (`app/events/input/page.tsx`)

**Rename**:
- Page title: "AI Event Extraction" → "Extract Events"
- Nav label: "AI" → "Extract"

**Fix Responsive Layout**:
```tsx
// BROKEN (stays horizontal on mobile):
<div className="flex items-end gap-4">
  <div className="flex-1">{dropdown}</div>
  <Button>Extract</Button>
  <Button>Clear</Button>
</div>

// FIXED (stacks on mobile, row on sm+):
<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
  <div className="flex-1">{dropdown}</div>
  <div className="flex gap-2">
    <Button className="flex-1 sm:flex-none">{extracting ? 'Cancel' : 'Extract'}</Button>
    <Button variant="outline" className="flex-1 sm:flex-none">Clear</Button>
  </div>
</div>
```

**Use Lucide Icons**:
- Replace inline SVG in dropdown with `ChevronDown` icon
- Add `Sparkles` icon to page header

---

### 4. Update Root Layout (`app/layout.tsx`)

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex">
        <Sidebar /> {/* Hidden on mobile, fixed on desktop */}
        <main className="flex-1 lg:ml-64"> {/* offset for sidebar */}
          <AuthProvider>{children}</AuthProvider>
        </main>
      </body>
    </html>
  )
}
```

---

### 5. Remove Navbar from All Pages

Remove `Navbar` import and usage from:
- `app/calendar/page.tsx`
- `app/events/page.tsx`
- `app/events/new/page.tsx`
- `app/events/[id]/page.tsx`
- `app/events/input/page.tsx`
- `app/settings/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`

**Navigation Replacement**:
- Replace `router.back()` with `router.push('/calendar')`
- Add back buttons manually where needed using consistent styling

---

### 6. Standardize Responsive Patterns

**All Inputs/Buttons**: Ensure `rounded-lg` class is applied

**Grid Layouts**: Use responsive grid classes
```tsx
// Example for AI page model section
<div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
```

**Page Structure** (standardized):
```tsx
<div className="min-h-screen bg-background flex flex-col">
  <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
    {/* page content */}
  </main>
</div>
```

**Responsive Spacing**:
- Mobile: `px-4 py-3`
- Desktop: same (consistent)

---

## Implementation Order

1. **Create `components/Sidebar.tsx`** - New vertical nav component
2. **Update `app/layout.tsx`** - Add Sidebar, remove Navbar
3. **Delete `components/Navbar.tsx`** - No longer needed
4. **Update `app/calendar/page.tsx`** - Add month view, remove Navbar
5. **Update `app/events/input/page.tsx`** - Fix layout, rename, use Lucide icons
6. **Update all other pages** - Remove Navbar imports
7. **Build and test** - Verify all changes

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `components/Sidebar.tsx` | **CREATE** | Vertical sidebar with mobile hamburger |
| `components/Navbar.tsx` | **DELETE** | Replaced by Sidebar |
| `app/layout.tsx` | **MODIFY** | Add Sidebar, remove Navbar |
| `app/calendar/page.tsx` | **MODIFY** | Add month view, remove Navbar |
| `app/events/page.tsx` | **MODIFY** | Remove Navbar |
| `app/events/new/page.tsx` | **MODIFY** | Remove Navbar |
| `app/events/[id]/page.tsx` | **MODIFY** | Remove Navbar |
| `app/events/input/page.tsx` | **MODIFY** | Fix layout, rename, Lucide icons |
| `app/settings/page.tsx` | **MODIFY** | Remove Navbar |
| `app/login/page.tsx` | **MODIFY** | Remove Navbar |
| `app/register/page.tsx` | **MODIFY** | Remove Navbar |

---

## Testing Checklist

- [ ] Sidebar visible on desktop (left side, 256px wide)
- [ ] Hamburger menu works on mobile
- [ ] Navigation links work with icons
- [ ] Month view displays correctly in calendar
- [ ] Swipe gestures work in all calendar views
- [ ] AI page layout stacks properly on mobile
- [ ] All pages use Lucide icons (no inline SVGs)
- [ ] Build passes with no errors
- [ ] All components have `rounded-lg` where appropriate
- [ ] Page titles are concise ("Extract Events" not "AI Event Extraction")

---

## Icon Usage (Lucide React)

Already available in `package.json`. Use these icons:

- `Menu`, `X` - Hamburger menu / close
- `Calendar`, `List`, `Sparkles`, `Settings`, `LogOut` - Navigation
- `ChevronDown`, `ChevronLeft`, `ChevronRight` - Dropdowns
- `Plus`, `Search` - Actions
- `PanelLeft` - Sidebar toggle (if needed)
