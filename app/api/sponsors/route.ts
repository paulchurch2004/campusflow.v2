import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
    })

    if (!user || !user.listId) {
      return NextResponse.json({ error: 'User not found or no list assigned' }, { status: 404 })
    }

    const sponsors = await prisma.sponsor.findMany({
      where: { listId: user.listId },
      orderBy: [
        { level: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(sponsors, { status: 200 })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
    })

    if (!user || !user.listId) {
      return NextResponse.json({ error: 'User not found or no list assigned' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      logo,
      description,
      level,
      contactName,
      contactEmail,
      contactPhone,
      website,
      contractStart,
      contractEnd,
      amount,
      status,
      benefits,
      benefitsStatus,
      invoiceNumber,
      invoiceDate,
      paymentStatus,
      paymentDate,
      notes,
    } = body

    if (!name || !level) {
      return NextResponse.json({ error: 'Name and level are required' }, { status: 400 })
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logo: logo || null,
        description: description || null,
        level,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        website: website || null,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        amount: amount ? parseFloat(amount) : 0,
        status: status || 'ACTIVE',
        benefits: benefits || null,
        benefitsStatus: benefitsStatus || null,
        invoiceNumber: invoiceNumber || null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        paymentStatus: paymentStatus || 'PENDING',
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        notes: notes || null,
        listId: user.listId,
      },
    })

    return NextResponse.json(sponsor, { status: 201 })
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
