# Better Calendar — AI Agent Guide

## Project Overview
Better Calendar is an AI-powered calendar application built with Next.js 16.2.4 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL with Prisma ORM 7.8.0 (driver adapters), and OpenRouter AI integration.

## Tech Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM 7.8.0 (driver adapter)
- **Auth**: Username/password with bcrypt + JWT (Bearer + cookie dual-mode)
- **AI**: OpenRouter API
- **Testing**: Jest + ts-jest
- **Utilities**: date-fns, lucide-react, @dnd-kit/core, @base-ui/react

## Project Structure
```
better-calender/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST — User login (sets cookies + returns token)
│   │   │   ├── register/route.ts   # POST — User registration (sets cookies + returns token)
│   │   │   ├── logout/route.ts     # POST — Clears auth cookies
│   │   │   └── me/route.ts         # GET — Current user from cookie
│   │   ├── events/
│   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   └── [id]/route.ts       # GET, PUT, DELETE single event
│   │   ├── user/route.ts           # GET (profile), PUT (apiKey, preferences, username, password)
│   │   └── ai/
│   │       ├── models/route.ts     # GET — Free OpenRouter models (pricing = 0)
│   │       └── extract/route.ts    # POST — AI event extraction from natural language
│   ├── calendar/page.tsx           # Calendar view
│   ├── events/
│   │   ├── page.tsx                # Event list
│   │   ├── [id]/page.tsx           # Event detail/edit
│   │   └── input/page.tsx          # AI natural language input
│   ├── settings/page.tsx           # User settings (API key, preferences, password)
│   ├── api-docs/page.tsx           # API documentation page
│   ├── login/page.tsx              # Login page
│   ├── register/page.tsx           # Registration page
│   ├── layout.tsx                  # Root layout with metadata
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   │   ├── button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx
│   │   ├── alert.tsx, badge.tsx, loading.tsx
│   ├── CalendarGrid.tsx            # Calendar grid with dnd-kit
│   ├── EventCard.tsx               # Event display card
│   ├── EventForm.tsx               # Event create/edit form
│   ├── ExtractedEvents.tsx         # AI extraction result display
│   ├── Sidebar.tsx                 # Desktop sidebar
│   ├── MobileNav.tsx               # Mobile bottom nav
│   ├── RightPanel.tsx              # Event detail panel
│   ├── SearchModal.tsx             # Event search
│   └── EmptyStatePet.tsx           # Empty state illustration
├── hooks/
│   └── use-swipe.ts                # Touch swipe handler
├── lib/
│   ├── db.ts                       # Prisma client singleton (PrismaPg adapter)
│   ├── db-queries.ts               # All database query functions
│   ├── auth.ts                     # JWT auth helpers (sync + async, Bearer + cookie)
│   ├── api.ts                      # Client-side fetch wrapper + cookie parser
│   ├── openrouter.ts               # OpenRouter event extraction logic
│   └── utils.ts                    # cn() utility (clsx + tailwind-merge)
├── prisma/
│   ├── schema.prisma               # Database schema (users, events)
│   └── migrations/                 # Database migrations
├── tests/
│   ├── setup.ts                    # Jest setup with module mocks
│   └── api/
│       ├── auth/                   # login, register, logout, me tests
│       ├── events/                 # events list + single event tests
│       ├── user/                   # user profile tests
│       └── ai/                     # models + extract tests
├── docs/                           # API documentation
├── proxy.ts                        # Auth middleware (redirects unauthenticated page requests)
├── prisma.config.ts                # Prisma CLI configuration
├── CLAUDE.md                       # Points to AGENTS.md
├── AGENTS.md                       # This file
├── .env.example                    # Environment variables template
├── .github/workflows/ci.yml        # CI pipeline
├── jest.config.js                  # Jest configuration
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

## Database Schema

### `users` Table
```prisma
model users {
  id             Int      @id @default(autoincrement())
  username       String   @unique @db.VarChar(255)
  password       String   @db.VarChar(255)
  apiKey         String?  @db.VarChar(255)
  timeFormat     String   @default("12h") @db.VarChar(10)
  firstDayOfWeek Int      @default(0)
  tokenVersion   Int      @default(0)
  created_at     DateTime @default(now())
  events         events[]
}
```

### `events` Table
```prisma
model events {
  id          Int      @id @default(autoincrement())
  user_id     Int
  title       String   @db.VarChar(255)
  start_date  DateTime
  start_time  DateTime?
  end_date    DateTime?
  end_time    DateTime?
  location    String?
  description String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  users       users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

## Environment Variables (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/better_calendar?sslmode=require&sslaccept=accept_invalid_certs"
OPENROUTER_API_KEY="sk-or-v1-..."
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_APP_URL="https://better-calendar-one.vercel.app"
```

## Common Commands
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run test` — Run all tests (Jest)
- `npm run test:watch` — Run tests in watch mode
- `npm run lint` — Run ESLint
- `npm run db:generate` — Generate Prisma client
- `npm run db:push` — Push schema to DB (no migration)
- `npm run db:migrate` — Run pending migrations
- `npm run db:studio` — Open Prisma Studio

## Important Notes

- **Next.js Version**: This uses Next.js 16.2.4 which may have breaking changes from your training data. Check `node_modules/next/dist/docs/` if unsure.
- **Prisma Version**: Uses Prisma 7.8.0 with `@prisma/adapter-pg` driver adapter. The client requires an `adapter` in constructor (see `lib/db.ts`).
- **Prisma Config**: Use `prisma.config.ts` for Prisma CLI (needed for adapter-based setups). Run `npx prisma migrate dev` via `npm run db:migrate`.
- **Authentication**: Dual-mode auth — Bearer header (`Authorization: Bearer <token>`) AND HTTP-only cookies (`token`, `userId`, `username`). The `getAuthUser()` (sync) and `getAuthUserAsync()` (async with DB verification) helpers in `lib/auth.ts` check Bearer first, then fall back to cookies.
- **Token Versioning**: Each user has a `tokenVersion` (default 0). Password change increments it, invalidating all existing JWTs. The async `getAuthUserAsync()` verifies the token's `tokenVersion` matches the DB.
- **Auth Middleware**: `proxy.ts` handles page-route auth — redirects unauthenticated users to `/login`. API routes handle their own auth via `getAuthUser`.
- **Database**: Each user only sees their own events (userId filtering in all queries).
- **Date Handling**: Events support all-day events (no time) or timed events with start/end times. Multi-day events supported via `endDate`.
- **Testing**: 56 tests covering all 9 API route files. Uses jest.mock for Prisma, bcrypt, JWT. Tests in `tests/api/` organized by route.
- **API Client**: `lib/api.ts` provides both `apiFetch()` for raw requests and an `api` object with typed methods. The `getTokenFromCookie()` parser is used server-side.

## Development Workflow
1. Copy `.env.example` to `.env` and configure DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY, NEXT_PUBLIC_APP_URL
2. Run `npm install` (postinstall generates Prisma client)
3. Run `npm run db:migrate` to apply database migrations
4. Run `npm run dev` to start the development server
5. API routes are in `app/api/` using Next.js route handlers
6. Database queries are in `lib/db-queries.ts`
7. Auth helpers are in `lib/auth.ts`
8. Client API helpers are in `lib/api.ts`
9. Add tests in `tests/api/` for any new route
