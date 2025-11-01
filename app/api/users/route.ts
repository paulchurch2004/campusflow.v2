import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { emitTeamMemberAdded } from '@/lib/socketEmit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const listId = searchParams.get('listId');

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (listId) {
      where.listId = listId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        listId: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, avatar, role, listId } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        avatar,
        role: role || 'MEMBER',
        listId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        listId: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
    });

    // Émettre l'événement Socket.io si l'utilisateur appartient à une liste
    if (user.listId) {
      emitTeamMemberAdded(user.listId, user);
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
