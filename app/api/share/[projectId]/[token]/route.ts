import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; token: string } }
) {
  try {
    const { projectId, token } = params;

    // For now, we'll just check if the project exists
    // and return the project data. In a real-world scenario,
    // you would want to validate the token against a database.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        clients: true,
        songs: {
          include: {
            variations: true,
          },
        },
        user: true,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to fetch shared project:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}