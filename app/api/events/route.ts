import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createEvent, getEventsByUserId } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events = await getEventsByUserId(user.userId)
  return NextResponse.json(events)
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, startDate, startTime, endDate, endTime, location, description } = body

    if (!title || !startDate) {
      return NextResponse.json({ error: 'Title and start date required' }, { status: 400 })
    }

    const event = await createEvent({
      userId: user.userId,
      title,
      startDate: new Date(startDate),
      startTime: startTime ? new Date(startTime) : null,
      endDate: endDate ? new Date(endDate) : null,
      endTime: endTime ? new Date(endTime) : null,
      location,
      description,
    })

    return NextResponse.json(event, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
