import { POST } from '@/app/api/ai/extract/route'
import { getAuthUser } from '@/lib/auth'
import { getUserApiKey } from '@/lib/db-queries'
import { extractEvents } from '@/lib/openrouter'
import { NextRequest } from 'next/server'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/auth')
jest.mock('@/lib/db-queries')
jest.mock('@/lib/openrouter')

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>
const mockGetUserApiKey = getUserApiKey as jest.MockedFunction<typeof getUserApiKey>
const mockExtractEvents = extractEvents as jest.MockedFunction<typeof extractEvents>

function createRequest(body?: object): NextRequest {
  return new NextRequest('http://localhost/api/ai/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/ai/extract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUser.mockReturnValue(null)

    const request = createRequest({ text: 'Meeting at 3pm', model: 'test-model' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if text is missing', async () => {
    mockGetAuthUser.mockReturnValue({ userId: 1, username: 'testuser' })

    const request = createRequest({ model: 'test-model' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Text is required')
  })

  it('should return 400 if model is missing', async () => {
    mockGetAuthUser.mockReturnValue({ userId: 1, username: 'testuser' })

    const request = createRequest({ text: 'Meeting at 3pm' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Model is required')
  })

  it('should extract events successfully with user API key', async () => {
    mockGetAuthUser.mockReturnValue({ userId: 1, username: 'testuser' })
    mockGetUserApiKey.mockResolvedValue('sk-or-v1-user-key')
    mockExtractEvents.mockResolvedValue([
      { title: 'Meeting', startDate: '2026-05-10', startTime: '2026-05-10T15:00:00.000Z' },
    ])

    const request = createRequest({ text: 'Meeting at 3pm tomorrow', model: 'model-x' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.events).toHaveLength(1)
    expect(data.events[0].title).toBe('Meeting')
    expect(mockGetUserApiKey).toHaveBeenCalledWith(1)
    expect(mockExtractEvents).toHaveBeenCalledWith('Meeting at 3pm tomorrow', 'model-x', 'sk-or-v1-user-key')
  })

  it('should return 500 on extraction error', async () => {
    mockGetAuthUser.mockReturnValue({ userId: 1, username: 'testuser' })
    mockGetUserApiKey.mockResolvedValue(null)
    mockExtractEvents.mockRejectedValue(new Error('AI service unavailable'))

    const request = createRequest({ text: 'Meeting at 3pm', model: 'model-x' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('AI service unavailable')
  })
})
