import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listId = searchParams.get('listId') || 'default-list';

    // Get all poles with their budgets
    const poles = await prisma.pole.findMany({
      where: { listId },
      include: {
        _count: {
          select: {
            expenses: true,
            events: true,
          },
        },
      },
    });

    // Get expenses statistics
    const expenses = await prisma.expense.findMany({
      where: {
        pole: { listId },
      },
      include: {
        pole: true,
      },
    });

    // Get events statistics
    const events = await prisma.event.findMany({
      where: { listId },
    });

    // Get users count
    const usersCount = await prisma.user.count({
      where: { listId },
    });

    // Calculate total budget and spent
    const totalBudget = poles.reduce((sum, pole) => sum + pole.allocatedBudget, 0);
    const totalSpent = poles.reduce((sum, pole) => sum + pole.spentAmount, 0);

    // Count expenses by status
    const expensesByStatus = {
      pending: expenses.filter(e => e.status === 'PENDING').length,
      approved: expenses.filter(e => e.status === 'APPROVED').length,
      rejected: expenses.filter(e => e.status === 'REJECTED').length,
      paid: expenses.filter(e => e.status === 'PAID').length,
    };

    // Count events by status
    const eventsByStatus = {
      published: events.filter(e => e.status === 'PUBLISHED').length,
      draft: events.filter(e => e.status === 'DRAFT').length,
      cancelled: events.filter(e => e.status === 'CANCELLED').length,
    };

    // Get expenses by pole for chart
    const expensesByPole = poles.map(pole => ({
      name: pole.name,
      allocated: pole.allocatedBudget,
      spent: pole.spentAmount,
      color: pole.color,
      remaining: pole.allocatedBudget - pole.spentAmount,
    }));

    // Get recent expenses (last 7 days) for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentExpenses = await prisma.expense.findMany({
      where: {
        pole: { listId },
        requestedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        requestedAt: 'asc',
      },
    });

    // Group by date
    const expensesByDate: { [key: string]: number } = {};
    recentExpenses.forEach(expense => {
      const date = new Date(expense.requestedAt).toISOString().split('T')[0];
      expensesByDate[date] = (expensesByDate[date] || 0) + expense.amount;
    });

    const expensesTimeline = Object.entries(expensesByDate).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        listId,
        date: {
          gte: new Date(),
        },
        status: 'PUBLISHED',
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
      include: {
        pole: true,
      },
    });

    return NextResponse.json({
      summary: {
        totalBudget,
        totalSpent,
        remainingBudget: totalBudget - totalSpent,
        budgetUsagePercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        usersCount,
        polesCount: poles.length,
        expensesCount: expenses.length,
        eventsCount: events.length,
      },
      expensesByStatus,
      eventsByStatus,
      expensesByPole,
      expensesTimeline,
      upcomingEvents,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
