import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    // If no session, return null
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(null, { status: 200 })
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
    })

    // If user not found, return null
    if (!user) {
      return NextResponse.json(null, { status: 200 })
    }

    // Return user data
    const response: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      listId: user.listId,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(null, { status: 200 })
  }
}
