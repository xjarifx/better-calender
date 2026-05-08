# REST API Reference

Base URL: `http://localhost:3000` (development) or your deployed URL.

## Authentication

The API supports two authentication methods:

**Bearer Token** — Include in request headers:
```
Authorization: Bearer <token>
```

**Cookies** — Set automatically on login/register (`token`, `userId`, `username`). The `/api/auth/me` endpoint uses cookies exclusively.

**Token Versioning** — Password changes increment `tokenVersion`, invalidating all existing JWTs. Clients must re-authenticate after a password change.

---

## Auth Endpoints

### `POST /api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "username": "johndoe",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
Also sets `token`, `userId`, and `username` cookies.

**Error Responses:**
| Status | Error |
|--------|-------|
| 400 | `Username and password required` |
| 409 | `Username already exists` |
| 500 | `Registration failed` (with `details`) |

---

### `POST /api/auth/login`

Authenticate with existing credentials.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
Also sets `token`, `userId`, and `username` cookies.

**Error Responses:**
| Status | Error |
|--------|-------|
| 400 | `Username and password required` |
| 401 | `Invalid credentials` |
| 500 | `Login failed` (with `details`) |

---

### `POST /api/auth/logout`

Clear authentication cookies.

**Success Response (200):**
```json
{
  "success": true
}
```
Clears `token`, `userId`, and `username` cookies.

---

### `GET /api/auth/me`

Get the currently authenticated user. Relies on the `token` cookie (not Bearer header).

**Success Response (200):**
```json
{
  "authenticated": true,
  "userId": 1,
  "username": "johndoe"
}
```

**Error Response (401):**
```json
{
  "authenticated": false
}
```

---

## Events Endpoints

All events endpoints require authentication. Events are scoped to the authenticated user.

### `GET /api/events`

List all events for the authenticated user, ordered by `startDate` ascending.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Success Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Team Standup",
    "start_date": "2026-05-11T00:00:00.000Z",
    "start_time": "2026-05-11T09:00:00.000Z",
    "end_date": null,
    "end_time": null,
    "location": "Conference Room B",
    "description": "Daily standup meeting",
    "created_at": "2026-05-10T12:00:00.000Z",
    "updated_at": "2026-05-10T12:00:00.000Z"
  }
]
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### `POST /api/events`

Create a new event.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Request Body:**
```json
{
  "title": "Team Standup",
  "startDate": "2026-05-11",
  "startTime": "2026-05-11T09:00:00.000Z",
  "endDate": "2026-05-11",
  "endTime": "2026-05-11T09:30:00.000Z",
  "location": "Conference Room B",
  "description": "Daily standup meeting"
}
```

All fields except `title` and `startDate` are optional.

- All-day event: omit `startTime` and `endTime`
- Multi-day event: set `endDate` to a different date than `startDate`
- Timed event: include `startTime` (and optionally `endTime`)

**Success Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Team Standup",
  "start_date": "2026-05-11T00:00:00.000Z",
  "start_time": "2026-05-11T09:00:00.000Z",
  "end_date": "2026-05-11T00:00:00.000Z",
  "end_time": "2026-05-11T09:30:00.000Z",
  "location": "Conference Room B",
  "description": "Daily standup meeting",
  "created_at": "2026-05-10T12:00:00.000Z",
  "updated_at": "2026-05-10T12:00:00.000Z"
}
```

**Error Responses:**
| Status | Error |
|--------|-------|
| 400 | `Title and start date required` |
| 401 | `Unauthorized` |
| 500 | `Failed to create event` |

---

### `GET /api/events/[id]`

Get a single event by ID.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Success Response (200):** Single event object (same shape as list response).

**Error Responses:**
| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `Event not found` |

---

### `PUT /api/events/[id]`

Update an existing event. Only provided fields are changed.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Request Body:** Same shape as create, but all fields are optional.

```json
{
  "title": "Updated Title",
  "location": "New Location"
}
```

**Success Response (200):** Updated event object.

**Error Responses:**
| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `Event not found` |
| 500 | `Failed to update event` |

---

### `DELETE /api/events/[id]`

Delete an event.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Success Response:** `204 No Content` (empty body).

**Error Responses:**
| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `Event not found` |
| 500 | `Failed to delete event` |

---

## User Endpoints

### `GET /api/user`

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Success Response (200):**
```json
{
  "username": "johndoe",
  "hasApiKey": true,
  "timeFormat": "12h",
  "firstDayOfWeek": 0
}
```

**Error Responses:**
| Status | Error |
|--------|-------|
| 401 | `Unauthorized` |
| 404 | `User not found` |
| 500 | `Failed to fetch user profile` |

---

### `PUT /api/user`

Update user profile fields. Multiple fields can be updated in a single request.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Request Body** (all fields optional):

```json
{
  "apiKey": "sk-or-v1-...",
  "timeFormat": "24h",
  "firstDayOfWeek": 1,
  "username": "newusername",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

| Field | Behavior |
|-------|----------|
| `apiKey` | Set your OpenRouter API key. Pass `null` to clear. Must start with `sk-or-` |
| `timeFormat` | `"12h"` or `"24h"` |
| `firstDayOfWeek` | Integer 0 (Sunday) through 6 (Saturday) |
| `username` | Change username (requires `currentPassword`) |
| `currentPassword` + `newPassword` | Change password. Returns a new `token` and updates the `token` cookie |

**Success Response (200):**
```json
{
  "success": true
}
```
When changing password, also includes:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
| Status | Error |
|--------|-------|
| 400 | Validation errors (invalid API key format, invalid time format, invalid first day of week, duplicate username, wrong password, etc.) |
| 401 | `Unauthorized` |

---

## AI Endpoints

### `GET /api/ai/models`

List free OpenRouter models (models with `prompt` and `completion` pricing equal to 0).

Requires `OPENROUTER_API_KEY` environment variable to be configured (no user auth needed, but uses server-side key).

**Success Response (200):**
```json
{
  "models": [
    {
      "id": "model-id",
      "name": "Model Name",
      "context": "128k",
      "description": "Model description"
    }
  ]
}
```

Models are sorted alphabetically by name.

**Error Responses:**
| Status | Error |
|--------|-------|
| 500 | `OPENROUTER_API_KEY is not configured` |
| 500 | Error message from OpenRouter or network failure |

---

### `POST /api/ai/extract`

Extract structured event data from natural language text using AI.

**Headers:** `Authorization: Bearer <token>` or auth cookies

**Request Body:**
```json
{
  "text": "Meeting with John on Friday at 3pm at Starbucks",
  "model": "openai/gpt-4o"
}
```

**Success Response (200):**
```json
{
  "events": [
    {
      "title": "Meeting with John",
      "startDate": "2026-05-09",
      "startTime": "2026-05-09T15:00:00.000Z",
      "location": "Starbucks"
    }
  ]
}
```

Uses the user's personal API key if configured (via settings), otherwise falls back to the server's `OPENROUTER_API_KEY` environment variable.

**Error Responses:**
| Status | Error |
|--------|-------|
| 400 | `Text is required` or `Model is required` |
| 401 | `Unauthorized` |
| 500 | Error from OpenRouter or AI extraction failure |

---

## Database Models

### User (`users`)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | Int | auto-increment | Primary key |
| username | VarChar(255) | — | Unique |
| password | VarChar(255) | — | bcrypt hashed |
| apiKey | VarChar(255)? | null | Personal OpenRouter API key |
| timeFormat | VarChar(10) | `"12h"` | `"12h"` or `"24h"` |
| firstDayOfWeek | Int | 0 | 0=Sunday, 6=Saturday |
| tokenVersion | Int | 0 | Incremented on password change |
| created_at | DateTime | now() | |

### Event (`events`)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| id | Int | auto-increment | Primary key |
| user_id | Int | — | Foreign key → users.id |
| title | VarChar(255) | — | |
| start_date | DateTime | — | Date portion (all-day) or full datetime |
| start_time | DateTime? | null | Full datetime when time is specified |
| end_date | DateTime? | null | For multi-day events |
| end_time | DateTime? | null | |
| location | Text? | null | |
| description | Text? | null | |
| created_at | DateTime | now() | |
| updated_at | DateTime | auto-updated | |
