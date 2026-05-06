# Frontend Development Guide - Better Calendar API

## Quick API Reference for Frontend Developers

### Base URL
- Development: `http://localhost:3000`
- Production: Update based on deployment

### Authentication Flow
1. **Register**: `POST /api/auth/register` → Store `token` in localStorage
2. **Login**: `POST /api/auth/login` → Store `token` in localStorage
3. **All API calls**: Include header `Authorization: Bearer <token>`
4. **Token expiry**: 7 days (handle 401 responses by redirecting to login)

### Key Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/events` | List all user events | Yes |
| POST | `/api/events` | Create new event | Yes |
| GET | `/api/events/:id` | Get single event | Yes |
| PUT | `/api/events/:id` | Update event | Yes |
| DELETE | `/api/events/:id` | Delete event | Yes |

### Event Data Structure

**All-Day Event** (no specific time):
```json
{
  "title": "Holiday",
  "startDate": "2026-05-15T00:00:00Z",
  "start_time": null,
  "end_time": null
}
```

**Timed Event** (with specific time):
```json
{
  "title": "Team Meeting",
  "startDate": "2026-05-10T00:00:00Z",
  "start_time": "2026-05-10T14:00:00Z",
  "end_time": "2026-05-10T15:30:00Z",
  "location": "Conference Room B",
  "description": "Weekly sync"
}
```

### Frontend Implementation Checklist

#### Authentication Pages
- [ ] Login page (`/login`) - username + password form
- [ ] Register page (`/register`) - username + password form
- [ ] Store JWT token after login/register
- [ ] Redirect to `/calendar` after successful auth
- [ ] Clear token and redirect to login on 401 errors

#### Calendar View (`/calendar`)
- [ ] Monthly/weekly calendar grid
- [ ] Display events as colored blocks
- [ ] Click event → view details
- [ ] Navigation: prev/next month, today button
- [ ] Fetch events: `GET /api/events` with auth header

#### Event Input Page (`/events/new`)
- [ ] Text area for pasting event notices
- [ ] "Extract Events" button (future: calls AI API)
- [ ] Form for manual event creation
- [ ] Required fields: title, startDate
- [ ] Optional fields: startTime, endTime, location, description

#### Event Management
- [ ] Create event: `POST /api/events`
- [ ] View event details: `GET /api/events/:id`
- [ ] Edit event: `PUT /api/events/:id`
- [ ] Delete event: `DELETE /api/events/:id`

### Error Handling

| Status Code | Meaning | Frontend Action |
|-------------|---------|-----------------|
| 400 | Bad request / missing fields | Show validation errors |
| 401 | Unauthorized | Clear token, redirect to login |
| 404 | Not found | Show "Not found" message |
| 409 | Conflict (duplicate username) | Show error on form |
| 500 | Server error | Show generic error message |

### Date/Time Format
- **Always use ISO 8601**: `2026-05-10T14:00:00Z`
- **All-day events**: Set `start_time` and `end_time` to `null` or omit them
- **Timed events**: Include full datetime in `start_time` and `end_time`

### LocalStorage Keys
```javascript
// Store these after login/register
localStorage.setItem('token', response.token)
localStorage.setItem('userId', response.id)
localStorage.setItem('username', response.username)

// Retrieve for API calls
const token = localStorage.getItem('token')
```

### API Call Example
```javascript
async function fetchEvents() {
  const token = localStorage.getItem('token')

  const response = await fetch('http://localhost:3000/api/events', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.clear()
    window.location.href = '/login'
    return
  }

  const events = await response.json()
  return events
}
```

### UI/UX Notes (from project docs)
- Calendar grid: monthly view with events as colored blocks
- Event colors: future enhancement (currently no categorization)
- Mobile: stack layout, simplified calendar view
- Desktop: optional side-by-side calendar and input panels
- Confirmation modal for AI-extracted events (future feature)

### Future Features (Not Yet Implemented)
- **AI Event Extraction**: `POST /api/ai/extract` - Send pasted text to OpenRouter API
- **Event Confirmation Modal**: Edit/delete extracted events before saving
- **Event Categories**: Color-coding by event type
