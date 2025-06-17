import { NextResponse } from "next/server";
import { generateShareToken } from "@/lib/share-utils";
import { validateRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { projectId } = await request.json();
  if (!projectId) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const token = generateShareToken();

  return NextResponse.json({ token });
}