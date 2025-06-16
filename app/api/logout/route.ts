import { lucia, validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
    const { session } = await validateRequest();

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Set-Cookie": sessionCookie.serialize(),
        },
    });
}