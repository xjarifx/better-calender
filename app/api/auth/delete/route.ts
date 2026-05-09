import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/auth'
import { deleteUser } from '@/lib/db-queries'

export async function DELETE(request: NextRequest) {
  const user = await getAuthUserAsync(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteUser(user.userId)

    const response = NextResponse.json({ success: true })
    response.cookies.delete('token')
    response.cookies.delete('userId')
    response.cookies.delete('username')

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Account deletion failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
