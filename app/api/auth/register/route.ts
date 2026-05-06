import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByUsername } from '@/lib/db-queries'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }

    const user = await createUser(username, password)
    const token = jwt.sign(
      { userId: user.id, username: user.username, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      token,
    }, { status: 201 })

    // Set cookies for persistent auth
    response.cookies.set('token', token, {
      httpOnly: false, // Allow JavaScript access for client-side
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    response.cookies.set('username', user.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.cookies.set('userId', String(user.id), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
