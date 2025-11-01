import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExpenseNotification } from '@/lib/notifications';
import { emitExpenseUpdated, emitExpenseDeleted } from '@/lib/socketEmit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const expense = await prisma.expense.findUnique({
      where: { id },
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
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            status: true,
            location: true,
          },
        },
        validator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
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
    const { status: newStatus, validatedBy, ...updateData } = body;

    // Get current expense
    const currentExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!currentExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    const oldStatus = currentExpense.status;

    // Prepare update data
    const expenseUpdateData: any = {
      ...updateData,
    };

    // Handle status changes
    if (newStatus && newStatus !== oldStatus) {
      expenseUpdateData.status = newStatus;

      if (newStatus === 'APPROVED') {
        expenseUpdateData.validatedAt = new Date();
        if (validatedBy) {
          expenseUpdateData.validatedBy = validatedBy;
        }
      } else if (newStatus === 'PAID') {
        expenseUpdateData.paidAt = new Date();
      }
    }

    // Update expense and pole in a transaction
    const expense = await prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: expenseUpdateData,
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
      });

      // Update pole spentAmount if status changed to APPROVED
      if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
        await tx.pole.update({
          where: { id: currentExpense.poleId },
          data: {
            spentAmount: {
              increment: currentExpense.amount,
            },
          },
        });
      }

      return updatedExpense;
    });

    // Créer une notification si le statut a changé
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'APPROVED') {
        await createExpenseNotification(expense, 'approved', expense.userId);
      } else if (newStatus === 'REJECTED') {
        await createExpenseNotification(expense, 'rejected', expense.userId);
      } else if (newStatus === 'PAID') {
        await createExpenseNotification(expense, 'paid', expense.userId);
      }
    }

    // Émettre l'événement Socket.io
    emitExpenseUpdated(expense.listId, expense);

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get expense before deletion
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Delete expense and update pole in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.expense.delete({
        where: { id },
      });

      // Decrease pole spentAmount if expense was APPROVED or PAID
      if (expense.status === 'APPROVED' || expense.status === 'PAID') {
        await tx.pole.update({
          where: { id: expense.poleId },
          data: {
            spentAmount: {
              decrement: expense.amount,
            },
          },
        });
      }
    });

    // Émettre l'événement Socket.io
    emitExpenseDeleted(expense.listId, id);

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
