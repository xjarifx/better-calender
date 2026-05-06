import { GET, PUT, DELETE } from '@/app/api/events/[id]/route'
import { getAuthUser } from '@/lib/auth'
import {
  getEventById,
  updateEvent,
  deleteEvent,
} from '@/lib/db-queries'
import { NextRequest } from 'next/server'
import type { Event } from '@prisma/client'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.mock('@/lib/auth')
jest.mock('@/lib/db-queries')

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>
const mockGetEventById = getEventById as jest.MockedFunction<typeof getEventById>
const mockUpdateEvent = updateEvent as jest.MockedFunction<typeof updateEvent>
const mockDeleteEvent = deleteEvent as jest.MockedFunction<typeof deleteEvent>

const createMockContext = (id: string) => ({
  params: Promise.resolve({ id }),
})

describe('GET /api/events/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUser.mockReturnValue(null)

    const request = new NextRequest('http://localhost/api/events/1')
    const context = createMockContext('1')
    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 if event not found', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/events/999')
    const context = createMockContext('999')
    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Event not found')
  })

  it('should return event if found', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    const mockEvent: Event = {
      id: 1,
      title: 'Test Event',
      userId: 1,
      startDate: new Date('2024-01-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockResolvedValue(mockEvent)

    const request = new NextRequest('http://localhost/api/events/1')
    const context = createMockContext('1')
    const response = await GET(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe(1)
    expect(data.title).toBe('Test Event')
    expect(mockGetEventById).toHaveBeenCalledWith(1, 1)
  })
})

describe('PUT /api/events/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUser.mockReturnValue(null)

    const request = new NextRequest('http://localhost/api/events/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Event' }),
    })
    const context = createMockContext('1')
    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 if event not found', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/events/999', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Event' }),
    })
    const context = createMockContext('999')
    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Event not found')
  })

  it('should update event successfully', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    const existingEvent: Event = {
      id: 1,
      title: 'Old Event',
      userId: 1,
      startDate: new Date('2024-01-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updatedEvent: Event = {
      id: 1,
      title: 'Updated Event',
      userId: 1,
      startDate: new Date('2024-02-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockResolvedValue(existingEvent)
    mockUpdateEvent.mockResolvedValue(updatedEvent)

    const request = new NextRequest('http://localhost/api/events/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Event', startDate: '2024-02-01' }),
    })
    const context = createMockContext('1')
    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe(1)
    expect(data.title).toBe('Updated Event')
    expect(mockUpdateEvent).toHaveBeenCalledWith(1, 1, {
      title: 'Updated Event',
      startDate: new Date('2024-02-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: undefined,
      description: undefined,
    })
  })

  it('should return 500 on internal server error', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/events/1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Event' }),
    })
    const context = createMockContext('1')
    const response = await PUT(request, context)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update event')
  })
})

describe('DELETE /api/events/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetAuthUser.mockReturnValue(null)

    const request = new NextRequest('http://localhost/api/events/1', {
      method: 'DELETE',
    })
    const context = createMockContext('1')
    const response = await DELETE(request, context)

    expect(response.status).toBe(401)
  })

  it('should return 404 if event not found', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/events/999', {
      method: 'DELETE',
    })
    const context = createMockContext('999')
    const response = await DELETE(request, context)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Event not found')
  })

  it('should delete event successfully and return 204', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    const mockEvent: Event = {
      id: 1,
      title: 'Test Event',
      userId: 1,
      startDate: new Date('2024-01-01'),
      startTime: null,
      endDate: null,
      endTime: null,
      location: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockResolvedValue(mockEvent)
    mockDeleteEvent.mockResolvedValue(mockEvent)

    const request = new NextRequest('http://localhost/api/events/1', {
      method: 'DELETE',
    })
    const context = createMockContext('1')
    const response = await DELETE(request, context)

    expect(response.status).toBe(204)
    expect(mockDeleteEvent).toHaveBeenCalledWith(1, 1)
  })

  it('should return 500 on internal server error', async () => {
    const mockUser = { userId: 1, username: 'testuser' }
    mockGetAuthUser.mockReturnValue(mockUser)
    mockGetEventById.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/events/1', {
      method: 'DELETE',
    })
    const context = createMockContext('1')
    const response = await DELETE(request, context)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to delete event')
  })
})
