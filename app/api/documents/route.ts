import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const listId = searchParams.get('listId')
    const category = searchParams.get('category')
    const expenseId = searchParams.get('expenseId')
    const eventId = searchParams.get('eventId')
    const partnerId = searchParams.get('partnerId')

    const where: any = {}

    if (listId) {
      where.listId = listId
    }

    if (category) {
      where.category = category
    }

    if (expenseId) {
      where.expenseId = expenseId
    }

    if (eventId) {
      where.eventId = eventId
    }

    if (partnerId) {
      where.partnerId = partnerId
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        expense: {
          select: {
            id: true,
            description: true,
            amount: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      fileName,
      fileUrl,
      mimeType,
      fileSize,
      category,
      description,
      expenseId,
      eventId,
      partnerId,
      listId,
      uploadedBy,
    } = body

    // Validate required fields
    if (!name || !fileName || !fileUrl || !mimeType || !fileSize || !category || !listId || !uploadedBy) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const document = await prisma.document.create({
      data: {
        name,
        fileName,
        fileUrl,
        mimeType,
        fileSize,
        category,
        description,
        expenseId,
        eventId,
        partnerId,
        listId,
        uploadedBy,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        expense: {
          select: {
            id: true,
            description: true,
            amount: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du document' },
      { status: 500 }
    )
  }
}
