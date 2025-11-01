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

    const suppliers = await prisma.supplier.findMany({
      where,
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
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, contact, email, phone, address, listId } = body;

    // Validate required fields
    if (!name || !category || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, and listId are required' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        category,
        contact,
        email,
        phone,
        address,
        listId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
