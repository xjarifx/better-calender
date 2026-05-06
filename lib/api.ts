export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  return res
}

// Server-side cookie getter (for use in Server Components/Actions)
export function getTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const cookies = parseCookieString(cookieHeader)
  return cookies['token'] || null
}

function parseCookieString(cookieString: string): Record<string, string> {
  return cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key) acc[key] = decodeURIComponent(value || '')
    return acc
  }, {} as Record<string, string>)
}

export const api = {
  async login(username: string, password: string) {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }
    return res.json()
  },

  async register(username: string, password: string) {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Registration failed')
    }
    return res.json()
  },

  async getEvents() {
    const res = await apiFetch('/api/events')
    if (!res.ok) throw new Error('Failed to fetch events')
    return res.json()
  },

  async createEvent(event: Record<string, unknown>) {
    const res = await apiFetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to create event')
    }
    return res.json()
  },

  async getEvent(id: string) {
    const res = await apiFetch(`/api/events/${id}`)
    if (!res.ok) throw new Error('Failed to fetch event')
    return res.json()
  },

  async updateEvent(id: string, event: Record<string, unknown>) {
    const res = await apiFetch(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to update event')
    }
    return res.json()
  },

  async deleteEvent(id: string) {
    const res = await apiFetch(`/api/events/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to delete event')
    }
    return true
  },

  async getFreeModels() {
    const res = await apiFetch('/api/ai/models')
    if (!res.ok) throw new Error('Failed to fetch models')
    return res.json()
  },

  async extractEvents(text: string, model: string) {
    const res = await apiFetch('/api/ai/extract', {
      method: 'POST',
      body: JSON.stringify({ text, model }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to extract events')
    }
    return res.json()
  },

  async getUserProfile() {
    const res = await apiFetch('/api/user')
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json()
  },

  async updateApiKey(apiKey: string | null) {
    const res = await apiFetch('/api/user', {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    })
    if (!res.ok) throw new Error('Failed to update API key')
    return res.json()
  },
}
