import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { date, value, note } = body;

        if (!date) return new NextResponse("Date is required", { status: 400 });

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const tracker = await db.tracker.findUnique({ where: { id } });
        if (!tracker || tracker.userId !== user.id) {
            return new NextResponse("Unauthorized or Not Found", { status: 403 });
        }

        // Upsert entry for this date
        const entry = await db.trackingEntry.upsert({
            where: {
                trackerId_date: {
                    trackerId: id,
                    date: date
                }
            },
            update: {
                value: value !== undefined ? value : 1,
                note: note,
            },
            create: {
                trackerId: id,
                date: date,
                value: value !== undefined ? value : 1,
                note: note,
            }
        });

        return NextResponse.json(entry);
    } catch (error: any) {
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
