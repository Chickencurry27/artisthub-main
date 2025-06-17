import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const clients = await prisma.client.findMany({
      where: { userId: user.id },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { name, email, phone, artistname, imageUrl } = body;

  if (!name || !email) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        artistname,
        imageUrl,
        userId: user.id,
      },
    });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: unknown }).code === 'P2002'
    ) {
      return NextResponse.json({ message: 'A client with this email already exists.' }, { status: 409 });
    }
    console.error('Failed to create client:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}