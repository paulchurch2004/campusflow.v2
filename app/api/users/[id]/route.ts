import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { emitTeamMemberUpdated, emitTeamMemberRemoved } from '@/lib/socketEmit'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const data = await request.json()

    const updateData: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    }

    // Only hash and update password if provided
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10)
      updateData.password = hashedPassword
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        listId: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Émettre l'événement Socket.io si l'utilisateur appartient à une liste
    if (user.listId) {
      emitTeamMemberUpdated(user.listId, user)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Récupérer l'utilisateur avant suppression pour avoir le listId
    const user = await prisma.user.findUnique({
      where: { id },
      select: { listId: true },
    })

    await prisma.user.delete({
      where: { id },
    })

    // Émettre l'événement Socket.io si l'utilisateur appartenait à une liste
    if (user?.listId) {
      emitTeamMemberRemoved(user.listId, id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
