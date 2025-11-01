import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyTreasurers } from '@/lib/notifications';
import { emitExpenseCreated } from '@/lib/socketEmit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const poleId = searchParams.get('poleId');
    const listId = searchParams.get('listId');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (poleId) {
      where.poleId = poleId;
    }

    if (listId) {
      where.listId = listId;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        pole: {
          select: {
            id: true,
            name: true,
            color: true,
            allocatedBudget: true,
            spentAmount: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            category: true,
            contact: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            status: true,
          },
        },
        validator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, category, notes, receipt, userId, poleId, listId, supplierId, eventId } = body;

    // Validate required fields
    if (!description || amount === undefined || !category || !userId || !poleId || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get pole information to check budget
    const pole = await prisma.pole.findUnique({
      where: { id: poleId },
    });

    if (!pole) {
      return NextResponse.json(
        { error: 'Pole not found' },
        { status: 404 }
      );
    }

    // Auto-approve if amount < 100 and budget available
    const budgetAvailable = pole.allocatedBudget - pole.spentAmount;
    const shouldAutoApprove = amount < 100 && budgetAvailable >= amount;

    const expenseData: any = {
      description,
      amount,
      category,
      notes,
      receipt,
      userId,
      poleId,
      listId,
      supplierId,
      eventId,
      status: shouldAutoApprove ? 'APPROVED' : 'PENDING',
    };

    if (shouldAutoApprove) {
      expenseData.validatedAt = new Date();
    }

    // Create expense and update pole in a transaction
    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: expenseData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          pole: {
            select: {
              id: true,
              name: true,
              color: true,
              allocatedBudget: true,
              spentAmount: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              category: true,
              contact: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              date: true,
              status: true,
            },
          },
        },
      });

      // Update pole spentAmount if auto-approved
      if (shouldAutoApprove) {
        await tx.pole.update({
          where: { id: poleId },
          data: {
            spentAmount: {
              increment: amount,
            },
          },
        });
      }

      return newExpense;
    });

    // Notifier les trésoriers de la nouvelle dépense (sauf si auto-approuvée)
    if (!shouldAutoApprove) {
      await notifyTreasurers(listId, {
        type: 'expense',
        title: 'Nouvelle dépense à valider',
        message: `${expense.user.name} a créé une dépense de ${amount}€ pour ${description}`,
        relatedId: expense.id,
        relatedType: 'expense',
      });
    }

    // Émettre l'événement Socket.io
    emitExpenseCreated(listId, expense);

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
