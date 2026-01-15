import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        console.log("POST /api/tasks: Constructing task for user", session.user.email);

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            console.error("POST /api/tasks: User not found in DB");
            return new NextResponse("User not found", { status: 404 });
        }

        // Destructure to ensure we don't pass an 'id' that might conflict with autoincrement
        const { id, ...taskData } = body;

        const task = await db.task.create({
            data: {
                ...taskData,
                userId: user.id,
            },
        });
        console.log("POST /api/tasks: Success, id:", task.id);
        return NextResponse.json(task);
    } catch (error: any) {
        console.error("POST /api/tasks: Internal Error", error.message || error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { id, ...data } = body;

        // Verify ownership
        const existingTask = await db.task.findUnique({ where: { id } });
        const user = await db.user.findUnique({ where: { email: session.user.email } });

        if (!existingTask || !user || existingTask.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        const task = await db.task.update({
            where: { id },
            data,
        });
        return NextResponse.json(task);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = parseInt(searchParams.get("id") || "");

        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        const existingTask = await db.task.findUnique({ where: { id } });

        if (!existingTask || !user || existingTask.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        await db.task.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
