import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');
    const listId = searchParams.get('listId');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (listId) {
      where.listId = listId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            endDate: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, paymentStatus, price, userId, eventId, listId } = body;

    // Validate required fields
    if (!userId || !eventId || !listId || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, eventId, listId, and price are required' },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        status: status || 'RESERVED',
        paymentStatus: paymentStatus || 'PENDING',
        price,
        userId,
        eventId,
        listId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            endDate: true,
            location: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
