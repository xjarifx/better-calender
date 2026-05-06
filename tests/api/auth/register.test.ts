import { POST } from '@/app/api/auth/register/route'
import { createUser, getUserByUsername } from '@/lib/db-queries'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import type { User } from '@prisma/client'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/db-queries')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

const mockGetUserByUsername = getUserByUsername as unknown as jest.Mock<() => Promise<User | null>>
const mockCreateUser = createUser as unknown as jest.Mock<(username: string, password: string) => Promise<User>>
const mockBcryptHash = bcrypt.hash as unknown as jest.Mock<(password: string, salt: number) => Promise<string>>
const mockJwtSign = jwt.sign as unknown as jest.Mock<(payload: object, secret: string, options?: object) => string>

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if username or password is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Username and password required')
  })

  it('should return 409 if username already exists', async () => {
    const existingUser: User = {
      id: 1,
      username: 'testuser',
      password: 'hashed',
      createdAt: new Date(),
    }
    mockGetUserByUsername.mockResolvedValue(existingUser)

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Username already exists')
  })

  it('should create user and return token on successful registration', async () => {
    mockGetUserByUsername.mockResolvedValue(null)
    mockBcryptHash.mockResolvedValue('hashedpassword')
    
    const newUser: User = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
    }
    mockCreateUser.mockResolvedValue(newUser)
    mockJwtSign.mockReturnValue('mock-token')

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe(1)
    expect(data.username).toBe('testuser')
    expect(data.token).toBe('mock-token')
    expect(mockCreateUser).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('should return 500 on internal server error', async () => {
    mockGetUserByUsername.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Registration failed')
  })
})
