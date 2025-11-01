import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, date, endDate, location, capacity, ticketPrice, status, poleId } = body;

    // Validate required fields
    if (!name || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: name and date are required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        name,
        description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location,
        capacity,
        ticketPrice: ticketPrice || 0,
        status: status || 'DRAFT',
        poleId: poleId || null,
      },
      include: {
        pole: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            expenses: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
