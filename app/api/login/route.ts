import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return new NextResponse("Missing fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user || !user.hashedPassword) {
        return new NextResponse("Invalid credentials", { status: 400 });
    }

    const isValidPassword = await compare(password, user.hashedPassword);

    if (!isValidPassword) {
        return new NextResponse("Invalid credentials", { status: 400 });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userWithoutPassword } = user;

    return new NextResponse(JSON.stringify({ user: userWithoutPassword }), {
        status: 200,
        headers: {
            "Set-Cookie": sessionCookie.serialize(),
        },
    });
}