import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const comments = await prisma.comment.findMany({
      where: {
        variation: {
          song: {
            projectId: projectId,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}