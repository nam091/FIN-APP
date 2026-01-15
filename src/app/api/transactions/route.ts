import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        console.log("POST /api/transactions: Creating transaction for", session.user.email);

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            console.error("POST /api/transactions: User not found");
            return new NextResponse("User not found", { status: 404 });
        }

        // Strip id to let CUID/Autoincrement handle it
        const { id, ...txData } = body;

        const transaction = await db.transaction.create({
            data: {
                ...txData,
                userId: user.id,
            },
        });
        console.log("POST /api/transactions: Success, id:", transaction.id);
        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error("POST /api/transactions: Error", error.message || error);
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
        const existingTx = await db.transaction.findUnique({ where: { id } });

        if (!existingTx || !user || existingTx.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        const transaction = await db.transaction.update({
            where: { id },
            data,
        });
        return NextResponse.json(transaction);
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
        const existingTx = await db.transaction.findUnique({ where: { id } });

        if (!existingTx || !user || existingTx.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        await db.transaction.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
