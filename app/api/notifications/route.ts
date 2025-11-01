import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      )
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { read: 'asc' }, // Non lues en premier
        { createdAt: 'desc' }, // Plus récentes en premier
      ],
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, userId, relatedId, relatedType } = body

    if (!type || !title || !message || !userId) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        relatedId,
        relatedType,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}

// PUT - Marquer une notification comme lue
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read } = body

    if (!id || read === undefined) {
      return NextResponse.json(
        { error: 'id et read sont requis' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une notification
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id est requis' },
        { status: 400 }
      )
    }

    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Notification supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    )
  }
}
