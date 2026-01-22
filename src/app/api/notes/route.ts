import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        console.log("POST /api/notes: Creating note for", session.user.email);

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            console.error("POST /api/notes: User not found");
            return new NextResponse("User not found", { status: 404 });
        }

        // Strip id
        const { id, ...noteData } = body;

        const note = await db.note.create({
            data: {
                ...noteData,
                userId: user.id,
            },
        });
        console.log("POST /api/notes: Success, id:", note.id);
        return NextResponse.json(note);
    } catch (error: any) {
        console.error("POST /api/notes: Error", error.message || error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
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
