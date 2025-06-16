import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const { user } = await validateRequest();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({ user });
}