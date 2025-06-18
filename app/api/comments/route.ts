import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

interface Comment {
  id: string;
  projectId: string;
  songId: string;
  variationId: string;
  author: string;
  email?: string;
  content: string;
  userId?: string;
  createdAt: Date;
}

export async function POST(request: Request) {
  const { variationId, author, email, content } = await request.json();

  if (!variationId || !author || !content) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        variationId,
        author,
        email,
        content,
      },
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Failed to create comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}