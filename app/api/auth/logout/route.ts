import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.delete('session')

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
