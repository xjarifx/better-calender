import { GET, POST } from '@/app/api/events/route'
import { getAuthUser } from '@/lib/auth'
import {
  getEventsByUserId,
  createEvent,
} from '@/lib/db-queries'
import { NextRequest } from 'next/server'
import type { Event } from '@prisma/client'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/auth')
jest.mock('@/lib/db-queries')

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>
const mockGetEventsByUserId = getEventsByUserId as jest.MockedFunction<typeof getEventsByUserId>
const mockCreateEvent = createEvent as jest.MockedFunction<typeof createEvent>

describe('GET /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUser.mockReturnValue(null)

    const request = new NextRequest('http://localhost/api/events')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return events for authenticated user', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    const mockEvents: Event[] = [
      { id: 1, title: 'Event 1', userId: 1, startDate: new Date('2024-01-01'), startTime: null, endDate: null, endTime: null, location: null, description: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, title: 'Event 2', userId: 1, startDate: new Date('2024-01-02'), startTime: null, endDate: null, endTime: null, location: null, description: null, createdAt: new Date(), updatedAt: new Date() },
    ]
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventsByUserId.mockResolvedValue(mockEvents)

    const request = new NextRequest('http://localhost/api/events')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data[0].id).toBe(1)
    expect(data[0].title).toBe('Event 1')
    expect(mockGetEventsByUserId).toHaveBeenCalledWith(1)
  })
})

describe('POST /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUser.mockReturnValue(null)

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Event', startDate: '2024-01-01' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if title or startDate is missing', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ startDate: '2024-01-01' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Title and start date required')
  })

  it('should create event successfully', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    const mockEvent: Event = {
      id: 1,
      title: 'Test Event',
      startDate: new Date('2024-01-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: 'Test Location',
      description: 'Test Description',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockCreateEvent.mockResolvedValue(mockEvent)

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Event',
        startDate: '2024-01-01',
        location: 'Test Location',
        description: 'Test Description',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe(1)
    expect(data.title).toBe('Test Event')
    expect(mockCreateEvent).toHaveBeenCalledWith({
      userId: 1,
      title: 'Test Event',
      startDate: new Date('2024-01-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: 'Test Location',
      description: 'Test Description',
    })
  })

  it('should return 500 on internal server error', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockCreateEvent.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Event', startDate: '2024-01-01' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create event')
  })
})
