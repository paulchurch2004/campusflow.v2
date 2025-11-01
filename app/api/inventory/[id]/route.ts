import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

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

    // Check if inventory item exists and belongs to user's list
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!existingItem || existingItem.listId !== user.listId) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      quantity,
      unit,
      location,
      threshold,
      supplierId,
      unitPrice,
      lastRestocked,
      expiryDate,
      notes,
    } = body

    // Calculate status based on quantity and threshold
    let status = 'IN_STOCK'
    if (quantity === 0) {
      status = 'OUT_OF_STOCK'
    } else if (threshold && quantity <= threshold) {
      status = 'LOW_STOCK'
    } else if (expiryDate && new Date(expiryDate) < new Date()) {
      status = 'EXPIRED'
    }

    // Calculate total value
    const totalValue = unitPrice && quantity ? quantity * unitPrice : null

    // Update inventory item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: name || existingItem.name,
        description: description !== undefined ? description : existingItem.description,
        category: category || existingItem.category,
        quantity: quantity !== undefined ? parseInt(quantity) : existingItem.quantity,
        unit: unit || existingItem.unit,
        location: location !== undefined ? location : existingItem.location,
        threshold: threshold !== undefined ? (threshold ? parseInt(threshold) : null) : existingItem.threshold,
        supplierId: supplierId !== undefined ? (supplierId && supplierId !== 'none' ? supplierId : null) : existingItem.supplierId,
        unitPrice: unitPrice !== undefined ? (unitPrice ? parseFloat(unitPrice) : null) : existingItem.unitPrice,
        totalValue,
        lastRestocked: lastRestocked !== undefined ? (lastRestocked ? new Date(lastRestocked) : null) : existingItem.lastRestocked,
        expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : existingItem.expiryDate,
        status,
        notes: notes !== undefined ? notes : existingItem.notes,
      },
      include: {
        supplier: true,
      },
    })

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

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

    // Check if inventory item exists and belongs to user's list
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
    })

    if (!existingItem || existingItem.listId !== user.listId) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Delete inventory item
    await prisma.inventoryItem.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Inventory item deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
