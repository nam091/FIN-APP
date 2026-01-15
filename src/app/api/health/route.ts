import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    const health: any = {
        time: new Date().toISOString(),
        session: !!session,
        user: session?.user?.email || null,
        database: "unknown"
    };

    try {
        await db.$connect();
        const userCount = await db.user.count();
        health.database = "connected";
        health.userCount = userCount;
    } catch (error: any) {
        health.database = "error";
        health.error = error.message;
    } finally {
        await db.$disconnect();
    }

    return NextResponse.json(health);
}
