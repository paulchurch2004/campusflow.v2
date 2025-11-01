import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

// Generate a secure QR code string
function generateQRCode(ticketId: string, eventId: string, userId: string): string {
  const data = `${ticketId}-${eventId}-${userId}`;
  const hash = createHash('sha256').update(data).digest('hex');
  return `${ticketId}:${hash.substring(0, 16)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Billet introuvable' },
        { status: 404 }
      );
    }

    // Generate QR code if it doesn't exist
    let qrCode = ticket.qrCode;
    if (!qrCode) {
      qrCode = generateQRCode(ticket.id, ticket.eventId, ticket.userId);

      // Update ticket with QR code
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { qrCode },
      });
    }

    return NextResponse.json({
      qrCode,
      ticket: {
        id: ticket.id,
        eventName: ticket.event.name,
        userName: ticket.user.name,
        date: ticket.event.date,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du QR code' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        qrCode: true,
        event: {
          select: {
            name: true,
            date: true,
          },
        },
        user: {
          select: {
            name: true,
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

    // Generate QR code if it doesn't exist
    let qrCode = ticket.qrCode;
    if (!qrCode) {
      qrCode = generateQRCode(ticketId, '', '');
    }

    return NextResponse.json({
      qrCode,
      ticket: {
        id: ticket.id,
        eventName: ticket.event.name,
        userName: ticket.user.name,
        date: ticket.event.date,
      },
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du QR code' },
      { status: 500 }
    );
  }
}
