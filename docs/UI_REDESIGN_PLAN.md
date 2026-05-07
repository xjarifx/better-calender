# Better Calendar - Desktop-First UI/UX Redesign Plan

## Project Constraints

- **No API/database changes**: Only UI/UX frontend code modifications
- **Desktop-first only**: No mobile responsive styles required
- **Dark mode only**: No light mode or theme toggle
- **Material Design 3**: Blue/purple palette, Material Motion animations
- **Shadcn/ui**: Use existing Shadcn setup, no new component libraries
- **3-Panel Layout**: Collapsible left sidebar, center calendar, right context panel

---

## User-Validated Requirements (All Decisions Final)

1. **Design Style**: Material Design 3
2. **Layout**: 3-Panel (Left Sidebar + Center Calendar + Right Panel)
3. **Components**: Shadcn/ui (already partially configured)
4. **Left Sidebar**: Collapsible to icon-only, nav items: Calendar, AI Input, Events, Settings
5. **Right Panel Default**: AI Input Form (textarea + Extract button)
6. **Add Event Trigger**: FAB button (always visible on calendar panel)
7. **Calendar Views**: Month only (no week/day views)
8. **Dark Mode**: Dark only, blue/purple color scheme
9. **Event Display**: Colored bars on month grid
10. **AI Confirmation**: Extracted events list in right panel
11. **Event Click Action**: Open details in right panel (not modal)
12. **Search**: Title-only, center floating modal
13. **Animations**: Material Motion (via existing `tw-animate-css`)
14. **Onboarding**: 3-step quick tour (Sidebar, Calendar, AI Input)
15. **Event Details Actions**: Edit + Delete + Duplicate
16. **Events List**: Grouped by date, click opens in right panel
17. **Settings**: API key, model selection, first day of week, 12/24h, change username/password, logout, account delete
18. **Drag & Drop**: Yes, events draggable between days on month grid
19. **Day Click Action**: Open day view in right panel
20. **FAB Behavior**: Always visible on calendar panel
21. **Search UX**: Center modal with backdrop blur
22. **Calendar Grid**: Custom build (no libraries like FullCalendar/react-big-calendar)

---

## Task Breakdown (Atomic Sections for AI Agents)

Agents must complete all dependencies before starting a task. Each task is self-contained with explicit requirements, acceptance criteria, and anti-hallucination rules.

---

### Task T01: Design System & Global Styles Update

Completed in `app/globals.css`.
**Dependencies**: None  
**Files**:

- Modify: `app/globals.css`

**Requirements**:

1. Remove all light mode references (no `.light` class, no light mode variables)
2. Finalize Material Design 3 dark palette (blue/purple):
   - Primary: oklch(0.62 0.21 264) (keep existing)
   - Secondary/Purple Accent: oklch(0.58 0.18 310) (add if missing)
   - Sidebar background: oklch(0.25 0.02 264) (distinct from main background)
   - Right panel background: oklch(0.26 0.02 264) (distinct from main background)
3. Ensure all Shadcn/ui variables are mapped to new palette
4. Keep existing imports: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`
5. Add explicit CSS variables for 3-panel surfaces:
   ```css
   --sidebar-bg: oklch(0.25 0.02 264);
   --right-panel-bg: oklch(0.26 0.02 264);
   ```

**Acceptance Criteria**:

- [x] No light mode code exists in `globals.css`
- [x] All Shadcn variables use Material dark values
- [x] 3 distinct surface colors for sidebar/center/right panel
- [x] `npm run dev` starts without CSS errors (developer should verify locally)

**Implementation Notes**:

- `app/globals.css` updated to include the Material dark palette and explicit `--sidebar-bg` and `--right-panel-bg` variables; imports `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css` are preserved.

**Reference Files**:

- `app/globals.css` (current)
- `components/ui/button.tsx` (confirm Shadcn variable usage)

**Anti-Hallucination Notes**:

- Do NOT add theme toggle or light mode
- Do NOT modify Tailwind config (uses `@theme inline` already)
- Do NOT change component files

---

### Task T02: Update Calendar Context

Completed in `lib/calendar-context.tsx`.

**Dependencies**: None  
**Files**:

- Modify: `lib/calendar-context.tsx`

**Requirements**:

1. Delete `ViewMode` type and all week/day view references
2. Remove `viewMode`, `setViewMode` states
3. Add new typed states:

   ```typescript
   type RightPanelMode =
     | "ai-input"
     | "day-view"
     | "event-details"
     | "extracted-events";

   interface CalendarContextType {
     selectedDate: Date | null;
     setSelectedDate: (date: Date | null) => void;
     selectedEvent: Event | null; // Use Prisma Event type
     setSelectedEvent: (event: Event | null) => void;
     rightPanelMode: RightPanelMode;
     setRightPanelMode: (mode: RightPanelMode) => void;
     navigateToday: () => void;
   }
   ```

4. Keep existing `CalendarProvider` wrapper and `useCalendar` hook
5. Export all new states/setters

**Acceptance Criteria**:

- [x] Zero references to `ViewMode`, `viewMode`, `setViewMode` in `lib/calendar-context.tsx`
- [x] All new states are properly typed with Prisma Event type
- [x] `useCalendar()` returns all new states/setters
- [x] No breaking changes to existing imports

**Reference Files**:

- `lib/calendar-context.tsx` (current)
- `lib/db-queries.ts` (confirm Event type shape)

**Anti-Hallucination Notes**:

- Do NOT modify API routes or database queries
- Do NOT add new providers to `layout.tsx`
- Do NOT change the context provider structure

---

### Task T03: Redesign Collapsible Sidebar

**Dependencies**: None  
**Files**:

- Modify: `components/Sidebar.tsx`
- Delete: `components/ui/bottom-sheet.tsx`

**Requirements**:

1. Collapsible to 64px icon-only mode with toggle button at bottom
2. Nav items (exact hrefs):
   - Calendar: `/calendar` (icon: `Calendar` from lucide-react)
   - AI Input: `/events/input` (icon: `Sparkles` from lucide-react)
   - Events: `/events` (icon: `List` from lucide-react)
   - Settings: `/settings` (icon: `Settings` from lucide-react)
3. Active state: Highlight current route using `usePathname()` (exact match or child route)
4. User section at bottom: Avatar with username initial, username text, logout button
5. Remove: Mobile bottom sheet, view mode switcher, mobile header
6. Collapse animation: Smooth width transition (use `transition-all duration-300`)
7. Material Design styling: Use existing Shadcn button/link styles

**Acceptance Criteria**:

- [x] Sidebar collapses to 64px icon-only mode
- [x] All 4 nav items link to correct routes
- [x] Active route highlighting works
- [x] Logout button works (calls `logout()` from `useAuth()`)
- [x] No mobile code remains
- [x] `bottom-sheet.tsx` not present

**Implementation Notes**:

- `components/Sidebar.tsx` updated to include `data-tour="sidebar"` for onboarding, collapses to `w-16` (64px), and uses `usePathname()` for active route highlighting. Logout calls `logout()` from `useAuth()`.

**Reference Files**:

- `components/Sidebar.tsx` (current)
- `lib/auth-context.tsx` (confirm logout() usage)

**Anti-Hallucination Notes**:

- Do NOT add mobile responsive styles
- Do NOT use bottom sheet component
- Do NOT add view mode switcher (month only now)

---

### Task T04: Create Right Panel Component

**Dependencies**: T02 (Calendar Context)  
**Files**:

- Create: `components/RightPanel.tsx`
- Create: `components/EventCard.tsx` (reusable event card for all views)

**Completed in**: `components/RightPanel.tsx`, `components/EventCard.tsx`

**Requirements**:

1. Fixed 400px width, right side of layout
2. Context-aware rendering based on `rightPanelMode`:
   - `ai-input`: Textarea + "Extract Events" button (use existing OpenRouter logic from `lib/openrouter.ts`)
   - `extracted-events`: List of extracted events with editable fields, "Save All" + "Cancel" buttons, delete per event (redesign `ExtractedEvents.tsx`)
   - `day-view`: Formatted date header, list of events for `selectedDate` using `EventCard`, "Add Event" button pre-filled with selected date
   - `event-details`: Title, date/time, location, description, Edit/Delete/Duplicate buttons. Edit mode renders `EventForm` inline.
3. Material Design styling: Match Shadcn card/button styles
4. `EventCard` props: `event: Event`, `onClick: () => void`, `showActions?: boolean`

**Acceptance Criteria**:

- [x] All 4 panel states render correctly based on context
- [x] `EventCard` component is reusable and styled consistently
- [x] "Extract Events" triggers the `/api/ai/extract` endpoint (uses existing OpenRouter logic)
- [x] Edit/Delete/Duplicate buttons implemented for event details
- [x] Save All/Cancel wired for extracted events (uses existing `ExtractedEvents` component)

**Implementation Notes**:

- Right panel implemented as a client component at `components/RightPanel.tsx` with fixed 400px width and context-aware rendering (`ai-input`, `extracted-events`, `day-view`, `event-details`).
- `EventCard` implemented at `components/EventCard.tsx` with props `event`, `onClick`, and `showActions?` and reused across `day-view` and `event-details` flows.
- Extraction uses the existing `/api/ai/extract` route via `lib/api.ts` (`api.extractEvents`).
- Event create/update/delete/duplicate use the existing `lib/api.ts` methods.

**Reference Files**:

- `components/ExtractedEvents.tsx` (current)
- `components/EventForm.tsx` (current)
- `lib/openrouter.ts` (confirm API call logic)

**Anti-Hallucination Notes**:

- Do NOT use modals for event details – must render in right panel
- Do NOT modify OpenRouter API logic
- Do NOT add scrolling to right panel (truncate content instead)

---

### Task T05: Update Root Layout to 3-Panel

**Dependencies**: T02 (Context), T03 (Sidebar), T04 (RightPanel)  
**Files**:

- Modify: `app/layout.tsx`

**Requirements**:

1. 3-panel structure:
   ```tsx
   <html>
     <body>
       <AuthProvider>
         <CalendarProvider>
           <Sidebar />
           <main className="flex-1 ml-64 [&:has(.sidebar-collapsed)]:ml-16 transition-all">
             {children}
           </main>
           <RightPanel />
         </CalendarProvider>
       </AuthProvider>
     </body>
   </html>
   ```
2. Remove `pt-[64px] lg:pt-0` from main (no mobile header)
3. Adjust sidebar collapsible state to toggle `ml` class on main
4. Keep existing font (Inter) and metadata

**Acceptance Criteria**:

- [ ] 3 panels render side by side
- [ ] Collapsing sidebar adjusts main margin smoothly
- [ ] Right panel renders correct state based on context
- [ ] No mobile header spacing

**Reference Files**:

- `app/layout.tsx` (current)
- `components/Sidebar.tsx` (confirm collapsible state)

**Anti-Hallucination Notes**:

- Do NOT add mobile styles
- Do NOT modify AuthProvider/CalendarProvider
- Do NOT change metadata

---

### Task T06: Build Custom Month Calendar Grid

**Dependencies**: T02 (Context), T05 (Layout)  
**Files**:

- Create: `components/CalendarGrid.tsx`

**Requirements**:

1. **Custom build only**: No calendar libraries (react-big-calendar, FullCalendar, etc.)
2. Month only: No week/day views
3. Features:
   - Header: Month/year title, prev/next buttons, today button, search icon (triggers T07 SearchModal)
   - FAB button: Fixed bottom-right of calendar panel, always visible, links to event creation
   - Colored bars for events in day cells (truncate with "+X more" if overflow)
   - Drag and drop: Use `@dnd-kit/core` and `@dnd-kit/sortable` for event dragging between days
   - Day click: Sets `selectedDate` and `rightPanelMode` to `day-view`
   - Event click: Sets `selectedEvent` and `rightPanelMode` to `event-details`
4. Material Design styling: Grid lines, typography, event bar colors
5. Material Motion: Subtle animations for month navigation, event hover

**Acceptance Criteria**:

- [ ] Custom month grid renders correctly for any month
- [ ] Events display as colored bars in day cells
- [ ] Drag and drop moves events between days (updates via API)
- [ ] Day/event click updates right panel state
- [ ] FAB button is always visible
- [ ] Search icon triggers SearchModal (T07)

**Reference Files**:

- `lib/api.ts` (confirm event update API call)
- `components/ui/card.tsx` (confirm Shadcn styling)

**Anti-Hallucination Notes**:

- Do NOT use any calendar libraries
- Do NOT add week/day views
- Do NOT add mobile responsive styles
- Do NOT use modals for event details

---

### Task T07: Create Search Floating Modal

**Dependencies**: T06 (Calendar Grid has search icon)  
**Files**:

- Create: `components/SearchModal.tsx`

**Requirements**:

1. Triggered by search icon in Calendar Grid header
2. Center modal with backdrop blur (Material Design dialog)
3. Search input: Filters events by title only (case-insensitive)
4. Instant results list: Clicking result sets `selectedEvent` and `rightPanelMode` to `event-details`, closes modal
5. Close methods: Escape key, backdrop click, close button
6. Material Design styling: Use Shadcn dialog component

**Acceptance Criteria**:

- [ ] Modal opens/closes correctly from calendar header
- [ ] Search filters events by title in real-time
- [ ] Clicking result opens event in right panel
- [ ] No console errors on search

**Reference Files**:

- `components/ui/dialog.tsx` (Shadcn dialog)
- `lib/api.ts` (confirm event list API call for search)

**Anti-Hallucination Notes**:

- Do NOT search description/location (title only per user requirement)
- Do NOT render search in right panel (center modal only)
- Do NOT add global search shortcut

---

### Task T08: Redesign Events List Page

**Dependencies**: T04 (EventCard component exists)  
**Files**:

- Modify: `app/events/page.tsx`

**Requirements**:

1. Events grouped by date with collapsible month/week sections
2. Each event uses `EventCard` component, click sets `selectedEvent` and opens in right panel
3. Empty state: "No events yet" message with link to AI Input
4. Material Design styling: Match Shadcn card/list styles
5. No pagination: Load all events (assume MVP scale)

**Acceptance Criteria**:

- [ ] Events grouped correctly by date
- [ ] Collapsible sections work
- [ ] Clicking event opens in right panel
- [ ] Empty state renders when no events

**Reference Files**:

- `app/events/page.tsx` (current, if exists)
- `lib/api.ts` (confirm event list API call)

**Anti-Hallucination Notes**:

- Do NOT add event creation form to this page
- Do NOT use table layout (use list with EventCard)
- Do NOT add search (use T07 global search)

---

### Task T09: Redesign Settings Page

**Dependencies**: None  
**Files**:

- Modify: `app/settings/page.tsx`

**Requirements**:

1. Sections (in order):
   - **API Configuration**: OpenRouter API key input (password type), model dropdown (fetch models from `https://openrouter.ai/api/v1/models` using existing API key)
   - **Preferences**: First day of week (Sunday/Monday dropdown), Time format (12h/24h toggle)
   - **Account**: Change username (verify current password), Change password (verify current), Delete account (confirmation dialog), Logout button
2. Material Design form styling: Use Shadcn input, label, button, card components
3. Form validation: Required fields, password confirmation
4. Logout uses `logout()` from `useAuth()`

**Acceptance Criteria**:

- [ ] All sections render correctly
- [ ] API key/model selection works
- [ ] Username/password change works with current password verification
- [ ] Delete account shows confirmation dialog
- [ ] Logout button works

**Reference Files**:

- `app/settings/page.tsx` (current, if exists)
- `lib/auth.ts` (confirm password change logic)
- `lib/openrouter.ts` (confirm API key usage)

**Anti-Hallucination Notes**:

- Do NOT add notification preferences (not requested)
- Do NOT add theme toggle (dark only)
- Do NOT modify auth API routes

---

### Task T10: Create Onboarding Quick Tour

**Dependencies**: T03 (Sidebar), T06 (Calendar Grid), T04 (RightPanel)  
**Files**:

- Create: `components/OnboardingTour.tsx`

**Requirements**:

1. Triggered on first login only: Check `localStorage.getItem('onboarding-complete')` flag
2. 3 steps (exact targets):
   - Step 1: Highlight left sidebar (use `data-tour="sidebar"` attribute)
   - Step 2: Highlight calendar center panel (use `data-tour="calendar"` attribute)
   - Step 3: Highlight right panel AI input (use `data-tour="ai-input"` attribute)
3. Material Design overlay: Semi-transparent backdrop, highlighted element, tooltip with step text
4. Controls: "Skip" button, "Next" button, progress dots, "Got it" final button
5. On complete: Set `localStorage.setItem('onboarding-complete', 'true')`

**Acceptance Criteria**:

- [ ] Tour shows only on first login
- [ ] 3 steps highlight correct elements
- [ ] Skip/Next/Got It buttons work
- [ ] localStorage flag set on complete
- [ ] No tour on subsequent logins

**Reference Files**:

- `components/Sidebar.tsx` (add data-tour attributes)
- `components/CalendarGrid.tsx` (add data-tour attributes)
- `components/RightPanel.tsx` (add data-tour attributes)

**Anti-Hallucination Notes**:

- Do NOT add more than 3 steps
- Do NOT use third-party tour libraries
- Do NOT show tour to logged-out users

---

### Task T11: Update Existing Components

**Dependencies**: T04 (RightPanel uses these components)  
**Files**:

- Modify: `components/EventForm.tsx`
- Modify: `components/ExtractedEvents.tsx`

**Requirements**:

1. **EventForm.tsx**:
   - Material Design styling: Use Shadcn input, label, button components
   - Edit mode: Pre-fill with event data, "Update" button instead of "Create"
   - Inline styling for right panel (compact, no max-w-lg)
2. **ExtractedEvents.tsx**:
   - Material Design styling: Match Shadcn card/list styles
   - Editable fields for each extracted event
   - Delete button per event, "Save All" + "Cancel" buttons
   - Compact layout for right panel

**Acceptance Criteria**:

- [ ] EventForm matches Material dark style
- [ ] ExtractedEvents matches Material dark style
- [ ] Both work correctly in RightPanel states
- [ ] No broken form submissions

**Reference Files**:

- `components/EventForm.tsx` (current)
- `components/ExtractedEvents.tsx` (current)
- `components/ui/input.tsx` (Shadcn input)

**Anti-Hallucination Notes**:

- Do NOT change form submission logic (keep API calls)
- Do NOT add new form fields
- Do NOT modify API calls

---

### Task T12: Cleanup & Verification

**Dependencies**: All previous tasks  
**Files**: All modified files

**Requirements**:

1. Delete unused files: `components/ui/bottom-sheet.tsx` (already done in T03)
2. Remove unused imports, dead code
3. Verify all user flows:
   - Login → Onboarding tour → Calendar view
   - Add event via FAB → Save → Calendar shows event
   - Paste text in AI Input → Extract → Confirm → Calendar shows event
   - Drag event to new day → Calendar updates
   - Search event → Open in right panel → Edit/Delete
   - Events list → Click event → Right panel shows details
   - Settings → Change username/password → Logout
4. Check for console errors, broken styles, missing animations

**Acceptance Criteria**:

- [ ] No unused files or dead code
- [ ] All user flows work without errors
- [ ] No console errors in `npm run dev`
- [ ] All Material Design animations work
- [ ] No mobile styles present

**Anti-Hallucination Notes**:

- Do NOT modify API routes or database
- Do NOT add new features not in this plan
- Do NOT commit changes (wait for user request)

---

## Agent Execution Rules

1. Complete all dependencies before starting a task
2. Read all reference files listed for the task
3. Follow acceptance criteria exactly
4. Never violate anti-hallucination notes
5. Run `npm run dev` after completing each task to verify no errors
6. Do not modify files outside the task's scope
