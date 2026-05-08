import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear all auth cookies
  response.cookies.delete('token')
  response.cookies.delete('userId')
  response.cookies.delete('username')
  
  return response
}
