import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

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

    // Get all inventory items for this list
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { listId: user.listId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(inventoryItems, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Validate required fields
    if (!name || !category || quantity === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and quantity are required' },
        { status: 400 }
      )
    }

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
    const totalValue = unitPrice ? quantity * unitPrice : null

    // Create inventory item
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        name,
        description: description || null,
        category,
        quantity: parseInt(quantity),
        unit: unit || 'unité',
        location: location || null,
        threshold: threshold ? parseInt(threshold) : null,
        supplierId: supplierId && supplierId !== 'none' ? supplierId : null,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        totalValue,
        lastRestocked: lastRestocked ? new Date(lastRestocked) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status,
        notes: notes || null,
        listId: user.listId,
      },
      include: {
        supplier: true,
      },
    })

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
