import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listId = searchParams.get('listId');

    const where: any = {};

    if (listId) {
      where.listId = listId;
    }

    const poles = await prisma.pole.findMany({
      where,
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
    });

    return NextResponse.json(poles);
  } catch (error) {
    console.error('Error fetching poles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, allocatedBudget, listId } = body;

    // Validate required fields
    if (!name || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields: name and listId are required' },
        { status: 400 }
      );
    }

    const pole = await prisma.pole.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        allocatedBudget: allocatedBudget || 0,
        spentAmount: 0,
        listId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
            events: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(pole, { status: 201 });
  } catch (error) {
    console.error('Error creating pole:', error);
    return NextResponse.json(
      { error: 'Failed to create pole' },
      { status: 500 }
    );
  }
}
