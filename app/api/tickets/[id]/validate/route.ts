import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const { validatedBy } = body;

    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Find the ticket with event and user details
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Billet introuvable' },
        { status: 404 }
      );
    }

    // Check if ticket is already used
    if (ticket.status === 'USED') {
      return NextResponse.json(
        {
          error: 'Billet déjà utilisé',
          usedAt: ticket.usedAt,
          ticket,
        },
        { status: 400 }
      );
    }

    // Check if ticket is cancelled
    if (ticket.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Billet annulé' },
        { status: 400 }
      );
    }

    // Check if event is cancelled
    if (ticket.event.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Événement annulé' },
        { status: 400 }
      );
    }

    // Validate the ticket - mark as USED
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'USED',
        usedAt: new Date(),
        validatedBy: validatedBy || null,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Billet validé avec succès',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation du billet' },
      { status: 500 }
    );
  }
}

// GET route to check ticket validity without validating it
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;

    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Billet introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ticket,
      isValid: ticket.status !== 'USED' && ticket.status !== 'CANCELLED',
      isUsed: ticket.status === 'USED',
      isCancelled: ticket.status === 'CANCELLED',
    });
  } catch (error) {
    console.error('Error checking ticket:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du billet' },
      { status: 500 }
    );
  }
}
