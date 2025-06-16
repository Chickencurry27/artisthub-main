import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse('Missing projectId', { status: 400 });
  }

  try {
    const songs = await prisma.song.findMany({
      where: {
        projectId,
        project: {
          userId: user.id,
        },
      },
      include: {
        variations: true,
      },
    });
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { name, projectId, variations } = body;

  if (!name || !projectId) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    const newSong = await prisma.song.create({
      data: {
        name,
        projectId,
        variations: {
          create: variations,
        },
      },
    });
    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error('Failed to create song:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}