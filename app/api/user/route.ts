import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getAuthUserAsync } from '@/lib/auth'
import { updateUserApiKey, updateUserPreferences, updateUsername, updatePassword, getUserPreferences } from '@/lib/db-queries'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const user = await getAuthUserAsync(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { id: user.userId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      username: dbUser.username,
      hasApiKey: !!dbUser.apiKey,
      timeFormat: dbUser.timeFormat,
      firstDayOfWeek: dbUser.firstDayOfWeek,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUserAsync(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { apiKey, timeFormat, firstDayOfWeek, username, currentPassword, newPassword } = body

    // Handle API key update
    if (apiKey !== undefined) {
      if (apiKey && typeof apiKey === 'string') {
        if (!apiKey.startsWith('sk-or-')) {
          return NextResponse.json(
            { error: 'Invalid API key format. OpenRouter keys start with "sk-or-"' },
            { status: 400 }
          )
        }
      }
      await updateUserApiKey(user.userId, apiKey || null)
    }

    // Handle preferences update
    if (timeFormat !== undefined || firstDayOfWeek !== undefined) {
      if (timeFormat && !['12h', '24h'].includes(timeFormat)) {
        return NextResponse.json({ error: 'Invalid time format' }, { status: 400 })
      }
      if (firstDayOfWeek !== undefined && (firstDayOfWeek < 0 || firstDayOfWeek > 6)) {
        return NextResponse.json({ error: 'Invalid first day of week' }, { status: 400 })
      }
      await updateUserPreferences(user.userId, { timeFormat, firstDayOfWeek })
    }

    // Handle username change
    if (username !== undefined && currentPassword) {
      await updateUsername(user.userId, username, currentPassword)
    }

    // Handle password change
    if (newPassword && currentPassword) {
      const newTokenVersion = await updatePassword(user.userId, currentPassword, newPassword)

      // Generate new token with updated tokenVersion
      const token = jwt.sign(
        { userId: user.userId, username: username || user.username, tokenVersion: newTokenVersion },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      )

      const response = NextResponse.json({ success: true, token })
      response.cookies.set('token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      return response
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
