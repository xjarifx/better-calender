import { GET, PUT } from '@/app/api/user/route'
import { getAuthUserAsync } from '@/lib/auth'
import { updateUserApiKey, updateUserPreferences, updateUsername, updatePassword } from '@/lib/db-queries'
import { prisma } from '@/lib/db'
import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/auth')
jest.mock('@/lib/db-queries')
jest.mock('@/lib/db', () => ({
  prisma: {
    users: { findUnique: jest.fn() },
    events: { findMany: jest.fn(), findFirst: jest.fn() },
  },
}))
jest.mock('jsonwebtoken')

const mockGetAuthUserAsync = getAuthUserAsync as jest.MockedFunction<typeof getAuthUserAsync>
const mockUpdateUserApiKey = updateUserApiKey as jest.MockedFunction<typeof updateUserApiKey>
const mockUpdateUserPreferences = updateUserPreferences as jest.MockedFunction<typeof updateUserPreferences>
const mockUpdateUsername = updateUsername as jest.MockedFunction<typeof updateUsername>
const mockUpdatePassword = updatePassword as jest.MockedFunction<typeof updatePassword>
const mockPrismaUsersFindUnique = prisma.users.findUnique as jest.Mock
const mockJwtSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>

function createAuthedRequest(method: string, body?: object, headers?: Record<string, string>): NextRequest {
  const h = new Headers({ 'Content-Type': 'application/json', ...headers })
  return new NextRequest('http://localhost/api/user', {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('GET /api/user', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUserAsync.mockResolvedValue(null)

    const request = createAuthedRequest('GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 200 with user profile', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockPrismaUsersFindUnique.mockResolvedValue({
      username: 'testuser',
      apiKey: 'sk-or-v1-xxx',
      timeFormat: '12h',
      firstDayOfWeek: 0,
    })

    const request = createAuthedRequest('GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.username).toBe('testuser')
    expect(data.hasApiKey).toBe(true)
    expect(data.timeFormat).toBe('12h')
    expect(data.firstDayOfWeek).toBe(0)
  })

  it('should return 404 if user not found in DB', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockPrismaUsersFindUnique.mockResolvedValue(null)

    const request = createAuthedRequest('GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return hasApiKey false when apiKey is null', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockPrismaUsersFindUnique.mockResolvedValue({
      username: 'testuser',
      apiKey: null,
      timeFormat: '24h',
      firstDayOfWeek: 1,
    })

    const request = createAuthedRequest('GET')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hasApiKey).toBe(false)
  })
})

describe('PUT /api/user', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUserAsync.mockResolvedValue(null)

    const request = createAuthedRequest('PUT', { apiKey: 'sk-or-v1-xxx' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should update API key successfully', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdateUserApiKey.mockResolvedValue({} as any)

    const request = createAuthedRequest('PUT', { apiKey: 'sk-or-v1-newkey' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdateUserApiKey).toHaveBeenCalledWith(1, 'sk-or-v1-newkey')
  })

  it('should return 400 for invalid API key format', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })

    const request = createAuthedRequest('PUT', { apiKey: 'invalid-key' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid API key format')
  })

  it('should clear API key when null is passed', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdateUserApiKey.mockResolvedValue({} as any)

    const request = createAuthedRequest('PUT', { apiKey: null })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdateUserApiKey).toHaveBeenCalledWith(1, null)
  })

  it('should update timeFormat preference', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdateUserPreferences.mockResolvedValue()

    const request = createAuthedRequest('PUT', { timeFormat: '24h' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdateUserPreferences).toHaveBeenCalledWith(1, { timeFormat: '24h' })
  })

  it('should update firstDayOfWeek preference', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdateUserPreferences.mockResolvedValue()

    const request = createAuthedRequest('PUT', { firstDayOfWeek: 1 })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdateUserPreferences).toHaveBeenCalledWith(1, { firstDayOfWeek: 1 })
  })

  it('should return 400 for invalid timeFormat', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })

    const request = createAuthedRequest('PUT', { timeFormat: 'invalid' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid time format')
  })

  it('should return 400 for invalid firstDayOfWeek', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })

    const request = createAuthedRequest('PUT', { firstDayOfWeek: 7 })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid first day of week')
  })

  it('should update username with current password', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdateUsername.mockResolvedValue()

    const request = createAuthedRequest('PUT', {
      username: 'newuser',
      currentPassword: 'oldpass',
    })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdateUsername).toHaveBeenCalledWith(1, 'newuser', 'oldpass')
  })

  it('should update password and return new token', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdatePassword.mockResolvedValue(2)
    mockJwtSign.mockReturnValue('new-token')

    const request = createAuthedRequest('PUT', {
      currentPassword: 'oldpass',
      newPassword: 'newpass',
    })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.token).toBe('new-token')
    expect(mockUpdatePassword).toHaveBeenCalledWith(1, 'oldpass', 'newpass')
    expect(mockJwtSign).toHaveBeenCalledWith(
      { userId: 1, username: 'testuser', tokenVersion: 2 },
      expect.any(String),
      expect.objectContaining({ expiresIn: '7d' })
    )
  })

  it('should handle db-queries errors returning 400', async () => {
    mockGetAuthUserAsync.mockResolvedValue({ userId: 1, username: 'testuser' })
    mockUpdateUserApiKey.mockRejectedValue(new Error('DB constraint violation'))

    const request = createAuthedRequest('PUT', { apiKey: 'sk-or-v1-xxx' })
    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('DB constraint violation')
  })
})
