import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For now, return the default list
    // In production, you'd get this from the user's session
    const list = await prisma.list.findFirst({
      where: {
        id: 'default-list',
      },
    })

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    )
  }
}
