import { GET } from '@/app/api/auth/me/route'
import { getUserById } from '@/lib/db-queries'
import * as jwt from 'jsonwebtoken'
import type { users } from '@prisma/client'
import { NextRequest } from 'next/server'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db-queries')

const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>
const mockJwtVerify = jwt.verify as jest.Mock

function createRequestWithCookie(token?: string): NextRequest {
  const headers = new Headers()
  if (token) {
    headers.set('Cookie', `token=${token}`)
  }
  return new NextRequest('http://localhost/api/auth/me', { headers })
}

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if no token cookie', async () => {
    const request = createRequestWithCookie()

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.authenticated).toBe(false)
  })

  it('should return 401 if token is invalid', async () => {
    mockJwtVerify.mockImplementation(() => {
      throw new Error('Invalid token')
    })

    const request = createRequestWithCookie('invalid-token')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.authenticated).toBe(false)
  })

  it('should return 401 if user no longer exists', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockJwtVerify.mockReturnValue({ userId: 1, username: 'testuser' } as any)
    mockGetUserById.mockResolvedValue(null)

    const request = createRequestWithCookie('valid-token')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.authenticated).toBe(false)
    expect(mockGetUserById).toHaveBeenCalledWith(1)
  })

  it('should return 200 with user data if authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockJwtVerify.mockReturnValue({ userId: 1, username: 'testuser' } as any)
    mockGetUserById.mockResolvedValue({ id: 1, username: 'testuser' } as unknown as users)

    const request = createRequestWithCookie('valid-token')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.authenticated).toBe(true)
    expect(data.userId).toBe(1)
    expect(data.username).toBe('testuser')
  })
})
