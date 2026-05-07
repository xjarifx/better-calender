# Calendar Grid Improvement Plan

## 1. Fix First Day of Week

### Problem
`weekStartsOn` is hardcoded to `0` (Sunday) in three places:
- `startOfWeek(monthStart, { weekStartsOn: 0 })` (line 291)
- `endOfWeek(monthEnd, { weekStartsOn: 0 })` (line 292)
- Day headers `["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]` (line 470)

User preference `firstDayOfWeek` already exists in settings and is persisted via API, but CalendarGrid never loads it.

### Fix

**`lib/calendar-context.tsx`:**
- Add `firstDayOfWeek: number` (0-6) to the context type
- Add `setFirstDayOfWeek` setter
- Default to `0` (Sunday)
- On provider mount, call `api.getUserProfile()` and set `firstDayOfWeek`

**`components/CalendarGrid.tsx`:**
- Read `firstDayOfWeek` from context
- Use it in `startOfWeek()` and `endOfWeek()` calls
- Generate day header labels dynamically by slicing/rotating a base array based on `firstDayOfWeek`

**`app/settings/page.tsx`:**
- After saving preferences, update context's `firstDayOfWeek` for immediate effect

---

## 2. Remove Event Label Hover Animation

### Fix
In `SortableEventBar` (line 217):
- Remove `hover:-translate-y-0.5 hover:shadow-md`
- Simplify `transition-all duration-200` to just `transition-transform duration-200`

---

## 3. Increase Event Label Height

### Fix
In `SortableEventBar` (line 217):
- Change `py-1` (4px) to `py-1.5` (6px) for more readable, easier-to-click labels

---

## 4. Date Cell Adaptive Height

### Problem
- `min-h-[140px]` hardcoded (line 152)
- `events.slice(0, 3)` hardcoded max (line 136)

### Fix
- Use a ref on the calendar grid container
- On mount and resize, calculate:
  ```
  gridHeight = window.innerHeight - header(~88px) - dayHeaders(~44px) - padding(~48px)
  weekCount = ceil(monthDays.length / 7)
  cellHeight = gridHeight / weekCount
  ```
- Apply `style={{ height: cellHeight }}` to DayCell (replacing `min-h-[140px]`)
- Calculate max visible events:
  ```
  labelHeight = ~28px  (text + padding + gap)
  overhead = ~28px     (date number + padding)
  maxVisible = Math.floor((cellHeight - overhead) / labelHeight)
  ```
- Show `+N more` when events exceed maxVisible

---

## 5. Click Date Cell → Right Sidebar

Already works — `handleDayClick` sets `selectedDate`, `selectedEvent=null`, `rightPanelMode="day-view"`. No changes needed.

---

## 6. Random Color Algorithm for Event Labels

### Problem
Fixed 5-color palette limits variety.

### Fix
Replace `eventPalette` array with algorithmic HSL generation:

```tsx
function getEventColor(title: string) {
  const hue = hashString(title) % 360;
  return {
    borderColor: `hsl(${hue}, 55%, 50%)`,
    backgroundColor: `hsla(${hue}, 55%, 50%, 0.15)`,
    color: `hsl(${hue}, 55%, 80%)`,
  };
}
```

Apply via inline `style` prop on SortableEventBar. Each event title gets a unique hue distributed across the full 360° color wheel — no palette cap.

---

## Files Changed

| File | Changes |
|------|---------|
| `lib/calendar-context.tsx` | Add `firstDayOfWeek` state; load from API on mount |
| `components/CalendarGrid.tsx` | Fix week start; remove hover; increase label height; dynamic cell height; HSL color algorithm |
| `app/settings/page.tsx` | Sync firstDayOfWeek to context after save |
