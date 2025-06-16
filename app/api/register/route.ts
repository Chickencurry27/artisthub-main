import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
        return new NextResponse("Missing fields", { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                hashedPassword,
                name,
            },
        });

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword: _, ...userWithoutPassword } = user;

        return new NextResponse(JSON.stringify({ user: userWithoutPassword }), {
            status: 201,
            headers: {
                "Set-Cookie": sessionCookie.serialize(),
            },
        });
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            (error as { code: unknown }).code === 'P2002'
        ) {
            return new NextResponse("A user with this email already exists.", { status: 409 });
        }
        console.error(error);
        return new NextResponse("An error occurred", { status: 500 });
    }
}