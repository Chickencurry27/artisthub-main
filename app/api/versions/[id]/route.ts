import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Optional: Check if the user has permission to delete this variation
    const variation = await prisma.variation.findUnique({
      where: { id: params.id },
      select: { song: { select: { project: { select: { userId: true } } } } },
    });

    if (!variation || variation.song.project.userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.variation.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete variation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}