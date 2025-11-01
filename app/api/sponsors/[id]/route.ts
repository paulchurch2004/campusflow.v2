import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
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

    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
    })

    if (!existingSponsor || existingSponsor.listId !== user.listId) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
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

    const updatedSponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        name: name || existingSponsor.name,
        logo: logo !== undefined ? logo : existingSponsor.logo,
        description: description !== undefined ? description : existingSponsor.description,
        level: level || existingSponsor.level,
        contactName: contactName !== undefined ? contactName : existingSponsor.contactName,
        contactEmail: contactEmail !== undefined ? contactEmail : existingSponsor.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : existingSponsor.contactPhone,
        website: website !== undefined ? website : existingSponsor.website,
        contractStart: contractStart !== undefined ? (contractStart ? new Date(contractStart) : null) : existingSponsor.contractStart,
        contractEnd: contractEnd !== undefined ? (contractEnd ? new Date(contractEnd) : null) : existingSponsor.contractEnd,
        amount: amount !== undefined ? parseFloat(amount) : existingSponsor.amount,
        status: status || existingSponsor.status,
        benefits: benefits !== undefined ? benefits : existingSponsor.benefits,
        benefitsStatus: benefitsStatus !== undefined ? benefitsStatus : existingSponsor.benefitsStatus,
        invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : existingSponsor.invoiceNumber,
        invoiceDate: invoiceDate !== undefined ? (invoiceDate ? new Date(invoiceDate) : null) : existingSponsor.invoiceDate,
        paymentStatus: paymentStatus || existingSponsor.paymentStatus,
        paymentDate: paymentDate !== undefined ? (paymentDate ? new Date(paymentDate) : null) : existingSponsor.paymentDate,
        notes: notes !== undefined ? notes : existingSponsor.notes,
      },
    })

    return NextResponse.json(updatedSponsor, { status: 200 })
  } catch (error) {
    console.error('Error updating sponsor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
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

    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
    })

    if (!existingSponsor || existingSponsor.listId !== user.listId) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
    }

    await prisma.sponsor.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Sponsor deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting sponsor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
