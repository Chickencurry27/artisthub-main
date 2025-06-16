import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { name, description, clientId, status } = body;

  if (!name || !clientId) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description,
        clientId,
        status,
      },
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Failed to update project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.project.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}