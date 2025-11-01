import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

interface UserSession {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie || !sessionCookie.value) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        listId: true,
      },
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Session check error:', error)
    return null
  }
}

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
