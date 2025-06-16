import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        client: true,
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        status,
        userId: user.id,
      },
    });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}