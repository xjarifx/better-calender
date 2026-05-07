# UI Cleanup Plan

## Overview

Remove AI input from the right panel, remove left sidebar collapse functionality, hide scrollbars globally, and reduce border-radius values across the entire app.

---

## 1. Remove AI Input Mode from Right Panel

### Files to modify:

**`lib/calendar-context.tsx`**
- Remove `"ai-input"` from `RightPanelMode` type union
- Change default state from `"ai-input"` to `"day-view"`

**`components/RightPanel.tsx`**
- Remove the entire `ai-input` mode block (lines 110-139)
- Change `handleClearExtracted` destination from `"ai-input"` to `"day-view"`
- Change the "Edit" button in event-details mode to stay in event-details (or remove it, since EventForm is already rendered inline)
- Clean up unused state: `text`, `model`, `extracted`, `handleExtract`, `handleClearExtracted`

**`components/OnboardingTour.tsx`**
- Remove the tour step that targets `data-tour="ai-input"` (line 31)

---

## 2. Remove Collapse Button from Left Sidebar

### Files to modify:

**`components/Sidebar.tsx`**
- Remove collapse button block (lines 114-130)
- Remove `isCollapsed` state and `useState` import
- Remove `PanelLeftClose`, `PanelLeftOpen` imports
- Remove all `isCollapsed` conditional branching:
  - Always `w-64` (never `sidebar-collapsed w-16`)
  - Always show app title, nav labels, username, logout text
  - Always use `gap-3` / `justify-start gap-2` for nav and bottom sections

**`app/layout.tsx`**
- Remove `[&:has(.sidebar-collapsed)]:[--sidebar-width:4rem]` — sidebar is always 16rem

---

## 3. Hide Scrollbars Globally

### File to modify:

**`app/globals.css`**
- Add to `@layer base`:
  ```css
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  *::-webkit-scrollbar {
    display: none;
  }
  ```

Keeps scroll functionality intact while hiding the scrollbar UI across all browsers.

---

## 4. Reduce Border-Radius to 2-4px

### File to modify:

**`app/globals.css`** — add radius overrides to `@theme inline` block:

```css
--radius-sm: 0.125rem;   /* 2px */
--radius: 0.1875rem;     /* 3px */
--radius-md: 0.1875rem;  /* 3px */
--radius-lg: 0.25rem;    /* 4px */
--radius-xl: 0.3125rem;  /* 5px */
--radius-2xl: 0.375rem;  /* 6px */
--radius-3xl: 0.5rem;    /* 8px */
--radius-4xl: 0.625rem;  /* 10px */
```

No per-file changes needed — `rounded-*` classes pick up the new values automatically. `rounded-full` is unaffected (remains fully round for avatars, dots, etc.).

---

## Summary of Changes

| File | What Changes |
|------|-------------|
| `lib/calendar-context.tsx` | Remove `"ai-input"` from type; change default to `"day-view"` |
| `components/RightPanel.tsx` | Remove ~30 lines of AI input code; clean up handlers |
| `components/Sidebar.tsx` | Remove collapse button; remove `isCollapsed` branching |
| `components/OnboardingTour.tsx` | Remove ai-input tour step |
| `app/layout.tsx` | Simplify sidebar width CSS |
| `app/globals.css` | Add scrollbar hiding; reduce border-radius theme values |
