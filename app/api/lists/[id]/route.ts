import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        poles: {
          include: {
            _count: {
              select: {
                expenses: true,
                events: true,
                tasks: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        expenses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            pole: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
          orderBy: {
            requestedAt: 'desc',
          },
          take: 10,
        },
        events: {
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
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
        partners: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        suppliers: {
          include: {
            _count: {
              select: {
                expenses: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
                date: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;

    const list = await prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        _count: {
          select: {
            members: true,
            poles: true,
            expenses: true,
            events: true,
            partners: true,
            suppliers: true,
            tickets: true,
          },
        },
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
}
