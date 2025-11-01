import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitPartnerUpdated, emitPartnerDeleted } from '@/lib/socketEmit';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, category, contact, email, phone, website, logo, status } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name and category are required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.update({
      where: { id: params.id },
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
      },
    });

    // Émettre l'événement Socket.io
    emitPartnerUpdated(partner.listId, partner);

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le partenaire avant suppression pour avoir le listId
    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      select: { listId: true },
    });

    await prisma.partner.delete({
      where: { id: params.id },
    });

    // Émettre l'événement Socket.io
    if (partner) {
      emitPartnerDeleted(partner.listId, params.id);
    }

    return NextResponse.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
