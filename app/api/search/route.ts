import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'expense' | 'event' | 'partner' | 'user'
  url: string
  metadata?: string
}

interface GroupedResults {
  expenses: SearchResult[]
  events: SearchResult[]
  partners: SearchResult[]
  users: SearchResult[]
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    // If no session, return unauthorized
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user to check listId
    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
    })

    if (!user || !user.listId) {
      return NextResponse.json(
        { error: 'User not found or no list assigned' },
        { status: 404 }
      )
    }

    // Get search query
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        expenses: [],
        events: [],
        partners: [],
        users: [],
      })
    }

    const searchTerm = query.trim()
    const listId = user.listId

    // Search in parallel for better performance
    const [expenses, events, partners, users] = await Promise.all([
      // Search expenses
      prisma.expense.findMany({
        where: {
          listId,
          OR: [
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
            { notes: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          pole: { select: { name: true } },
        },
      }),

      // Search events
      prisma.event.findMany({
        where: {
          listId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          pole: { select: { name: true } },
        },
      }),

      // Search partners
      prisma.partner.findMany({
        where: {
          listId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
            { contact: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),

      // Search users
      prisma.user.findMany({
        where: {
          listId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),
    ])

    // Format results
    const results: GroupedResults = {
      expenses: expenses.map((expense) => ({
        id: expense.id,
        title: expense.description,
        subtitle: `${expense.amount.toFixed(2)} € - ${expense.user.name}`,
        type: 'expense' as const,
        url: `/dashboard/treasury?expense=${expense.id}`,
        metadata: `${expense.pole.name} • ${expense.category}`,
      })),

      events: events.map((event) => ({
        id: event.id,
        title: event.name,
        subtitle: event.location || undefined,
        type: 'event' as const,
        url: `/dashboard/events?event=${event.id}`,
        metadata: `${new Date(event.date).toLocaleDateString('fr-FR')}${event.pole ? ` • ${event.pole.name}` : ''}`,
      })),

      partners: partners.map((partner) => ({
        id: partner.id,
        title: partner.name,
        subtitle: partner.contact || partner.email || undefined,
        type: 'partner' as const,
        url: `/dashboard/partners?partner=${partner.id}`,
        metadata: partner.category,
      })),

      users: users.map((userItem) => ({
        id: userItem.id,
        title: userItem.name,
        subtitle: userItem.email,
        type: 'user' as const,
        url: `/dashboard/teams?user=${userItem.id}`,
        metadata: formatRole(userItem.role),
      })),
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatRole(role: string): string {
  const roleNames: Record<string, string> = {
    PRESIDENT: 'Président',
    VICE_PRESIDENT: 'Vice-Président',
    TREASURER: 'Trésorier',
    SECRETARY: 'Secrétaire',
    POLE_LEADER: 'Chef de Pôle',
    MEMBER: 'Membre',
  }
  return roleNames[role] || role
}
