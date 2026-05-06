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
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      id: user.id,
      username: user.username,
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
