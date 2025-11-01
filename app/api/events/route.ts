import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const listId = searchParams.get('listId');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (listId) {
      where.listId = listId;
    }

    const events = await prisma.event.findMany({
      where,
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
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, date, endDate, location, capacity, ticketPrice, status, poleId, listId } = body;

    // Validate required fields
    if (!name || !date || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, date, and listId are required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location,
        capacity,
        ticketPrice: ticketPrice || 0,
        status: status || 'DRAFT',
        poleId,
        listId,
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
