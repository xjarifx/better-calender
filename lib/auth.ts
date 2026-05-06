import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { getTokenFromCookie } from './api'

export interface AuthUser {
  userId: number
  username: string
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization')
  let token: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    token = getTokenFromCookie(request)
  }

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: number
      username: string
    }
    return { userId: decoded.userId, username: decoded.username }
  } catch {
    return null
  }
}

export async function getAuthUserAsync(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  let token: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    token = getTokenFromCookie(request)
  }

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: number
      username: string
      tokenVersion: number
    }

    const { prisma } = await import('./db')
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { tokenVersion: true, username: true },
    })

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return null
    }

    return { userId: decoded.userId, username: user.username }
  } catch {
    return null
  }
}
