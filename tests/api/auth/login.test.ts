import { POST } from '@/app/api/auth/login/route'
import { getUserByUsername } from '@/lib/db-queries'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import type { User } from '@prisma/client'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db-queries')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

const mockGetUserByUsername = getUserByUsername as unknown as jest.Mock<() => Promise<User | null>>
const mockBcryptCompare = bcrypt.compare as unknown as jest.Mock<(password: string, hash: string) => Promise<boolean>>
const mockJwtSign = jwt.sign as unknown as jest.Mock<(payload: object, secret: string, options?: object) => string>

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if username or password is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Username and password required')
  })

  it('should return 401 if user not found', async () => {
    mockGetUserByUsername.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 401 if password is invalid', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
    }
    mockGetUserByUsername.mockResolvedValue(mockUser)
    mockBcryptCompare.mockResolvedValue(false)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'wrongpassword' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return user data and token on successful login', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
    }
    mockGetUserByUsername.mockResolvedValue(mockUser)
    mockBcryptCompare.mockResolvedValue(true)
    mockJwtSign.mockReturnValue('mock-token')

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe(1)
    expect(data.username).toBe('testuser')
    expect(data.token).toBe('mock-token')
  })

  it('should return 500 on internal server error', async () => {
    mockGetUserByUsername.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Login failed')
  })
})
