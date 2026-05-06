import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername } from '@/lib/db-queries'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      token,
    })

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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
