import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { id: bodyId, ...data } = body; // Exclude ID from update data

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        // Verify ownership
        const tracker = await db.tracker.findUnique({ where: { id } });
        if (!tracker || tracker.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        const updatedTracker = await db.tracker.update({
            where: { id },
            data,
        });

        return NextResponse.json(updatedTracker);
    } catch (error: any) {
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const tracker = await db.tracker.findUnique({ where: { id } });
        if (!tracker || tracker.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        await db.tracker.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
