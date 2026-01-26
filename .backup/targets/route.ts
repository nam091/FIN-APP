import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const targets = await db.target.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(targets);
    } catch (error: any) {
        console.error("GET /api/targets: Internal Error", error.message || error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        console.log("POST /api/targets: Creating target for user", session.user.email);

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            console.error("POST /api/targets: User not found in DB");
            return new NextResponse("User not found", { status: 404 });
        }

        // Destructure to ensure we don't pass an 'id' that might conflict
        const { id, ...targetData } = body;

        const target = await db.target.create({
            data: {
                ...targetData,
                userId: user.id,
            },
        });
        console.log("POST /api/targets: Success, id:", target.id);
        return NextResponse.json(target);
    } catch (error: any) {
        console.error("POST /api/targets: Internal Error", error.message || error);
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
        const existingTarget = await db.target.findUnique({ where: { id } });
        const user = await db.user.findUnique({ where: { email: session.user.email } });

        if (!existingTarget || !user || existingTarget.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        const target = await db.target.update({
            where: { id },
            data,
        });
        return NextResponse.json(target);
    } catch (error: any) {
        console.error("PUT /api/targets: Internal Error", error.message || error);
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
        const existingTarget = await db.target.findUnique({ where: { id } });

        if (!existingTarget || !user || existingTarget.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        await db.target.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("DELETE /api/targets: Internal Error", error.message || error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
