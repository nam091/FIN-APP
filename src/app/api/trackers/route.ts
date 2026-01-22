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

        const trackers = await db.tracker.findMany({
            where: { userId: user.id },
            include: {
                entries: {
                    orderBy: { date: 'desc' },
                    take: 365 // Get last year of entries for default view
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(trackers);
    } catch (error: any) {
        console.error("GET /api/trackers error:", error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { title, icon, color, type, goal, unit, description } = body;

        if (!title) return new NextResponse("Title is required", { status: 400 });

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const tracker = await db.tracker.create({
            data: {
                title,
                icon: icon || "Activity",
                color: color || "blue",
                type: type || "habit", // habit, count
                goal: goal || 1,
                unit: unit,
                description,
                userId: user.id
            }
        });

        return NextResponse.json(tracker);
    } catch (error: any) {
        console.error("POST /api/trackers error:", error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
