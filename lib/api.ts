const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function setAuth(token: string, userId: number, username: string) {
  localStorage.setItem('token', token)
  localStorage.setItem('userId', String(userId))
  localStorage.setItem('username', username)
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  return res
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
}
