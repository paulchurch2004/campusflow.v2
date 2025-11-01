import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcryptjs from 'bcryptjs'
import { prisma } from '@/lib/prisma'

interface LoginRequest {
  email: string
  password: string
}

interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LoginRequest = await request.json()

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(body.password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
