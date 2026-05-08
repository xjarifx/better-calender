# Better Calendar

An AI-powered calendar application built with Next.js 16, TypeScript, and PostgreSQL. Create, manage, and extract events using natural language processing with OpenRouter AI integration.

## Features

- **User Authentication** — Secure registration and login with JWT tokens (Bearer header + HTTP-only cookies)
- **Event Management** — Create, read, update, and delete events
- **All-Day & Timed Events** — Support for both all-day events and events with specific times
- **Multi-Day Events** — Create events that span multiple days
- **AI Event Extraction** — Extract structured event data from natural language text using AI
- **Personal API Keys** — Users can configure their own OpenRouter API keys
- **Responsive Design** — Built with Tailwind CSS for a modern, responsive UI
- **Calendar View** — Visual calendar with drag-and-drop (dnd-kit), monthly/weekly views (react-big-calendar)
- **Token Invalidation** — Password changes invalidate existing sessions via token versioning

## Tech Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui + lucide-react
- **Database**: PostgreSQL with Prisma ORM 7.8.0 (driver adapters)
- **Authentication**: Username/password with bcrypt + JWT (Bearer + cookie dual-mode)
- **AI Integration**: OpenRouter API (server key + optional per-user keys)
- **UI Components**: @base-ui/react, react-big-calendar, @dnd-kit/core
- **Testing**: Jest + ts-jest
- **Utilities**: date-fns, class-variance-authority, clsx, tailwind-merge

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenRouter API key (for AI features)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd better-calender
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/better_calendar?sslmode=require&sslaccept=accept_invalid_certs"
OPENROUTER_API_KEY="sk-or-v1-..."
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
npm run db:migrate
```

Or run a fresh migration:

```bash
npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` — Start development server with Turbopack
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run test` — Run test suite (Jest)
- `npm run test:watch` — Run tests in watch mode
- `npm run lint` — Run ESLint
- `npm run db:generate` — Generate Prisma client
- `npm run db:push` — Push schema to database (no migration)
- `npm run db:migrate` — Run Prisma migrations
- `npm run db:studio` — Open Prisma Studio (database GUI)

## Project Structure

```
better-calender/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST — User login
│   │   │   ├── register/route.ts   # POST — User registration
│   │   │   ├── logout/route.ts     # POST — Clear auth cookies
│   │   │   └── me/route.ts         # GET — Current user info
│   │   ├── events/
│   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   └── [id]/route.ts      # GET, PUT, DELETE single event
│   │   ├── user/route.ts           # GET (profile), PUT (update)
│   │   └── ai/
│   │       ├── models/route.ts     # GET — Free OpenRouter models
│   │       └── extract/route.ts    # POST — AI event extraction
│   ├── calendar/page.tsx           # Calendar view
│   ├── events/
│   │   ├── page.tsx                # Event list
│   │   ├── [id]/page.tsx           # Event detail
│   │   └── input/page.tsx          # AI event input
│   ├── settings/page.tsx           # User settings
│   ├── api-docs/page.tsx           # API documentation page
│   ├── login/page.tsx              # Login page
│   ├── register/page.tsx           # Registration page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx, card.tsx, dialog.tsx, input.tsx, ...
│   ├── CalendarGrid.tsx            # Calendar grid component
│   ├── EventCard.tsx               # Event card component
│   ├── EventForm.tsx               # Event create/edit form
│   ├── ExtractedEvents.tsx         # AI-extracted events display
│   ├── Sidebar.tsx                 # Sidebar navigation
│   ├── MobileNav.tsx               # Mobile navigation
│   ├── RightPanel.tsx              # Right info panel
│   ├── SearchModal.tsx             # Event search modal
│   └── EmptyStatePet.tsx           # Empty state illustration
├── hooks/
│   └── use-swipe.ts                # Swipe gesture hook
├── lib/
│   ├── db.ts                       # Prisma client singleton (driver adapter)
│   ├── db-queries.ts               # Database query functions
│   ├── auth.ts                     # JWT authentication (Bearer + cookie)
│   ├── api.ts                      # Client-side API helpers + cookie parser
│   ├── openrouter.ts               # OpenRouter AI integration
│   └── utils.ts                    # Utility functions (cn)
├── prisma/
│   ├── schema.prisma               # Database schema (users, events)
│   └── migrations/                 # Database migrations
├── tests/
│   ├── setup.ts                    # Jest setup + mocks
│   └── api/
│       ├── auth/                   # Auth route tests
│       ├── events/                 # Events route tests
│       ├── user/                   # User profile route tests
│       └── ai/                     # AI route tests
├── docs/                           # API documentation
├── proxy.ts                        # Auth middleware (redirects)
├── prisma.config.ts                # Prisma CLI configuration
├── CLAUDE.md                       # AI agent shortcut (→ AGENTS.md)
├── AGENTS.md                       # AI agent instructions
└── .github/workflows/ci.yml        # CI pipeline
```

## API Overview

The application provides a RESTful API for authentication, event management, and AI features. See [REST API Reference](docs/REST_API_REFERENCE.md) for full documentation.

### Key Endpoints

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Events**: `GET /api/events`, `POST /api/events`, `GET /api/events/[id]`, `PUT /api/events/[id]`, `DELETE /api/events/[id]`
- **User**: `GET /api/user`, `PUT /api/user`
- **AI**: `GET /api/ai/models`, `POST /api/ai/extract`

## Database Schema

### User Model (`users`)

| Field | Type | Default |
|---|---|---|
| id | Int (auto-increment) | — |
| username | VARCHAR(255) unique | — |
| password | VARCHAR(255) (hashed) | — |
| apiKey | VARCHAR(255) nullable | — |
| timeFormat | VARCHAR(10) | `"12h"` |
| firstDayOfWeek | Int | `0` (Sunday) |
| tokenVersion | Int | `0` |
| createdAt | DateTime | `now()` |

### Event Model (`events`)

| Field | Type | Notes |
|---|---|---|
| id | Int (auto-increment) | — |
| userId | Int | Foreign key → users.id |
| title | VARCHAR(255) | — |
| startDate | DateTime | Required |
| startTime | DateTime? | Nullable (all-day if null) |
| endDate | DateTime? | Nullable |
| endTime | DateTime? | Nullable |
| location | Text? | — |
| description | Text? | — |
| createdAt | DateTime | `now()` |
| updatedAt | DateTime | Auto-updated |

## Authentication

The application supports dual-mode authentication:

- **Bearer token** — `Authorization: Bearer <token>` header for API calls
- **HTTP-only cookies** — `token`, `userId`, `username` cookies set on login/register
- **Token versioning** — Changing password increments `tokenVersion`, invalidating existing sessions
- **Auth middleware** (`proxy.ts`) — Redirects unauthenticated users to `/login` for page routes; API routes self-authenticate via `getAuthUser()`

Each user can only access their own events (scoped by `userId` in all queries).

## AI Features

### Event Extraction

Users can input natural language text and the AI extracts structured event information:

```
Input: "Meeting with John on Friday at 3pm at Starbucks"
Output: [{
  "title": "Meeting with John",
  "startDate": "2026-05-09",
  "startTime": "2026-05-09T15:00:00.000Z",
  "location": "Starbucks"
}]
```

Powered by OpenRouter. Users can use the server's default API key or configure their own in Settings.

## Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Run in watch mode
```

Tests are in `tests/api/` organized by route, using Jest with mocked Prisma, bcrypt, and JWT. There are currently 56 tests covering all API routes.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright © 2026 Better Calendar. All rights reserved.

This software and associated documentation files (the "Software") are proprietary and confidential. Unauthorized copying, distribution, modification, or use of this Software, via any medium, is strictly prohibited.

The Software is provided "AS IS", without warranty of any kind, express or implied. The authors or copyright holders shall not be liable for any claim, damages, or other liability arising from the use of the Software.

For licensing inquiries, please contact the project maintainers.

**Status**: Beta version — Subject to change without notice.
