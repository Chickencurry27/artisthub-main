import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        artistname,
        imageUrl,
      },
    });
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Failed to update client:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.client.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}