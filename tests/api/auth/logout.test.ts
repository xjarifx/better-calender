import { POST } from '@/app/api/auth/logout/route'
import { NextRequest } from 'next/server'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 with success true', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should clear token cookie', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
    })

    const response = await POST(request)

    const setCookieHeader = response.headers.get('Set-Cookie') || ''
    expect(setCookieHeader).toContain('token=;')
    expect(setCookieHeader).toContain('Expires=Thu')
  })

  it('should clear all auth cookies', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
    })

    const response = await POST(request)

    const setCookieHeader = response.headers.get('Set-Cookie') || ''
    expect(setCookieHeader).toContain('token=;')
    expect(setCookieHeader).toContain('userId=;')
    expect(setCookieHeader).toContain('username=;')
  })
})
