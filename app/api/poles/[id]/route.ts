import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const data = await request.json()

    const pole = await prisma.pole.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        allocatedBudget: data.allocatedBudget,
      },
    })

    return NextResponse.json(pole)
  } catch (error) {
    console.error('Error updating pole:', error)
    return NextResponse.json(
      { error: 'Failed to update pole' },
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

    await prisma.pole.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pole:', error)
    return NextResponse.json(
      { error: 'Failed to delete pole' },
      { status: 500 }
    )
  }
}
