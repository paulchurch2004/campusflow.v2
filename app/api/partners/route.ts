import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitPartnerCreated } from '@/lib/socketEmit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const listId = searchParams.get('listId');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (listId) {
      where.listId = listId;
    }

    const partners = await prisma.partner.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, contact, email, phone, website, logo, status, listId } = body;

    // Validate required fields
    if (!name || !category || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, and listId are required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        description,
        category,
        contact,
        email,
        phone,
        website,
        logo,
        status: status || 'active',
        listId,
      },
    });

    // Émettre l'événement Socket.io
    emitPartnerCreated(listId, partner);

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
