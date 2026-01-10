import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const note = await db.note.create({
            data: {
                ...body,
                userId: user.id,
            },
        });
        return NextResponse.json(note);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { id, ...data } = body;

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        const existingNote = await db.note.findUnique({ where: { id } });

        if (!existingNote || !user || existingNote.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        const note = await db.note.update({
            where: { id },
            data,
        });
        return NextResponse.json(note);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        const existingNote = await db.note.findUnique({ where: { id } });

        if (!existingNote || !user || existingNote.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        await db.note.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
