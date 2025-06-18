import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { name, variations, status } = body;

  if (!name && !status) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    const updatedSong = await prisma.song.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(variations && {
          variations: {
            deleteMany: {},
            create: variations.map((v: { name: string; url?: string; fileUrl?: string }) => ({
              name: v.name,
              url: v.fileUrl || v.url,
            })),
          },
        }),
      },
      include: {
        variations: true,
      },
    });
    return NextResponse.json(updatedSong);
  } catch (error) {
    console.error('Failed to update song:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.song.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete song:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}